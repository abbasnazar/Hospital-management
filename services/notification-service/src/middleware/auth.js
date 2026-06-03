'use strict';

const jwt = require('jsonwebtoken');
const { Unauthorized } = require('../utils/errors');

const authRequired = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) throw Unauthorized('Missing authorization header');

  const token = authHeader.split(' ')[1];
  if (!token) throw Unauthorized('Invalid authorization header');

  try {
    const decoded = jwt.decode(token);
    if (!decoded) throw Unauthorized('Invalid token');
    req.user = decoded;
    next();
  } catch (e) {
    throw Unauthorized('Token verification failed');
  }
};

const requireRoles = (...roles) => (req, res, next) => {
  if (!req.user) throw Unauthorized('User not authenticated');
  if (!req.user.roles || !req.user.roles.some(r => roles.includes(r))) {
    throw Unauthorized(`Requires one of: ${roles.join(', ')}`);
  }
  next();
};

module.exports = { authRequired, requireRoles };
