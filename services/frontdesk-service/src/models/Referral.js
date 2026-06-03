'use strict';

const { DataTypes } = require('sequelize');
const sequelize     = require('../db/sequelize');

const ReferralOutward = sequelize.define('ReferralOutward', {
  id:         { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  patientId:  { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'patient_id' },
  doctorId:   { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'doctor_id' },
  referralTo: { type: DataTypes.STRING(120), allowNull: false, field: 'referral_to' },
  reason:     { type: DataTypes.STRING(500), allowNull: false },
  status:     { type: DataTypes.STRING(20),  allowNull: false, defaultValue: 'PENDING' },
  createdAt:  { type: DataTypes.DATE,        allowNull: false, defaultValue: DataTypes.NOW, field: 'created_at' },
}, {
  tableName: 'referral_outward',
  timestamps: false,
});

const ReferralInward = sequelize.define('ReferralInward', {
  id:          { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  patientId:   { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'patient_id' },
  referredFrom:{ type: DataTypes.STRING(120), allowNull: false, field: 'referred_from' },
  referredBy:  { type: DataTypes.STRING(120), allowNull: false, field: 'referred_by' },
  reason:      { type: DataTypes.STRING(500), allowNull: false },
  status:      { type: DataTypes.STRING(20),  allowNull: false, defaultValue: 'REGISTERED' },
  createdAt:   { type: DataTypes.DATE,        allowNull: false, defaultValue: DataTypes.NOW, field: 'created_at' },
}, {
  tableName: 'referral_inward',
  timestamps: false,
});

module.exports = { ReferralOutward, ReferralInward };
