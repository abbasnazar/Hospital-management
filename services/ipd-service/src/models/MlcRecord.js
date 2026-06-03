'use strict';

const { DataTypes } = require('sequelize');
const sequelize     = require('../db/sequelize');

const MlcRecord = sequelize.define('MlcRecord', {
  id:           { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  admissionId:  { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'admission_id' },
  patientId:    { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'patient_id' },
  caseType:     { type: DataTypes.STRING(60),      allowNull: false, field: 'case_type' },
  injuryDetails:{ type: DataTypes.STRING(500),     allowNull: true, field: 'injury_details' },
  policeReported:{ type: DataTypes.BOOLEAN,        allowNull: false, defaultValue: false, field: 'police_reported' },
  policeStation:{ type: DataTypes.STRING(120),     allowNull: true, field: 'police_station' },
  firNumber:    { type: DataTypes.STRING(40),      allowNull: true, field: 'fir_number' },
  registeredAt: { type: DataTypes.DATE,            allowNull: false, defaultValue: DataTypes.NOW, field: 'registered_at' },
}, {
  tableName: 'ipd_mlc_record',
  timestamps: false,
});

module.exports = MlcRecord;
