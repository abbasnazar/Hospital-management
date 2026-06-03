'use strict';

const { DataTypes } = require('sequelize');
const sequelize     = require('../db/sequelize');

const OpdTokenSeries = sequelize.define('OpdTokenSeries', {
  id:         { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  department: { type: DataTypes.STRING(80),  allowNull: false, unique: true },
  seriesName: { type: DataTypes.STRING(40),  allowNull: false, field: 'series_name' },
  currentNum: { type: DataTypes.INTEGER,     allowNull: false, defaultValue: 0, field: 'current_num' },
  resetDaily: { type: DataTypes.BOOLEAN,     allowNull: false, defaultValue: true, field: 'reset_daily' },
  status:     { type: DataTypes.STRING(20),  allowNull: false, defaultValue: 'ACTIVE' },
  createdAt:  { type: DataTypes.DATE,        allowNull: false, defaultValue: DataTypes.NOW, field: 'created_at' },
  updatedAt:  { type: DataTypes.DATE,        allowNull: false, defaultValue: DataTypes.NOW, field: 'updated_at' },
}, {
  tableName: 'opd_token_series',
  timestamps: false,
});

module.exports = OpdTokenSeries;
