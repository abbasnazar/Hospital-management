'use strict';
const sequelize = require('../db/sequelize');
const Staff = require('./Staff');
const Attendance = require('./Attendance');
const Leave = require('./Leave');

Staff.hasMany(Attendance, { foreignKey: 'staff_id', as: 'attendance' });
Staff.hasMany(Leave, { foreignKey: 'staff_id', as: 'leaves' });

module.exports = { sequelize, Staff, Attendance, Leave };
