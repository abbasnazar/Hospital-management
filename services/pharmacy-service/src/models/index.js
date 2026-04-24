'use strict';

const { DataTypes } = require('sequelize');
const sequelize     = require('../db/sequelize');

const Medicine = sequelize.define('Medicine', {
  id:            { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  sku:           { type: DataTypes.STRING(40),  allowNull: false, unique: true },
  name:          { type: DataTypes.STRING(200), allowNull: false },
  strength:      { type: DataTypes.STRING(60),  allowNull: true },
  form:          { type: DataTypes.STRING(40),  allowNull: true },
  schedule:      { type: DataTypes.STRING(10),  allowNull: true },
  unitPrice:     { type: DataTypes.DECIMAL(10,2), allowNull: false, defaultValue: 0, field: 'unit_price' },
  reorderLevel:  { type: DataTypes.INTEGER,    allowNull: false, defaultValue: 10, field: 'reorder_level' },
  active:        { type: DataTypes.BOOLEAN,    allowNull: false, defaultValue: true },
}, { tableName: 'pharmacy_medicine', timestamps: false });

const Batch = sequelize.define('Batch', {
  id:          { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  medicineId:  { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'medicine_id' },
  batchNo:     { type: DataTypes.STRING(40),      allowNull: false, field: 'batch_no' },
  expiryDate:  { type: DataTypes.DATEONLY,        allowNull: false, field: 'expiry_date' },
  qtyOnHand:   { type: DataTypes.INTEGER,         allowNull: false, defaultValue: 0, field: 'qty_on_hand' },
  costPrice:   { type: DataTypes.DECIMAL(10,2),   allowNull: false, defaultValue: 0, field: 'cost_price' },
}, { tableName: 'pharmacy_batch', timestamps: false });

const Prescription = sequelize.define('Prescription', {
  id:           { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  encounterId:  { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'encounter_id' },
  patientId:    { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'patient_id' },
  doctorId:     { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'doctor_id' },
  status:       { type: DataTypes.STRING(20),      allowNull: false, defaultValue: 'ACTIVE' },
  notes:        { type: DataTypes.STRING(500),     allowNull: true  },
  createdAt:    { type: DataTypes.DATE,            allowNull: false, defaultValue: DataTypes.NOW, field: 'created_at' },
}, { tableName: 'pharmacy_prescription', timestamps: false });

const PrescriptionItem = sequelize.define('PrescriptionItem', {
  id:              { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  prescriptionId:  { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'prescription_id' },
  medicineId:      { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'medicine_id' },
  dose:            { type: DataTypes.STRING(60),      allowNull: false },
  frequency:       { type: DataTypes.STRING(60),      allowNull: false },
  durationDays:    { type: DataTypes.INTEGER,         allowNull: false, defaultValue: 1, field: 'duration_days' },
  qty:             { type: DataTypes.INTEGER,         allowNull: false, defaultValue: 1 },
}, { tableName: 'pharmacy_prescription_item', timestamps: false });

const Dispense = sequelize.define('Dispense', {
  id:              { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  prescriptionId:  { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'prescription_id' },
  batchId:         { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'batch_id' },
  qty:             { type: DataTypes.INTEGER,         allowNull: false },
  dispensedBy:     { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'dispensed_by' },
  dispensedAt:     { type: DataTypes.DATE,            allowNull: false, defaultValue: DataTypes.NOW, field: 'dispensed_at' },
  totalPrice:      { type: DataTypes.DECIMAL(10,2),   allowNull: false, field: 'total_price' },
}, { tableName: 'pharmacy_dispense', timestamps: false });

Medicine.hasMany(Batch,                 { foreignKey: 'medicine_id', as: 'batches' });
Batch.belongsTo(Medicine,               { foreignKey: 'medicine_id', as: 'medicine' });
Prescription.hasMany(PrescriptionItem,  { foreignKey: 'prescription_id', as: 'items' });
PrescriptionItem.belongsTo(Prescription,{ foreignKey: 'prescription_id', as: 'prescription' });
PrescriptionItem.belongsTo(Medicine,    { foreignKey: 'medicine_id', as: 'medicine' });
Prescription.hasMany(Dispense,          { foreignKey: 'prescription_id', as: 'dispenses' });
Dispense.belongsTo(Batch,               { foreignKey: 'batch_id', as: 'batch' });

module.exports = { sequelize, Medicine, Batch, Prescription, PrescriptionItem, Dispense };
