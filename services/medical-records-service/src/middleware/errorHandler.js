'use strict';

const logger = require('../utils/logger');

module.exports = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  logger.error(`Error [${status}]: ${message}`, err);

  res.status(status).json({
    error: {
      status,
      message,
      timestamp: new Date().toISOString(),
      path: req.path,
    },
  });
};
