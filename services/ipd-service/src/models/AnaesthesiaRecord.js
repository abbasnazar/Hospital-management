'use strict';

const { DataTypes } = require('sequelize');
const sequelize     = require('../db/sequelize');

const AnaesthesiaRecord = sequelize.define('AnaesthesiaRecord', {
  id:                { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  admissionId:       { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'admission_id' },
  anaesthetistId:    { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'anaesthetist_id' },
  anaesthesiaType:   { type: DataTypes.STRING(60),      allowNull: false, field: 'anaesthesia_type' },
  inductionAgent:    { type: DataTypes.STRING(80),      allowNull: true, field: 'induction_agent' },
  maintenanceAgent:  { type: DataTypes.STRING(80),      allowNull: true, field: 'maintenance_agent' },
  monitoringNotes:   { type: DataTypes.STRING(500),     allowNull: true, field: 'monitoring_notes' },
  recordedAt:        { type: DataTypes.DATE,            allowNull: false, defaultValue: DataTypes.NOW, field: 'recorded_at' },
}, {
  tableName: 'ipd_anaesthesia_record',
  timestamps: false,
});

module.exports = AnaesthesiaRecord;
