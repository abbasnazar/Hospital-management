'use strict';
const { DataTypes } = require('sequelize');
const sequelize     = require('../db/sequelize');

module.exports = sequelize.define('RadiologyOrder', {
  id:         { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  patientId:  { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'patient_id' },
  doctorId:   { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'doctor_id' },
  modality:   { type: DataTypes.STRING(40),  allowNull: false },
  bodyPart:   { type: DataTypes.STRING(80),  allowNull: false, field: 'body_part' },
  indication: { type: DataTypes.STRING(300), allowNull: true },
  priority:   { type: DataTypes.STRING(10),  allowNull: false, defaultValue: 'ROUTINE' },
  status:     { type: DataTypes.STRING(20),  allowNull: false, defaultValue: 'ORDERED' },
  orderedAt:  { type: DataTypes.DATE,        allowNull: false, defaultValue: DataTypes.NOW, field: 'ordered_at' },
  completedAt:{ type: DataTypes.DATE,        allowNull: true, field: 'completed_at' },
}, { tableName: 'radiology_order', timestamps: false });
