'use strict';

const logger = require('../utils/logger');

module.exports = (err, req, res, _next) => {
  const status = err.status || 500;
  if (status >= 500) logger.error(err.stack || err.message);

  res.status(status).json({
    type:    'about:blank',
    title:   err.code || (status >= 500 ? 'INTERNAL_ERROR' : 'ERROR'),
    status,
    detail:  err.message,
    details: err.details,
    instance: req.originalUrl,
  });
};
