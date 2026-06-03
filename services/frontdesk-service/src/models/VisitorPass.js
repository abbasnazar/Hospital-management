'use strict';

const { DataTypes } = require('sequelize');
const sequelize     = require('../db/sequelize');

const VisitorPass = sequelize.define('VisitorPass', {
  id:          { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  patientId:   { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'patient_id' },
  visitorName: { type: DataTypes.STRING(120), allowNull: false, field: 'visitor_name' },
  relationship:{ type: DataTypes.STRING(40),  allowNull: true },
  passNumber:  { type: DataTypes.STRING(40),  allowNull: false, unique: true, field: 'pass_number' },
  issuedAt:    { type: DataTypes.DATE,        allowNull: false, defaultValue: DataTypes.NOW, field: 'issued_at' },
  validUntil:  { type: DataTypes.DATE,        allowNull: false, field: 'valid_until' },
  status:      { type: DataTypes.STRING(20),  allowNull: false, defaultValue: 'ACTIVE' },
}, {
  tableName: 'visitor_pass',
  timestamps: false,
});

module.exports = VisitorPass;
