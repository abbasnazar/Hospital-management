'use strict';

const { DataTypes } = require('sequelize');
const sequelize     = require('../db/sequelize');

const OTNotes = sequelize.define('OTNotes', {
  id:             { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  admissionId:    { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'admission_id' },
  surgeonId:      { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'surgeon_id' },
  preopFindings:  { type: DataTypes.STRING(500),     allowNull: true, field: 'preop_findings' },
  procedureDone:  { type: DataTypes.STRING(200),     allowNull: false, field: 'procedure_done' },
  intraopFindings:{ type: DataTypes.STRING(500),     allowNull: true, field: 'intraop_findings' },
  postopInstructions:{ type: DataTypes.STRING(500),  allowNull: true, field: 'postop_instructions' },
  recordedAt:     { type: DataTypes.DATE,            allowNull: false, defaultValue: DataTypes.NOW, field: 'recorded_at' },
}, {
  tableName: 'ipd_ot_notes',
  timestamps: false,
});

module.exports = OTNotes;
