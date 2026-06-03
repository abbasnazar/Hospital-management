'use strict';
const { DataTypes } = require('sequelize');
const sequelize     = require('../db/sequelize');

module.exports = sequelize.define('Indent', {
  id:        { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  department:{ type: DataTypes.STRING(80),  allowNull: false },
  requestedBy: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'requested_by' },
  medicineId:{ type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'medicine_id' },
  quantity:  { type: DataTypes.INTEGER,     allowNull: false },
  reason:    { type: DataTypes.STRING(300), allowNull: true },
  status:    { type: DataTypes.STRING(20),  allowNull: false, defaultValue: 'PENDING' },
  approvedAt:{ type: DataTypes.DATE,        allowNull: true, field: 'approved_at' },
  createdAt: { type: DataTypes.DATE,        allowNull: false, defaultValue: DataTypes.NOW, field: 'created_at' },
}, { tableName: 'pharmacy_indent', timestamps: false });
