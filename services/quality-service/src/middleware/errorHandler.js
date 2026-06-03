const { AppError } = require('../utils/errors');

module.exports = (err, _req, res, _next) => {
  if (err instanceof AppError) return res.status(err.status).json({ error: err.message });
  res.status(500).json({ error: 'Internal server error' });
};
