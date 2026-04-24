'use strict';

const { DataTypes } = require('sequelize');
const sequelize     = require('../db/sequelize');

const Invoice = sequelize.define('Invoice', {
  id:            { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  invoiceNo:     { type: DataTypes.STRING(40),      allowNull: false, unique: true, field: 'invoice_no' },
  patientId:     { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'patient_id' },
  encounterId:   { type: DataTypes.BIGINT.UNSIGNED, allowNull: true,  field: 'encounter_id' },
  status:        { type: DataTypes.STRING(20),      allowNull: false, defaultValue: 'OPEN' },
  subtotal:      { type: DataTypes.DECIMAL(12,2),   allowNull: false, defaultValue: 0 },
  taxAmount:     { type: DataTypes.DECIMAL(12,2),   allowNull: false, defaultValue: 0, field: 'tax_amount' },
  discount:      { type: DataTypes.DECIMAL(12,2),   allowNull: false, defaultValue: 0 },
  totalAmount:   { type: DataTypes.DECIMAL(12,2),   allowNull: false, defaultValue: 0, field: 'total_amount' },
  balanceDue:    { type: DataTypes.DECIMAL(12,2),   allowNull: false, defaultValue: 0, field: 'balance_due' },
  createdAt:     { type: DataTypes.DATE,            allowNull: false, defaultValue: DataTypes.NOW, field: 'created_at' },
  updatedAt:     { type: DataTypes.DATE,            allowNull: false, defaultValue: DataTypes.NOW, field: 'updated_at' },
}, { tableName: 'billing_invoice', timestamps: false });

const InvoiceItem = sequelize.define('InvoiceItem', {
  id:          { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  invoiceId:   { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'invoice_id' },
  itemType:    { type: DataTypes.STRING(20),      allowNull: false, field: 'item_type' },
  description: { type: DataTypes.STRING(200),     allowNull: false },
  qty:         { type: DataTypes.INTEGER,         allowNull: false, defaultValue: 1 },
  unitPrice:   { type: DataTypes.DECIMAL(10,2),   allowNull: false, field: 'unit_price' },
  tax:         { type: DataTypes.DECIMAL(10,2),   allowNull: false, defaultValue: 0 },
  total:       { type: DataTypes.DECIMAL(12,2),   allowNull: false },
}, { tableName: 'billing_invoice_item', timestamps: false });

const Payment = sequelize.define('Payment', {
  id:         { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  invoiceId:  { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'invoice_id' },
  method:     { type: DataTypes.STRING(20),      allowNull: false },
  amount:     { type: DataTypes.DECIMAL(12,2),   allowNull: false },
  txnRef:     { type: DataTypes.STRING(120),     allowNull: true,  field: 'txn_ref' },
  status:     { type: DataTypes.STRING(20),      allowNull: false, defaultValue: 'CAPTURED' },
  paidAt:     { type: DataTypes.DATE,            allowNull: false, defaultValue: DataTypes.NOW, field: 'paid_at' },
}, { tableName: 'billing_payment', timestamps: false });

const Claim = sequelize.define('InsuranceClaim', {
  id:           { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  invoiceId:    { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'invoice_id' },
  payerCode:    { type: DataTypes.STRING(40),      allowNull: false, field: 'payer_code' },
  claimNo:      { type: DataTypes.STRING(60),      allowNull: false, unique: true, field: 'claim_no' },
  amount:       { type: DataTypes.DECIMAL(12,2),   allowNull: false },
  status:       { type: DataTypes.STRING(20),      allowNull: false, defaultValue: 'SUBMITTED' },
  submittedAt:  { type: DataTypes.DATE,            allowNull: false, defaultValue: DataTypes.NOW, field: 'submitted_at' },
  decisionAt:   { type: DataTypes.DATE,            allowNull: true,  field: 'decision_at' },
  remarks:      { type: DataTypes.STRING(500),     allowNull: true  },
}, { tableName: 'billing_insurance_claim', timestamps: false });

Invoice.hasMany(InvoiceItem,   { foreignKey: 'invoice_id', as: 'items'    });
InvoiceItem.belongsTo(Invoice, { foreignKey: 'invoice_id', as: 'invoice'  });
Invoice.hasMany(Payment,       { foreignKey: 'invoice_id', as: 'payments' });
Payment.belongsTo(Invoice,     { foreignKey: 'invoice_id', as: 'invoice'  });
Invoice.hasMany(Claim,         { foreignKey: 'invoice_id', as: 'claims'   });
Claim.belongsTo(Invoice,       { foreignKey: 'invoice_id', as: 'invoice'  });

module.exports = { sequelize, Invoice, InvoiceItem, Payment, Claim };
