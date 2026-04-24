'use strict';

const jwt    = require('jsonwebtoken');
const config = require('./config');

/**
 * Paths that bypass JWT validation at the gateway.
 * Everything else requires a valid Bearer token.
 */
const PUBLIC_PATHS = [
  /^\/api\/v1\/auth\/login$/,
  /^\/api\/v1\/auth\/register$/,
  /^\/api\/v1\/auth\/refresh$/,
  /^\/health$/,
  /^\/actuator\/health$/,
];

function isPublic(pathname) {
  return PUBLIC_PATHS.some((re) => re.test(pathname));
}

function problem(res, status, title, detail) {
  res.status(status).json({ type: 'about:blank', title, status, detail });
}

function authenticate(req, res, next) {
  if (isPublic(req.path)) return next();

  const hdr = req.headers.authorization || '';
  if (!hdr.startsWith('Bearer ')) return problem(res, 401, 'UNAUTHORIZED', 'missing bearer token');

  try {
    const claims = jwt.verify(hdr.substring(7), config.jwt.secret, { issuer: config.jwt.issuer });
    req.gwUser = {
      id:    claims.uid,
      name:  claims.sub,
      roles: claims.roles || [],
    };
    next();
  } catch (e) {
    return problem(res, 401, 'UNAUTHORIZED', 'invalid or expired token');
  }
}

function propagate(proxyReq, req) {
  if (req.gwUser) {
    proxyReq.setHeader('X-User-Id',    String(req.gwUser.id));
    proxyReq.setHeader('X-User-Name',  String(req.gwUser.name));
    proxyReq.setHeader('X-User-Roles', (req.gwUser.roles || []).join(','));
  }
}

module.exports = { authenticate, propagate, isPublic };
