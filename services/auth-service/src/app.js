'use strict';

const express   = require('express');
const helmet    = require('helmet');
const cors      = require('cors');
const morgan    = require('morgan');
const rateLimit = require('express-rate-limit');

const logger       = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');

function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '512kb' }));
  app.use(morgan('combined', {
    stream: { write: (line) => logger.info(line.trim()) },
  }));

  // --- Health ---------------------------------------------------------------
  app.get('/actuator/health', (_req, res) => res.json({ status: 'UP' }));
  app.get('/health',          (_req, res) => res.json({ status: 'UP', service: 'auth-service' }));

  // --- Auth routes ----------------------------------------------------------
  const router = express.Router();
  const loginLimiter = rateLimit({
    windowMs: 60 * 1000,
    max:      20,
    standardHeaders: true,
    legacyHeaders:   false,
  });
  router.use('/login',   loginLimiter);
  router.use('/refresh', loginLimiter);

  require('./controllers/auth.controller')(router);
  app.use('/api/v1/auth', router);

  app.use(errorHandler);
  return app;
}

module.exports = createApp;
