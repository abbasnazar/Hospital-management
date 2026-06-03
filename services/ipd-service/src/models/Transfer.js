'use strict';

const { DataTypes } = require('sequelize');
const sequelize     = require('../db/sequelize');

const Transfer = sequelize.define('Transfer', {
  id:             { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  admissionId:    { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'admission_id' },
  patientId:      { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'patient_id' },
  fromBedId:      { type: DataTypes.BIGINT.UNSIGNED, allowNull: true, field: 'from_bed_id' },
  toBedId:        { type: DataTypes.BIGINT.UNSIGNED, allowNull: true, field: 'to_bed_id' },
  fromLocation:   { type: DataTypes.STRING(80), allowNull: true, field: 'from_location' },
  toLocation:     { type: DataTypes.STRING(80), allowNull: true, field: 'to_location' },
  reason:         { type: DataTypes.STRING(500), allowNull: true },
  doctorApproval: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'doctor_approval' },
  approvedBy:     { type: DataTypes.BIGINT.UNSIGNED, allowNull: true, field: 'approved_by' },
  transferredAt:  { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'transferred_at' },
  createdAt:      { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'created_at' },
}, {
  tableName: 'ipd_transfer',
  timestamps: false,
});

module.exports = Transfer;
