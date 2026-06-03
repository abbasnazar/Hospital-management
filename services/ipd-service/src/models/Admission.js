'use strict';

const { DataTypes } = require('sequelize');
const sequelize     = require('../db/sequelize');

const Admission = sequelize.define('Admission', {
  id:                 { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  patientId:          { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'patient_id' },
  doctorId:           { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'doctor_id' },
  bedId:              { type: DataTypes.BIGINT.UNSIGNED, allowNull: true,  field: 'bed_id' },
  admissionType:      { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'PLANNED', field: 'admission_type' },
  reason:             { type: DataTypes.STRING(500), allowNull: false },
  expectedStay:       { type: DataTypes.INTEGER, allowNull: true, field: 'expected_stay' },
  admittedBy:         { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'admitted_by' },
  admittedAt:         { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'admitted_at' },
  status:             { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'ACTIVE' },
  admissionNo:        { type: DataTypes.STRING(20), allowNull: true, field: 'admission_no' },
  admissionSource:    { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'PLANNED', field: 'admission_source' },
  department:         { type: DataTypes.STRING(80), allowNull: true },
  bedType:            { type: DataTypes.STRING(40), allowNull: true, field: 'bed_type' },
  emergencyId:        { type: DataTypes.BIGINT.UNSIGNED, allowNull: true, field: 'emergency_id' },
  consultingDoctorId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true, field: 'consulting_doctor_id' },
}, {
  tableName: 'ipd_admission',
  timestamps: false,
});

module.exports = Admission;
