'use strict';

require('dotenv').config();
const http = require('http');
const app = require('./app');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3006;

const server = http.createServer(app());

server.listen(PORT, () => {
  logger.info(`🏥 Prescription Service listening on port ${PORT}`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, gracefully shutting down...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});
