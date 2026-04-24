'use strict';

const { DataTypes } = require('sequelize');
const sequelize     = require('../db/sequelize');

const Appointment = sequelize.define('Appointment', {
  id:         { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  patientId:  { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'patient_id' },
  doctorId:   { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'doctor_id' },
  slotStart:  { type: DataTypes.DATE,            allowNull: false, field: 'slot_start' },
  slotEnd:    { type: DataTypes.DATE,            allowNull: false, field: 'slot_end' },
  status:     { type: DataTypes.STRING(20),      allowNull: false, defaultValue: 'BOOKED' },
  reason:     { type: DataTypes.STRING(200),     allowNull: true  },
  createdAt:  { type: DataTypes.DATE,            allowNull: false, defaultValue: DataTypes.NOW, field: 'created_at' },
  updatedAt:  { type: DataTypes.DATE,            allowNull: false, defaultValue: DataTypes.NOW, field: 'updated_at' },
}, {
  tableName: 'patient_appointment',
  timestamps: false,
});

module.exports = Appointment;
