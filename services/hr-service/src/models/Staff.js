'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../db/sequelize');

module.exports = sequelize.define('Staff', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  employeeId: { type: DataTypes.STRING(40), allowNull: false, unique: true, field: 'employee_id' },
  firstName: { type: DataTypes.STRING(80), allowNull: false, field: 'first_name' },
  lastName: { type: DataTypes.STRING(80), allowNull: false, field: 'last_name' },
  designation: { type: DataTypes.STRING(80), allowNull: false },
  department: { type: DataTypes.STRING(80), allowNull: false },
  phone: { type: DataTypes.STRING(20), allowNull: true },
  email: { type: DataTypes.STRING(160), allowNull: true },
  status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'ACTIVE' },
  createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'created_at' },
}, { tableName: 'hr_staff', timestamps: false });
