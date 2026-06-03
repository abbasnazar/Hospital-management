'use strict';

const logger = require('./logger');

module.exports = {
  error: (msg, err) => logger.error(`❌ ${msg}`, err),
  info: (msg) => logger.info(`ℹ️  ${msg}`),
  warn: (msg) => logger.warn(`⚠️  ${msg}`),
  debug: (msg) => logger.debug(`🐛 ${msg}`),
};
