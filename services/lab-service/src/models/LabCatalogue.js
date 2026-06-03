'use strict';
const { DataTypes } = require('sequelize');
const sequelize     = require('../db/sequelize');

module.exports = sequelize.define('LabCatalogue', {
  id:           { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  code:         { type: DataTypes.STRING(30),  allowNull: false, unique: true },
  name:         { type: DataTypes.STRING(200), allowNull: false },
  specimen:     { type: DataTypes.STRING(60),  allowNull: true },
  loinc:        { type: DataTypes.STRING(20),  allowNull: true },
  price:        { type: DataTypes.DECIMAL(10,2), allowNull: false, defaultValue: 0 },
  refRange:     { type: DataTypes.STRING(80),  allowNull: true, field: 'reference_range' },
  active:       { type: DataTypes.BOOLEAN,     allowNull: false, defaultValue: true },
}, { tableName: 'lab_test', timestamps: false });
