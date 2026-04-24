'use strict';

const express = require('express');
const helmet  = require('helmet');
const cors    = require('cors');
const morgan  = require('morgan');
const logger  = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');

module.exports = function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '1mb' }));
  app.use(morgan('combined', { stream: { write: (l) => logger.info(l.trim()) } }));

  app.get('/actuator/health', (_req, res) => res.json({ status: 'UP' }));
  app.get('/health',          (_req, res) => res.json({ status: 'UP', service: 'billing-service' }));

  const router = express.Router();
  require('./controllers/billing.controller')(router);
  app.use('/api/v1', router);

  app.use(errorHandler);
  return app;
};
