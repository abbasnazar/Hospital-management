'use strict';

const { DataTypes } = require('sequelize');
const sequelize     = require('../db/sequelize');

const DailyMis = sequelize.define('DailyMis', {
  reportDate:     { type: DataTypes.DATEONLY,    primaryKey: true, field: 'report_date' },
  site:           { type: DataTypes.STRING(20),  primaryKey: true },
  opdCount:       { type: DataTypes.INTEGER,     allowNull: false, defaultValue: 0, field: 'opd_count' },
  ipdAdmissions:  { type: DataTypes.INTEGER,     allowNull: false, defaultValue: 0, field: 'ipd_admissions' },
  ipdDischarges:  { type: DataTypes.INTEGER,     allowNull: false, defaultValue: 0, field: 'ipd_discharges' },
  labOrders:      { type: DataTypes.INTEGER,     allowNull: false, defaultValue: 0, field: 'lab_orders' },
  rxDispensed:    { type: DataTypes.INTEGER,     allowNull: false, defaultValue: 0, field: 'rx_dispensed' },
  revenueGross:   { type: DataTypes.DECIMAL(14,2), allowNull: false, defaultValue: 0, field: 'revenue_gross' },
  revenueNet:     { type: DataTypes.DECIMAL(14,2), allowNull: false, defaultValue: 0, field: 'revenue_net' },
}, { tableName: 'reporting_daily_mis', timestamps: false });

module.exports = { sequelize, DailyMis };
