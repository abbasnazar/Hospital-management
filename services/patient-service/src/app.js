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
  app.get('/health',          (_req, res) => res.json({ status: 'UP', service: 'patient-service' }));

  const patientRouter     = express.Router();
  require('./controllers/patient.controller')(patientRouter);
  app.use('/api/v1/patients', patientRouter);

  const apptRouter        = express.Router();
  require('./controllers/appointment.controller')(apptRouter);
  app.use('/api/v1/appointments', apptRouter);

  app.use(errorHandler);
  return app;
}

module.exports = createApp;
