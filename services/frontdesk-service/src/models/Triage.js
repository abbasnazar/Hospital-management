'use strict';

const { DataTypes } = require('sequelize');
const sequelize     = require('../db/sequelize');

const Triage = sequelize.define('Triage', {
  id:               { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  patientId:        { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'patient_id' },
  appointmentId:    { type: DataTypes.BIGINT.UNSIGNED, allowNull: true,  field: 'appointment_id' },
  temperature:      { type: DataTypes.DECIMAL(4, 1), allowNull: true },
  pulse:            { type: DataTypes.INTEGER, allowNull: true },
  bpSystolic:       { type: DataTypes.INTEGER, allowNull: true, field: 'bp_systolic' },
  bpDiastolic:      { type: DataTypes.INTEGER, allowNull: true, field: 'bp_diastolic' },
  oxygenSaturation: { type: DataTypes.INTEGER, allowNull: true, field: 'oxygen_saturation' },
  weight:           { type: DataTypes.DECIMAL(5, 2), allowNull: true },
  height:           { type: DataTypes.DECIMAL(5, 2), allowNull: true },
  chiefComplaint:   { type: DataTypes.STRING(500), allowNull: true, field: 'chief_complaint' },
  priority:         { type: DataTypes.STRING(10), allowNull: false, defaultValue: 'GREEN' },
  status:           { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'WAITING' },
  triagedBy:        { type: DataTypes.BIGINT.UNSIGNED, allowNull: true, field: 'triaged_by' },
  createdAt:        { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'created_at' },
  updatedAt:        { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'updated_at' },
}, {
  tableName: 'frontdesk_triage',
  timestamps: false,
});

module.exports = Triage;
