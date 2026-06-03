'use strict';

const { DataTypes } = require('sequelize');
const sequelize     = require('../db/sequelize');

const PermRole = sequelize.define('PermRole', {
  id:          { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  code:        { type: DataTypes.STRING(80),  allowNull: false },
  name:        { type: DataTypes.STRING(120), allowNull: false },
  description: { type: DataTypes.STRING(255), allowNull: true },
  orgId:       { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'org_id' },
  createdBy:   { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'created_by' },
  status:      { type: DataTypes.STRING(20),  allowNull: false, defaultValue: 'ACTIVE' },
  createdAt:   { type: DataTypes.DATE,        allowNull: false, defaultValue: DataTypes.NOW, field: 'created_at' },
  updatedAt:   { type: DataTypes.DATE,        allowNull: false, defaultValue: DataTypes.NOW, field: 'updated_at' },
}, {
  tableName: 'perm_role',
  timestamps: false,
  uniqueKeys: {
    uk_pr_org_code: {
      fields: ['orgId', 'code']
    }
  }
});

module.exports = PermRole;
