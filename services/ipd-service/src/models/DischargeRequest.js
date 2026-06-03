'use strict';

const { DataTypes } = require('sequelize');
const sequelize     = require('../db/sequelize');

const DischargeRequest = sequelize.define('DischargeRequest', {
  id:               { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  admissionId:      { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'admission_id' },
  requestedBy:      { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'requested_by' },
  billingCleared:   { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'billing_cleared' },
  pharmacyCleared:  { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'pharmacy_cleared' },
  finalApproved:    { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'final_approved' },
  approvedBy:       { type: DataTypes.BIGINT.UNSIGNED, allowNull: true, field: 'approved_by' },
  status:           { type: DataTypes.STRING(25), allowNull: false, defaultValue: 'REQUESTED' },
  dischargeSummary: { type: DataTypes.TEXT, allowNull: true, field: 'discharge_summary' },
  createdAt:        { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'created_at' },
  updatedAt:        { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'updated_at' },
}, {
  tableName: 'ipd_discharge_request',
  timestamps: false,
});

module.exports = DischargeRequest;
