'use strict';

const { createProxyMiddleware } = require('http-proxy-middleware');
const { propagate } = require('./jwt');
const config = require('./config');
const logger = require('./logger');

/**
 * When Express mounts middleware with app.use('/api/v1/auth', fn) it strips
 * the matched prefix before calling fn, so http-proxy-middleware would forward
 * only the suffix (e.g. '/login') to the upstream.  We must rewrite the path
 * back to the full URI that the downstream service expects.
 */
function proxy(target, prefix) {
  const rewrite = {};
  rewrite['^/'] = `${prefix}/`;   // e.g. '/login' → '/api/v1/auth/login'

  return createProxyMiddleware({
    target,
    changeOrigin: true,
    xfwd:         true,
    logLevel:     'warn',
    proxyTimeout: 30000,
    pathRewrite:  rewrite,
    on: {
      proxyReq: (proxyReq, req) => propagate(proxyReq, req),
      error:    (err, _req, res) => {
        logger.error('proxy error', { err: err.message, target });
        if (!res.headersSent) {
          res.status(502).json({ type: 'about:blank', title: 'BAD_GATEWAY', status: 502, detail: err.message });
        }
      },
    },
  });
}

/**
 * Path-prefix → upstream service mapping.
 * Each service owns the full /api/v1/<resource> path.
 * pathRewrite restores the prefix that Express strips before calling the proxy.
 */
module.exports = (app) => {
  app.use('/api/v1/auth',         proxy(config.upstream.auth,            '/api/v1/auth'));
  app.use('/api/v1/patients',     proxy(config.upstream.patient,         '/api/v1/patients'));
  app.use('/api/v1/appointments', proxy(config.upstream.patient,         '/api/v1/appointments'));
  app.use('/api/v1/clinical',     proxy(config.upstream.doctor,          '/api/v1/clinical'));
  app.use('/api/v1/lab',          proxy(config.upstream.lab,             '/api/v1/lab'));
  app.use('/api/v1/pharmacy',     proxy(config.upstream.pharmacy,        '/api/v1/pharmacy'));
  app.use('/api/v1/invoices',     proxy(config.upstream.billing,         '/api/v1/invoices'));
  app.use('/api/v1/payments',     proxy(config.upstream.billing,         '/api/v1/payments'));
  app.use('/api/v1/claims',       proxy(config.upstream.billing,         '/api/v1/claims'));
  app.use('/api/v1/reports',      proxy(config.upstream.reporting,       '/api/v1/reports'));
  app.use('/api/v1/prescriptions',   proxy(config.upstream.prescription,  '/api/v1/prescriptions'));
  app.use('/api/v1/medical-records', proxy(config.upstream.medicalRecords,'/api/v1/medical-records'));
  app.use('/api/v1/clinical-support',proxy(config.upstream.clinicalSupport,'/api/v1/clinical-support'));
  app.use('/api/v1/ipd',          proxy(config.upstream.ipd,             '/api/v1/ipd'));
  app.use('/api/v1/notifications',proxy(config.upstream.notification,    '/api/v1/notifications'));
  app.use('/api/v1/triage',       proxy(config.upstream.frontdesk,       '/api/v1/triage'));
  app.use('/api/v1/checkins',     proxy(config.upstream.frontdesk,       '/api/v1/checkins'));
  app.use('/api/v1/queue',        proxy(config.upstream.frontdesk,       '/api/v1/queue'));
  app.use('/api/v1/emergency',    proxy(config.upstream.frontdesk,       '/api/v1/emergency'));
  app.use('/api/v1/hr',           proxy(config.upstream.hr,              '/api/v1/hr'));
  app.use('/api/v1/assets',       proxy(config.upstream.assets,          '/api/v1/assets'));
  app.use('/api/v1/quality',      proxy(config.upstream.quality,         '/api/v1/quality'));
};
