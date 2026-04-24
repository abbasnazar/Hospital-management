'use strict';

const bcrypt       = require('bcryptjs');
const { User, Role } = require('../models');
const jwtSvc       = require('./jwt.service');
const totp         = require('./totp.service');
const config       = require('../config');
const { BadRequest, Unauthorized, Conflict, Locked } = require('../utils/errors');

async function register({ username, email, password, roles }) {
  const exists = await User.findOne({ where: { username } });
  if (exists) throw Conflict('username already taken');

  const hash = await bcrypt.hash(password, config.security.bcryptRounds);
  const user = await User.create({
    username, email, passwordHash: hash, status: 'ACTIVE',
  });

  const roleCodes = roles && roles.length ? roles : ['PATIENT'];
  const roleRows  = await Role.findAll({ where: { code: roleCodes } });
  await user.setRoles(roleRows);

  return { id: user.id, username: user.username, email: user.email, roles: roleCodes };
}

async function login({ username, password, otp }) {
  const user = await User.findOne({
    where: { username },
    include: [{ model: Role, as: 'roles' }],
  });
  if (!user)                         throw Unauthorized('invalid credentials');
  if (user.status !== 'ACTIVE')      throw Unauthorized(`account status ${user.status}`);
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    throw Locked(`account locked until ${user.lockedUntil.toISOString()}`);
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    user.failedAttempts += 1;
    if (user.failedAttempts >= config.security.lockoutThreshold) {
      user.lockedUntil = new Date(Date.now() + config.security.lockoutMinutes * 60 * 1000);
      user.failedAttempts = 0;
    }
    await user.save();
    throw Unauthorized('invalid credentials');
  }

  if (user.mfaEnabled) {
    if (!otp)                                     throw BadRequest('otp required');
    if (!totp.verify(user.mfaSecret, otp))        throw Unauthorized('invalid otp');
  }

  user.failedAttempts = 0;
  user.lockedUntil    = null;
  user.lastLoginAt    = new Date();
  await user.save();

  const accessToken       = jwtSvc.signAccessToken(user, user.roles || []);
  const { token: refresh } = jwtSvc.signRefreshToken(user);

  return {
    accessToken,
    refreshToken: refresh,
    tokenType:    'Bearer',
    expiresIn:    config.jwt.accessTtl,
    roles:        (user.roles || []).map((r) => r.code),
  };
}

async function refresh(refreshToken) {
  let decoded;
  try { decoded = jwtSvc.verify(refreshToken); }
  catch (e) { throw Unauthorized('invalid refresh token'); }
  if (decoded.type !== 'refresh') throw Unauthorized('wrong token type');

  const user = await User.findByPk(decoded.uid, { include: [{ model: Role, as: 'roles' }] });
  if (!user || user.status !== 'ACTIVE') throw Unauthorized('user not active');

  const accessToken = jwtSvc.signAccessToken(user, user.roles || []);
  return { accessToken, tokenType: 'Bearer', expiresIn: config.jwt.accessTtl };
}

async function enrolMfa(userId) {
  const user = await User.findByPk(userId);
  if (!user) throw Unauthorized('user not found');
  const { base32, otpauthUrl } = totp.generateSecret(user.username);
  user.mfaSecret  = base32;
  user.mfaEnabled = false;
  await user.save();
  return { secret: base32, otpauthUrl };
}

async function verifyMfa(userId, otp) {
  const user = await User.findByPk(userId);
  if (!user || !user.mfaSecret) throw BadRequest('mfa not enrolled');
  if (!totp.verify(user.mfaSecret, otp)) throw Unauthorized('invalid otp');
  user.mfaEnabled = true;
  await user.save();
  return { mfaEnabled: true };
}

module.exports = { register, login, refresh, enrolMfa, verifyMfa };
