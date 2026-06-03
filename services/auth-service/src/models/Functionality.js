'use strict';

const { DataTypes } = require('sequelize');
const sequelize     = require('../db/sequelize');

const Functionality = sequelize.define('Functionality', {
  id:          { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  code:        { type: DataTypes.STRING(80),  allowNull: false, unique: true },
  label:       { type: DataTypes.STRING(120), allowNull: false },
  module:      { type: DataTypes.STRING(40),  allowNull: false },
  description: { type: DataTypes.STRING(255), allowNull: true },
  createdAt:   { type: DataTypes.DATE,        allowNull: false, defaultValue: DataTypes.NOW, field: 'created_at' },
}, {
  tableName: 'auth_functionality',
  timestamps: false,
});

module.exports = Functionality;
