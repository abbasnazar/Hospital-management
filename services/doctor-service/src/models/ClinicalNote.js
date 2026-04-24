'use strict';

const { DataTypes } = require('sequelize');
const sequelize     = require('../db/sequelize');

module.exports = sequelize.define('ClinicalNote', {
  id:           { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  encounterId:  { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'encounter_id' },
  patientId:    { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'patient_id' },
  doctorId:     { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'doctor_id' },
  note:         { type: DataTypes.JSON,            allowNull: false },
  signedAt:     { type: DataTypes.DATE,            allowNull: true,  field: 'signed_at' },
  createdAt:    { type: DataTypes.DATE,            allowNull: false, defaultValue: DataTypes.NOW, field: 'created_at' },
  updatedAt:    { type: DataTypes.DATE,            allowNull: false, defaultValue: DataTypes.NOW, field: 'updated_at' },
}, { tableName: 'clinical_note', timestamps: false });
