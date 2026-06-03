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
    auth:            process.env.AUTH_URL             || 'http://localhost:8081',
    patient:         process.env.PATIENT_URL          || 'http://localhost:8082',
    doctor:          process.env.DOCTOR_URL           || 'http://localhost:8083',
    lab:             process.env.LAB_URL              || 'http://localhost:8084',
    pharmacy:        process.env.PHARMACY_URL         || 'http://localhost:8085',
    billing:         process.env.BILLING_URL          || 'http://localhost:8086',
    reporting:       process.env.REPORTING_URL        || 'http://localhost:8087',
    prescription:    process.env.PRESCRIPTION_URL     || 'http://localhost:8088',
    medicalRecords:  process.env.MEDICAL_RECORDS_URL  || 'http://localhost:8089',
    clinicalSupport: process.env.CLINICAL_SUPPORT_URL || 'http://localhost:8090',
    ipd:             process.env.IPD_URL              || 'http://localhost:8091',
    notification:    process.env.NOTIFICATION_URL     || 'http://localhost:8092',
    frontdesk:       process.env.FRONTDESK_URL        || 'http://localhost:8093',
    hr:              process.env.HR_URL               || 'http://localhost:8094',
    assets:          process.env.ASSETS_URL           || 'http://localhost:8095',
    quality:         process.env.QUALITY_URL          || 'http://localhost:8096',
  },
};
