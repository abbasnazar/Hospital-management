'use strict';

const { DataTypes } = require('sequelize');
const sequelize     = require('../db/sequelize');

module.exports = sequelize.define('Diagnosis', {
  id:          { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  encounterId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'encounter_id' },
  patientId:   { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'patient_id' },
  code:        { type: DataTypes.STRING(20),      allowNull: false },
  codeSystem:  { type: DataTypes.STRING(20),      allowNull: false, defaultValue: 'ICD10', field: 'code_system' },
  description: { type: DataTypes.STRING(300),     allowNull: false },
  severity:    { type: DataTypes.STRING(20),      allowNull: true  },
  onsetDate:   { type: DataTypes.DATEONLY,        allowNull: true,  field: 'onset_date' },
  createdAt:   { type: DataTypes.DATE,            allowNull: false, defaultValue: DataTypes.NOW, field: 'created_at' },
}, { tableName: 'clinical_diagnosis', timestamps: false });
