'use strict';

require('dotenv').config();

module.exports = {
  port: parseInt(process.env.PORT || '8093', 10),
  env:  process.env.NODE_ENV || 'development',
  db: {
    host:     process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT || '3306', 10),
    database: process.env.DB_NAME     || 'hmis',
    username: process.env.DB_USER     || 'hmis',
    password: process.env.DB_PASS     || 'hmis',
    timezone: process.env.DB_TIMEZONE || '+05:30',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-me-change-me-change-me-please',
    issuer: process.env.JWT_ISSUER || 'hmis-auth',
  },
};
