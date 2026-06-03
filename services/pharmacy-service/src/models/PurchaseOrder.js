'use strict';
const { DataTypes } = require('sequelize');
const sequelize     = require('../db/sequelize');

module.exports = sequelize.define('PurchaseOrder', {
  id:         { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  supplierId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'supplier_id' },
  poNumber:   { type: DataTypes.STRING(40),  allowNull: false, unique: true, field: 'po_number' },
  poDate:     { type: DataTypes.DATEONLY,    allowNull: false, field: 'po_date' },
  expectedDelivery: { type: DataTypes.DATEONLY, allowNull: true, field: 'expected_delivery' },
  status:     { type: DataTypes.STRING(20),  allowNull: false, defaultValue: 'DRAFTED' },
  totalAmount:{ type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: 0, field: 'total_amount' },
  createdAt:  { type: DataTypes.DATE,        allowNull: false, defaultValue: DataTypes.NOW, field: 'created_at' },
}, { tableName: 'pharmacy_purchase_order', timestamps: false });
