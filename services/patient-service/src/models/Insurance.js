'use strict';

const { DataTypes } = require('sequelize');
const sequelize     = require('../db/sequelize');

const Insurance = sequelize.define('Insurance', {
  id:        { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  patientId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'patient_id' },
  provider:  { type: DataTypes.STRING(120), allowNull: false },
  policyNo:  { type: DataTypes.STRING(80),  allowNull: false, field: 'policy_no' },
  memberId:  { type: DataTypes.STRING(80),  allowNull: true, field: 'member_id' },
  groupId:   { type: DataTypes.STRING(80),  allowNull: true, field: 'group_id' },
  validFrom: { type: DataTypes.DATEONLY,    allowNull: false, field: 'valid_from' },
  validUntil:{ type: DataTypes.DATEONLY,    allowNull: false, field: 'valid_until' },
  status:    { type: DataTypes.STRING(20),  allowNull: false, defaultValue: 'ACTIVE' },
  createdAt: { type: DataTypes.DATE,        allowNull: false, defaultValue: DataTypes.NOW, field: 'created_at' },
  updatedAt: { type: DataTypes.DATE,        allowNull: false, defaultValue: DataTypes.NOW, field: 'updated_at' },
}, {
  tableName: 'patient_insurance',
  timestamps: false,
});

module.exports = Insurance;
