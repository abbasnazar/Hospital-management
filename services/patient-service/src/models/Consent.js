'use strict';

const { DataTypes } = require('sequelize');
const sequelize     = require('../db/sequelize');

const Consent = sequelize.define('Consent', {
  id:          { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  patientId:   { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'patient_id' },
  type:        { type: DataTypes.STRING(80),  allowNull: false },
  description: { type: DataTypes.STRING(500), allowNull: true },
  signedBy:    { type: DataTypes.STRING(120), allowNull: true, field: 'signed_by' },
  signedAt:    { type: DataTypes.DATE,        allowNull: true, field: 'signed_at' },
  revokedAt:   { type: DataTypes.DATE,        allowNull: true, field: 'revoked_at' },
  createdAt:   { type: DataTypes.DATE,        allowNull: false, defaultValue: DataTypes.NOW, field: 'created_at' },
}, {
  tableName: 'patient_consent',
  timestamps: false,
});

module.exports = Consent;
