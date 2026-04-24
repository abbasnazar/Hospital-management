'use strict';

require('dotenv').config();

const config = {
  port:       parseInt(process.env.PORT || '8081', 10),
  env:        process.env.NODE_ENV || 'development',

  db: {
    host:     process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT || '3306', 10),
    database: process.env.DB_NAME     || 'hmis',
    username: process.env.DB_USER     || 'hmis',
    password: process.env.DB_PASS     || 'hmis',
    timezone: process.env.DB_TIMEZONE || '+05:30',
  },

  jwt: {
    secret:     process.env.JWT_SECRET     || 'dev-secret-change-me-change-me-change-me-please',
    issuer:     process.env.JWT_ISSUER     || 'hmis-auth',
    accessTtl:  parseInt(process.env.JWT_ACCESS_TTL  || '900',    10),
    refreshTtl: parseInt(process.env.JWT_REFRESH_TTL || '604800', 10),
  },

  security: {
    bcryptRounds:    parseInt(process.env.BCRYPT_ROUNDS || '10', 10),
    lockoutThreshold: parseInt(process.env.ACCOUNT_LOCKOUT_THRESHOLD || '5', 10),
    lockoutMinutes:   parseInt(process.env.ACCOUNT_LOCKOUT_MINUTES   || '15', 10),
  },
};

module.exports = config;
