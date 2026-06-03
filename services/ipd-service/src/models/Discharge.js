'use strict';

const { DataTypes } = require('sequelize');
const sequelize     = require('../db/sequelize');

const Discharge = sequelize.define('Discharge', {
  id:               { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  admissionId:      { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'admission_id' },
  dischargeType:    { type: DataTypes.STRING(20), allowNull: false, field: 'discharge_type' },
  dischargeSummary: { type: DataTypes.TEXT, allowNull: true, field: 'discharge_summary' },
  followUpDate:     { type: DataTypes.DATEONLY, allowNull: true, field: 'follow_up_date' },
  dischargedBy:     { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'discharged_by' },
  dischargedAt:     { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'discharged_at' },
}, {
  tableName: 'ipd_discharge',
  timestamps: false,
});

module.exports = Discharge;
