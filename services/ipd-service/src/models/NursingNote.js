'use strict';

const { DataTypes } = require('sequelize');
const sequelize     = require('../db/sequelize');

const NursingNote = sequelize.define('NursingNote', {
  id:          { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  admissionId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'admission_id' },
  patientId:   { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'patient_id' },
  nurseId:     { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'nurse_id' },
  noteType:    { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'OBSERVATION', field: 'note_type' },
  vitals:      { type: DataTypes.JSON, allowNull: true },
  medication:  { type: DataTypes.STRING(200), allowNull: true },
  note:        { type: DataTypes.TEXT, allowNull: true },
  recordedAt:  { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'recorded_at' },
  createdAt:   { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'created_at' },
}, {
  tableName: 'ipd_nursing_note',
  timestamps: false,
});

module.exports = NursingNote;
