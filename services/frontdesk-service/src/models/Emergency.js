'use strict';

const { DataTypes } = require('sequelize');
const sequelize     = require('../db/sequelize');

const Emergency = sequelize.define('Emergency', {
  id:                { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  emergencyNo:       { type: DataTypes.STRING(20), allowNull: false, unique: true, field: 'emergency_no' },
  patientId:         { type: DataTypes.BIGINT.UNSIGNED, allowNull: true, field: 'patient_id' },
  arrivalTime:       { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'arrival_time' },
  incidentType:      { type: DataTypes.STRING(100), allowNull: true, field: 'incident_type' },
  severity:          { type: DataTypes.STRING(10), allowNull: false, defaultValue: 'YELLOW' },
  broughtBy:         { type: DataTypes.STRING(120), allowNull: true, field: 'brought_by' },
  ambulanceNumber:   { type: DataTypes.STRING(40), allowNull: true, field: 'ambulance_number' },
  emergencyDoctorId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true, field: 'emergency_doctor_id' },
  status:            { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'WAITING' },
  createdAt:         { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'created_at' },
  updatedAt:         { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'updated_at' },
}, {
  tableName: 'frontdesk_emergency',
  timestamps: false,
});

module.exports = Emergency;
