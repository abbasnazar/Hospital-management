'use strict';
const { DataTypes } = require('sequelize');
const sequelize     = require('../db/sequelize');

module.exports = sequelize.define('RadiologyReport', {
  id:           { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  orderId:      { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'order_id' },
  radiologistId:{ type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'radiologist_id' },
  findings:     { type: DataTypes.TEXT,            allowNull: false },
  impression:   { type: DataTypes.STRING(500),     allowNull: false },
  recommendations:{ type: DataTypes.STRING(500),   allowNull: true },
  reportedAt:   { type: DataTypes.DATE,            allowNull: false, defaultValue: DataTypes.NOW, field: 'reported_at' },
}, { tableName: 'radiology_report', timestamps: false });
