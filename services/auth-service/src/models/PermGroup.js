'use strict';

const { DataTypes } = require('sequelize');
const sequelize     = require('../db/sequelize');

const PermGroup = sequelize.define('PermGroup', {
  id:          { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  name:        { type: DataTypes.STRING(120), allowNull: false },
  description: { type: DataTypes.STRING(255), allowNull: true },
  orgId:       { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'org_id' },
  createdBy:   { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'created_by' },
  status:      { type: DataTypes.STRING(20),  allowNull: false, defaultValue: 'ACTIVE' },
  createdAt:   { type: DataTypes.DATE,        allowNull: false, defaultValue: DataTypes.NOW, field: 'created_at' },
  updatedAt:   { type: DataTypes.DATE,        allowNull: false, defaultValue: DataTypes.NOW, field: 'updated_at' },
}, {
  tableName: 'perm_group',
  timestamps: false,
});

module.exports = PermGroup;
