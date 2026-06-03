'use strict';

const { DataTypes } = require('sequelize');
const sequelize     = require('../db/sequelize');

const AppointmentSlot = sequelize.define('AppointmentSlot', {
  id:              { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  doctorId:        { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'doctor_id' },
  dayOfWeek:       { type: DataTypes.STRING(10),  allowNull: false, field: 'day_of_week' },
  startTime:       { type: DataTypes.TIME,        allowNull: false, field: 'start_time' },
  endTime:         { type: DataTypes.TIME,        allowNull: false, field: 'end_time' },
  maxAppointments: { type: DataTypes.INTEGER,     allowNull: false, defaultValue: 1, field: 'max_appointments' },
  status:          { type: DataTypes.STRING(20),  allowNull: false, defaultValue: 'ACTIVE' },
  createdAt:       { type: DataTypes.DATE,        allowNull: false, defaultValue: DataTypes.NOW, field: 'created_at' },
  updatedAt:       { type: DataTypes.DATE,        allowNull: false, defaultValue: DataTypes.NOW, field: 'updated_at' },
}, {
  tableName: 'appointment_slot',
  timestamps: false,
});

module.exports = AppointmentSlot;
