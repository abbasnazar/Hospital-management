'use strict';

const jwtSvc        = require('../services/jwt.service');
const { Unauthorized } = require('../utils/errors');

function authRequired(req, _res, next) {
  const hdr = req.headers.authorization || '';
  if (!hdr.startsWith('Bearer ')) return next(Unauthorized('missing bearer token'));

  try {
    const claims = jwtSvc.verify(hdr.substring(7));
    req.user = { id: claims.uid, username: claims.sub, roles: claims.roles || [], orgId: claims.orgId, funcs: claims.funcs || [] };
    next();
  } catch (e) { next(Unauthorized('invalid or expired token')); }
}

module.exports = authRequired;
