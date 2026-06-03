'use strict';

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');

module.exports = function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '2mb' }));
  app.use(morgan('combined', { stream: { write: (l) => logger.info(l.trim()) } }));

  app.get('/actuator/health', (_req, res) => res.json({ status: 'UP' }));
  app.get('/health', (_req, res) => res.json({ status: 'UP', service: 'ipd-service' }));

  const mount = (path, controller) => {
    const router = express.Router();
    require(controller)(router);
    app.use(path, router);
  };

  mount('/api/v1/ipd/admissions', './controllers/admission.controller');
  mount('/api/v1/ipd/beds',       './controllers/bed.controller');
  mount('/api/v1/ipd/wards',      './controllers/ward.controller');
  mount('/api/v1/ipd/transfers',  './controllers/transfer.controller');
  mount('/api/v1/ipd/icu',        './controllers/icu.controller');
  mount('/api/v1/ipd/nursing',    './controllers/nursing.controller');
  mount('/api/v1/ipd/discharge',  './controllers/discharge.controller');

  app.use(errorHandler);
  return app;
};
