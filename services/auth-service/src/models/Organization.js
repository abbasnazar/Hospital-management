'use strict';

const { DataTypes } = require('sequelize');
const sequelize     = require('../db/sequelize');

const Organization = sequelize.define('Organization', {
  id:        { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  name:      { type: DataTypes.STRING(120), allowNull: false },
  category:  { type: DataTypes.STRING(80),  allowNull: false },
  createdBy: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true, field: 'created_by' },
  status:    { type: DataTypes.STRING(20),  allowNull: false, defaultValue: 'ACTIVE' },
  createdAt: { type: DataTypes.DATE,        allowNull: false, defaultValue: DataTypes.NOW, field: 'created_at' },
  updatedAt: { type: DataTypes.DATE,        allowNull: false, defaultValue: DataTypes.NOW, field: 'updated_at' },
}, {
  tableName: 'auth_organization',
  timestamps: false,
});

module.exports = Organization;
