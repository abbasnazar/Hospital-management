'use strict';
const sequelize = require('../db/sequelize');
const DT = require('sequelize').DataTypes;

const Incident = sequelize.define('Incident', {
  id: { type: DT.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  patientId: { type: DT.BIGINT.UNSIGNED, allowNull: true, field: 'patient_id' },
  reportedBy: { type: DT.BIGINT.UNSIGNED, allowNull: false, field: 'reported_by' },
  incidentType: { type: DT.STRING(60), allowNull: false, field: 'incident_type' },
  description: { type: DT.STRING(500), allowNull: false },
  severity: { type: DT.STRING(20), allowNull: false, defaultValue: 'MEDIUM' },
  reportedAt: { type: DT.DATE, allowNull: false, defaultValue: DT.NOW, field: 'reported_at' },
  status: { type: DT.STRING(20), allowNull: false, defaultValue: 'OPEN' },
}, { tableName: 'quality_incident', timestamps: false });

const Infection = sequelize.define('Infection', {
  id: { type: DT.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  patientId: { type: DT.BIGINT.UNSIGNED, allowNull: false, field: 'patient_id' },
  infectionType: { type: DT.STRING(80), allowNull: false, field: 'infection_type' },
  organism: { type: DT.STRING(120), allowNull: true },
  recordedBy: { type: DT.BIGINT.UNSIGNED, allowNull: false, field: 'recorded_by' },
  recordedAt: { type: DT.DATE, allowNull: false, defaultValue: DT.NOW, field: 'recorded_at' },
}, { tableName: 'quality_infection', timestamps: false });

const NeedleStick = sequelize.define('NeedleStick', {
  id: { type: DT.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  staffId: { type: DT.BIGINT.UNSIGNED, allowNull: false, field: 'staff_id' },
  injuryDate: { type: DT.DATE, allowNull: false, field: 'injury_date' },
  exposureSource: { type: DT.STRING(120), allowNull: false, field: 'exposure_source' },
  pepInitiated: { type: DT.BOOLEAN, allowNull: false, defaultValue: false, field: 'pep_initiated' },
  reportedAt: { type: DT.DATE, allowNull: false, defaultValue: DT.NOW, field: 'reported_at' },
}, { tableName: 'quality_needle_stick', timestamps: false });

module.exports = { sequelize, Incident, Infection, NeedleStick };
