'use strict';

const logger = require('../utils/logger');

function requireSuperAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ type: 'about:blank', title: 'UNAUTHORIZED', status: 401, detail: 'missing token' });
  if (!req.user.roles.includes('SUPERADMIN')) {
    logger.warn('Access denied: user lacks SUPERADMIN role', { user: req.user.username, roles: req.user.roles });
    return res.status(403).json({ type: 'about:blank', title: 'FORBIDDEN', status: 403, detail: 'superadmin access required' });
  }
  next();
}

function requireAdminOrAbove(req, res, next) {
  if (!req.user) return res.status(401).json({ type: 'about:blank', title: 'UNAUTHORIZED', status: 401, detail: 'missing token' });
  if (!req.user.roles.includes('SUPERADMIN') && !req.user.roles.includes('ADMIN')) {
    logger.warn('Access denied: user lacks ADMIN/SUPERADMIN role', { user: req.user.username, roles: req.user.roles });
    return res.status(403).json({ type: 'about:blank', title: 'FORBIDDEN', status: 403, detail: 'admin access required' });
  }
  next();
}

module.exports = { requireSuperAdmin, requireAdminOrAbove };
