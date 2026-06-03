'use strict';

const { DataTypes } = require('sequelize');
const sequelize     = require('../db/sequelize');

const AppointmentWaitlist = sequelize.define('AppointmentWaitlist', {
  id:            { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  patientId:     { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'patient_id' },
  doctorId:      { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'doctor_id' },
  preferredDate: { type: DataTypes.DATEONLY,        allowNull: false, field: 'preferred_date' },
  reason:        { type: DataTypes.STRING(200),     allowNull: true },
  position:      { type: DataTypes.INTEGER,         allowNull: false },
  status:        { type: DataTypes.STRING(20),      allowNull: false, defaultValue: 'WAITING' },
  notifiedAt:    { type: DataTypes.DATE,            allowNull: true, field: 'notified_at' },
  createdAt:     { type: DataTypes.DATE,            allowNull: false, defaultValue: DataTypes.NOW, field: 'created_at' },
}, {
  tableName: 'appointment_waitlist',
  timestamps: false,
});

module.exports = AppointmentWaitlist;
