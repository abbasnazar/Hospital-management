'use strict';

const { Sequelize } = require('sequelize');
const config        = require('../config');

module.exports = new Sequelize(
  config.db.database, config.db.username, config.db.password,
  {
    host: config.db.host, port: config.db.port, dialect: 'mysql',
    timezone: config.db.timezone,
    logging: false,
    pool: { max: 15, min: 0, idle: 10000, acquire: 30000 },
    define: { freezeTableName: true, underscored: true, timestamps: false },
  },
);
