'use strict';

const express    = require('express');
const helmet     = require('helmet');
const cors       = require('cors');
const compression = require('compression');
const morgan     = require('morgan');

const config        = require('./config');
const logger        = require('./logger');
const { authenticate } = require('./jwt');
const buildLimiter  = require('./rateLimit');
const routes        = require('./routes');

const app = express();

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(compression());
app.use(morgan('combined', { stream: { write: (l) => logger.info(l.trim()) } }));

app.get('/health',          (_req, res) => res.json({ status: 'UP', service: 'api-gateway' }));
app.get('/actuator/health', (_req, res) => res.json({ status: 'UP' }));

app.use(buildLimiter());
app.use(authenticate);

routes(app);

app.use((req, res) => res.status(404).json({
  type: 'about:blank', title: 'NOT_FOUND', status: 404,
  detail: `no route for ${req.method} ${req.originalUrl}`,
}));

app.listen(config.port, () => {
  logger.info(`api-gateway listening on :${config.port}`);
  logger.info(`upstreams: ${JSON.stringify(config.upstream)}`);
});

process.on('unhandledRejection', (e) => logger.error('UnhandledRejection', { err: e && e.message }));
process.on('uncaughtException',  (e) => logger.error('UncaughtException',  { err: e && e.message }));
