'use strict';

const { DataTypes } = require('sequelize');
const sequelize     = require('../db/sequelize');

const Queue = sequelize.define('Queue', {
  id:            { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  doctorId:      { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'doctor_id' },
  patientId:     { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'patient_id' },
  checkinId:     { type: DataTypes.BIGINT.UNSIGNED, allowNull: true,  field: 'checkin_id' },
  tokenNo:       { type: DataTypes.STRING(20), allowNull: true, field: 'token_no' },
  queuePosition: { type: DataTypes.INTEGER, allowNull: true, field: 'queue_position' },
  status:        { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'WAITING' },
  calledAt:      { type: DataTypes.DATE, allowNull: true, field: 'called_at' },
  startedAt:     { type: DataTypes.DATE, allowNull: true, field: 'started_at' },
  completedAt:   { type: DataTypes.DATE, allowNull: true, field: 'completed_at' },
  createdAt:     { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'created_at' },
  updatedAt:     { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'updated_at' },
}, {
  tableName: 'frontdesk_queue',
  timestamps: false,
});

module.exports = Queue;
