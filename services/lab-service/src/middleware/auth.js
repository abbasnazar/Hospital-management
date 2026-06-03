'use strict';

const jwt    = require('jsonwebtoken');
const config = require('../config');
const { Unauthorized, Forbidden } = require('../utils/errors');

/**
 * Accept authenticated requests two ways:
 *   1. Direct Bearer JWT (for dev / service-to-service)
 *   2. X-User-* headers propagated by the trusted API gateway after it has
 *      verified the JWT (standard path in production)
 */
function authRequired(req, _res, next) {
  const hdr = req.headers.authorization || '';
  if (hdr.startsWith('Bearer ')) {
    try {
      const c = jwt.verify(hdr.substring(7), config.jwt.secret, { issuer: config.jwt.issuer });
      req.user = { id: c.uid, username: c.sub, roles: c.roles || [] };
      return next();
    } catch (e) { return next(Unauthorized('invalid or expired token')); }
  }

  const gwUser  = req.headers['x-user-name'];
  const gwId    = req.headers['x-user-id'];
  const gwRoles = req.headers['x-user-roles'];
  if (gwUser && gwId) {
    req.user = {
      id:       parseInt(gwId, 10),
      username: String(gwUser),
      roles:    gwRoles ? String(gwRoles).split(',').filter(Boolean) : [],
    };
    return next();
  }
  next(Unauthorized('authentication required'));
}

function requireRoles(...allowed) {
  return (req, _res, next) => {
    if (!req.user) return next(Unauthorized('authentication required'));
    const has = req.user.roles.some((r) => allowed.includes(r));
    if (!has) return next(Forbidden(`requires role: ${allowed.join(', ')}`));
    next();
  };
}

module.exports = { authRequired, requireRoles };

function requireFunc(...funcs) { return (req, _res, next) => { if (!req.user) return next(Unauthorized("auth required")); const userFuncs = req.user.funcs || []; if (funcs.some(f => userFuncs.includes(f))) return next(); return next(Forbidden(`requires: ${funcs.join(", ")}`)); }; }
