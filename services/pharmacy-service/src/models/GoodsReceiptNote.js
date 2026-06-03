'use strict';
const { DataTypes } = require('sequelize');
const sequelize     = require('../db/sequelize');

module.exports = sequelize.define('GoodsReceiptNote', {
  id:        { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  poId:      { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'po_id' },
  grnNumber: { type: DataTypes.STRING(40),      allowNull: false, unique: true, field: 'grn_number' },
  receivedAt:{ type: DataTypes.DATE,            allowNull: false, defaultValue: DataTypes.NOW, field: 'received_at' },
  totalItems:{ type: DataTypes.INTEGER,         allowNull: false, defaultValue: 0, field: 'total_items' },
  acceptedItems: { type: DataTypes.INTEGER,     allowNull: false, defaultValue: 0, field: 'accepted_items' },
  status:    { type: DataTypes.STRING(20),      allowNull: false, defaultValue: 'RECEIVED' },
}, { tableName: 'pharmacy_grn', timestamps: false });
