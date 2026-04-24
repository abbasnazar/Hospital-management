'use strict';

const { DataTypes } = require('sequelize');
const sequelize     = require('../db/sequelize');

const Role = sequelize.define('Role', {
  id:          { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  code:        { type: DataTypes.STRING(40),  allowNull: false, unique: true },
  description: { type: DataTypes.STRING(200), allowNull: true },
}, {
  tableName: 'auth_role',
  timestamps: false,
});

module.exports = Role;
