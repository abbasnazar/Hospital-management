'use strict';

const { DataTypes } = require('sequelize');
const sequelize     = require('../db/sequelize');

const Bed = sequelize.define('Bed', {
  id:        { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  wardId:    { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'ward_id' },
  bedNumber: { type: DataTypes.STRING(20), allowNull: false, field: 'bed_number' },
  status:    { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'AVAILABLE' },
  floor:     { type: DataTypes.STRING(20), allowNull: true },
}, {
  tableName: 'ipd_bed',
  timestamps: false,
});

module.exports = Bed;
