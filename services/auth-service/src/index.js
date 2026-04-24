'use strict';

const config     = require('./config');
const logger     = require('./utils/logger');
const createApp  = require('./app');
const { sequelize } = require('./models');

(async () => {
  try {
    await sequelize.authenticate();
    logger.info('Connected to MySQL');
  } catch (err) {
    logger.error('MySQL connection failed', { err: err.message });
    process.exit(1);
  }

  const app = createApp();
  app.listen(config.port, () => {
    logger.info(`auth-service listening on :${config.port}`);
  });
})();

process.on('unhandledRejection', (e) => logger.error('UnhandledRejection', { err: e && e.message }));
process.on('uncaughtException',  (e) => logger.error('UncaughtException',  { err: e && e.message }));
