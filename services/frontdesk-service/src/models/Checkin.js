'use strict';

const { DataTypes } = require('sequelize');
const sequelize     = require('../db/sequelize');

const Checkin = sequelize.define('Checkin', {
  id:            { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  patientId:     { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'patient_id' },
  appointmentId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true,  field: 'appointment_id' },
  tokenNo:       { type: DataTypes.STRING(20), allowNull: false, field: 'token_no' },
  status:        { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'BOOKED' },
  queuePosition: { type: DataTypes.INTEGER, allowNull: true, field: 'queue_position' },
  checkedInBy:   { type: DataTypes.BIGINT.UNSIGNED, allowNull: true, field: 'checked_in_by' },
  checkedInAt:   { type: DataTypes.DATE, allowNull: true, field: 'checked_in_at' },
  createdAt:     { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'created_at' },
  updatedAt:     { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'updated_at' },
}, {
  tableName: 'frontdesk_checkin',
  timestamps: false,
});

module.exports = Checkin;
