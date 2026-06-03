'use strict';

const { DataTypes } = require('sequelize');
const sequelize     = require('../db/sequelize');

const Ward = sequelize.define('Ward', {
  id:        { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  name:      { type: DataTypes.STRING(100), allowNull: false },
  totalBeds: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 20, field: 'total_beds' },
  category:  { type: DataTypes.STRING(40), allowNull: false },
  floor:     { type: DataTypes.STRING(20), allowNull: true },
  active:    { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
}, {
  tableName: 'ipd_ward',
  timestamps: false,
});

module.exports = Ward;
