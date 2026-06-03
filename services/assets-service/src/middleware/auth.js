'use strict';
const jwt = require('jsonwebtoken');
const config = require('../config');
const { Unauthorized, Forbidden } = require('../utils/errors');

function authRequired(req, _res, next) {
  const hdr = req.headers.authorization || '';
  if (hdr.startsWith('Bearer ')) {
    try {
      const c = jwt.verify(hdr.substring(7), config.jwt.secret, { issuer: config.jwt.issuer });
      req.user = { id: c.uid, username: c.sub, roles: c.roles || [], funcs: c.funcs || [] };
      return next();
    } catch (e) { return next(Unauthorized('invalid or expired token')); }
  }

  const gwUser = req.headers['x-user-name'];
  const gwId = req.headers['x-user-id'];
  if (gwUser && gwId) {
    req.user = {
      id: parseInt(gwId, 10),
      username: String(gwUser),
      roles: (req.headers['x-user-roles'] || '').split(',').filter(Boolean),
      funcs: (req.headers['x-user-funcs'] || '').split(',').filter(Boolean),
    };
    return next();
  }
  next(Unauthorized('authentication required'));
}

function requireFunc(...funcs) {
  return (req, _res, next) => {
    if (!req.user) return next(Unauthorized('authentication required'));
    if (funcs.some(f => (req.user.funcs || []).includes(f))) return next();
    return next(Forbidden(`requires functionality: ${funcs.join(', ')}`));
  };
}

module.exports = { authRequired, requireFunc };
