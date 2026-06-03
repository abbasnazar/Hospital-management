'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../db/sequelize');

module.exports = sequelize.define('Leave', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  staffId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'staff_id' },
  leaveType: { type: DataTypes.STRING(40), allowNull: false, field: 'leave_type' },
  fromDate: { type: DataTypes.DATEONLY, allowNull: false, field: 'from_date' },
  toDate: { type: DataTypes.DATEONLY, allowNull: false, field: 'to_date' },
  reason: { type: DataTypes.STRING(300), allowNull: true },
  status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'PENDING' },
  approvedAt: { type: DataTypes.DATE, allowNull: true, field: 'approved_at' },
  approvedBy: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true, field: 'approved_by' },
  createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'created_at' },
}, { tableName: 'hr_leave', timestamps: false });
