'use strict';

const { DataTypes } = require('sequelize');
const sequelize     = require('../db/sequelize');

const Feedback = sequelize.define('Feedback', {
  id:        { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  patientId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'patient_id' },
  doctorId:  { type: DataTypes.BIGINT.UNSIGNED, allowNull: true, field: 'doctor_id' },
  department:{ type: DataTypes.STRING(80),  allowNull: true },
  rating:    { type: DataTypes.INTEGER,     allowNull: false },
  comments:  { type: DataTypes.STRING(500), allowNull: true },
  createdAt: { type: DataTypes.DATE,        allowNull: false, defaultValue: DataTypes.NOW, field: 'created_at' },
}, {
  tableName: 'patient_feedback',
  timestamps: false,
});

module.exports = Feedback;
