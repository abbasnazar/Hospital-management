'use strict';

const { DataTypes } = require('sequelize');
const sequelize     = require('../db/sequelize');

const IcuRecord = sequelize.define('IcuRecord', {
  id:               { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  admissionId:      { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'admission_id' },
  patientId:        { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'patient_id' },
  bedId:            { type: DataTypes.BIGINT.UNSIGNED, allowNull: true, field: 'bed_id' },
  assignedDoctorId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true, field: 'assigned_doctor_id' },
  assignedNurseId:  { type: DataTypes.BIGINT.UNSIGNED, allowNull: true, field: 'assigned_nurse_id' },
  critical:         { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  admittedToIcuAt:  { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'admitted_to_icu_at' },
  transferredOutAt: { type: DataTypes.DATE, allowNull: true, field: 'transferred_out_at' },
  status:           { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'ACTIVE' },
  createdAt:        { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'created_at' },
  updatedAt:        { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'updated_at' },
}, {
  tableName: 'ipd_icu_record',
  timestamps: false,
});

module.exports = IcuRecord;
