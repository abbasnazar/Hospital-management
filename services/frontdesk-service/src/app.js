'use strict';

const express = require('express');
const helmet  = require('helmet');
const cors    = require('cors');
const morgan  = require('morgan');
const logger  = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');

function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '1mb' }));
  app.use(morgan('combined', { stream: { write: (l) => logger.info(l.trim()) } }));

  app.get('/actuator/health', (_req, res) => res.json({ status: 'UP' }));
  app.get('/health',          (_req, res) => res.json({ status: 'UP', service: 'frontdesk-service' }));

  const triageRouter = express.Router();
  require('./controllers/triage.controller')(triageRouter);
  require('./controllers/frontdesk-extended.controller')(triageRouter);
  app.use('/api/v1/triage', triageRouter);

  const checkinRouter = express.Router();
  require('./controllers/checkin.controller')(checkinRouter);
  app.use('/api/v1/checkins', checkinRouter);

  const queueRouter = express.Router();
  require('./controllers/queue.controller')(queueRouter);
  app.use('/api/v1/queue', queueRouter);

  const emergencyRouter = express.Router();
  require('./controllers/emergency.controller')(emergencyRouter);
  app.use('/api/v1/emergency', emergencyRouter);

  app.use(errorHandler);
  return app;
}

module.exports = createApp;
