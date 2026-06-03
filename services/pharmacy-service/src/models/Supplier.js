'use strict';
const { DataTypes } = require('sequelize');
const sequelize     = require('../db/sequelize');

module.exports = sequelize.define('Supplier', {
  id:     { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  name:   { type: DataTypes.STRING(120), allowNull: false },
  contact:{ type: DataTypes.STRING(80),  allowNull: true, field: 'contact_person' },
  phone:  { type: DataTypes.STRING(20),  allowNull: true },
  email:  { type: DataTypes.STRING(160), allowNull: true },
  address:{ type: DataTypes.TEXT,        allowNull: true },
  status: { type: DataTypes.STRING(20),  allowNull: false, defaultValue: 'ACTIVE' },
  createdAt: { type: DataTypes.DATE,     allowNull: false, defaultValue: DataTypes.NOW, field: 'created_at' },
}, { tableName: 'pharmacy_supplier', timestamps: false });
