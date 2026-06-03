'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../db/sequelize');

module.exports = sequelize.define('Attendance', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  staffId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'staff_id' },
  attendanceDate: { type: DataTypes.DATEONLY, allowNull: false, field: 'attendance_date' },
  status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'PRESENT' },
  markedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'marked_at' },
}, { tableName: 'hr_attendance', timestamps: false });
