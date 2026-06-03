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
      req.user = { id: c.uid, username: c.sub, roles: c.roles || [], funcs: c.funcs || [] };
      return next();
    } catch (e) { return next(Unauthorized('invalid or expired token')); }
  }

  const gwUser  = req.headers['x-user-name'];
  const gwId    = req.headers['x-user-id'];
  const gwRoles = req.headers['x-user-roles'];
  const gwFuncs = req.headers['x-user-funcs'];
  if (gwUser && gwId) {
    req.user = {
      id:       parseInt(gwId, 10),
      username: String(gwUser),
      roles:    gwRoles ? String(gwRoles).split(',').filter(Boolean) : [],
      funcs:    gwFuncs ? String(gwFuncs).split(',').filter(Boolean) : [],
    };
    return next();
  }
  next(Unauthorized('authentication required'));
}

// Role-to-functionality mapping used as fallback when a user has no system role
// (custom permission-role users) but has been granted equivalent funcs.
const ROLE_FUNCS = {
  ADMIN:  ['ipd.admissions','ipd.beds','ipd.discharge','ipd.wards','transfer.manage','icu.manage','nursing.notes'],
  DOCTOR: ['ipd.admissions','ipd.discharge','transfer.manage','icu.manage'],
  NURSE:  ['ipd.beds','ipd.wards','nursing.notes','icu.manage'],
};

function requireRoles(...allowed) {
  return (req, _res, next) => {
    if (!req.user) return next(Unauthorized('authentication required'));
    if (req.user.roles.some((r) => allowed.includes(r))) return next();
    const userFuncs = req.user.funcs || [];
    for (const role of allowed) {
      const needed = ROLE_FUNCS[role];
      if (!needed) continue;
      if (needed.some((f) => userFuncs.includes(f))) return next();
    }
    return next(Forbidden(`requires role: ${allowed.join(', ')}`));
  };
}


function requireFunc(...funcs) {
  return (req, _res, next) => {
    if (!req.user) return next(Unauthorized('authentication required'));
    const userFuncs = req.user.funcs || [];
    if (funcs.some(f => userFuncs.includes(f))) return next();
    return next(Forbidden(`requires functionality: ${funcs.join(', ')}`));
  };
}

module.exports = { authRequired, requireRoles, requireFunc };
