'use strict';

const jwt    = require('jsonwebtoken');
const { v4: uuid } = require('uuid');
const config = require('../config');

function signAccessToken(user, roles, functionalities) {
  const payload = {
    sub:   user.username,
    uid:   user.id,
    email: user.email,
    orgId: user.orgId,
    roles: roles.map((r) => r.code),
    funcs: (functionalities || []).map((f) => f.code || f),
    type:  'access',
  };
  return jwt.sign(payload, config.jwt.secret, {
    issuer:    config.jwt.issuer,
    expiresIn: config.jwt.accessTtl,
    jwtid:     uuid(),
  });
}

function signRefreshToken(user) {
  const jti = uuid();
  const token = jwt.sign(
    { sub: user.username, uid: user.id, type: 'refresh' },
    config.jwt.secret,
    {
      issuer:    config.jwt.issuer,
      expiresIn: config.jwt.refreshTtl,
      jwtid:     jti,
    },
  );
  return { token, jti };
}

function verify(token) {
  return jwt.verify(token, config.jwt.secret, { issuer: config.jwt.issuer });
}

module.exports = { signAccessToken, signRefreshToken, verify };
