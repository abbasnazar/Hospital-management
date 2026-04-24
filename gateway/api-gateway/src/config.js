'use strict';

require('dotenv').config();

module.exports = {
  port: parseInt(process.env.PORT || '8080', 10),
  env:  process.env.NODE_ENV || 'development',

  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-me-change-me-change-me-please',
    issuer: process.env.JWT_ISSUER || 'hmis-auth',
  },

  redis: { url: process.env.REDIS_URL || '' },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
    max:      parseInt(process.env.RATE_LIMIT_MAX       || '600',   10),
  },

  upstream: {
    auth:      process.env.AUTH_URL      || 'http://localhost:8081',
    patient:   process.env.PATIENT_URL   || 'http://localhost:8082',
    doctor:    process.env.DOCTOR_URL    || 'http://localhost:8083',
    lab:       process.env.LAB_URL       || 'http://localhost:8084',
    pharmacy:  process.env.PHARMACY_URL  || 'http://localhost:8085',
    billing:   process.env.BILLING_URL   || 'http://localhost:8086',
    reporting: process.env.REPORTING_URL || 'http://localhost:8087',
  },
};
