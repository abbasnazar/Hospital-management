'use strict';

const { DataTypes } = require('sequelize');
const sequelize     = require('../db/sequelize');

const LabTest = sequelize.define('LabTest', {
  id:       { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  code:     { type: DataTypes.STRING(30),  allowNull: false, unique: true },
  name:     { type: DataTypes.STRING(200), allowNull: false },
  specimen: { type: DataTypes.STRING(60),  allowNull: true  },
  loinc:    { type: DataTypes.STRING(20),  allowNull: true  },
  price:    { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
  active:   { type: DataTypes.BOOLEAN,     allowNull: false, defaultValue: true },
}, { tableName: 'lab_test', timestamps: false });

const LabOrder = sequelize.define('LabOrder', {
  id:          { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  patientId:   { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'patient_id' },
  doctorId:    { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'doctor_id' },
  encounterId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true,  field: 'encounter_id' },
  testCode:    { type: DataTypes.STRING(30),      allowNull: false, field: 'test_code' },
  priority:    { type: DataTypes.STRING(10),      allowNull: false, defaultValue: 'ROUTINE' },
  status:      { type: DataTypes.STRING(20),      allowNull: false, defaultValue: 'ORDERED' },
  orderedAt:   { type: DataTypes.DATE,            allowNull: false, defaultValue: DataTypes.NOW, field: 'ordered_at' },
  updatedAt:   { type: DataTypes.DATE,            allowNull: false, defaultValue: DataTypes.NOW, field: 'updated_at' },
}, { tableName: 'lab_order', timestamps: false });

const LabSample = sequelize.define('LabSample', {
  id:          { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  orderId:     { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'order_id' },
  barcode:     { type: DataTypes.STRING(64),      allowNull: false, unique: true },
  collectedAt: { type: DataTypes.DATE,            allowNull: true,  field: 'collected_at' },
  receivedAt:  { type: DataTypes.DATE,            allowNull: true,  field: 'received_at' },
  status:      { type: DataTypes.STRING(20),      allowNull: false, defaultValue: 'COLLECTED' },
}, { tableName: 'lab_sample', timestamps: false });

const LabResult = sequelize.define('LabResult', {
  id:              { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  sampleId:        { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'sample_id' },
  analyteCode:     { type: DataTypes.STRING(30),      allowNull: false, field: 'analyte_code' },
  value:           { type: DataTypes.STRING(200),     allowNull: false },
  unit:            { type: DataTypes.STRING(40),      allowNull: true  },
  referenceRange:  { type: DataTypes.STRING(80),      allowNull: true,  field: 'reference_range' },
  abnormalFlag:    { type: DataTypes.STRING(4),       allowNull: true,  field: 'abnormal_flag' },
  verifiedBy:      { type: DataTypes.BIGINT.UNSIGNED, allowNull: true,  field: 'verified_by' },
  reportedAt:      { type: DataTypes.DATE,            allowNull: false, defaultValue: DataTypes.NOW, field: 'reported_at' },
}, { tableName: 'lab_result', timestamps: false });

LabOrder.hasMany(LabSample,    { foreignKey: 'order_id',  as: 'samples' });
LabSample.belongsTo(LabOrder,  { foreignKey: 'order_id',  as: 'order'   });
LabSample.hasMany(LabResult,   { foreignKey: 'sample_id', as: 'results' });
LabResult.belongsTo(LabSample, { foreignKey: 'sample_id', as: 'sample'  });

module.exports = { sequelize, LabTest, LabOrder, LabSample, LabResult };
