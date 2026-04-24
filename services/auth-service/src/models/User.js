'use strict';

const { DataTypes } = require('sequelize');
const sequelize     = require('../db/sequelize');

const User = sequelize.define('User', {
  id:              { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  username:        { type: DataTypes.STRING(80),  allowNull: false, unique: true },
  email:           { type: DataTypes.STRING(160), allowNull: false, unique: true },
  passwordHash:    { type: DataTypes.STRING(200), allowNull: false, field: 'password_hash' },
  mfaSecret:       { type: DataTypes.STRING(64),  allowNull: true,  field: 'mfa_secret' },
  mfaEnabled:      { type: DataTypes.BOOLEAN,     allowNull: false, defaultValue: false, field: 'mfa_enabled' },
  status:          { type: DataTypes.STRING(20),  allowNull: false, defaultValue: 'ACTIVE' },
  failedAttempts:  { type: DataTypes.INTEGER,     allowNull: false, defaultValue: 0,   field: 'failed_attempts' },
  lockedUntil:     { type: DataTypes.DATE,        allowNull: true,  field: 'locked_until' },
  lastLoginAt:     { type: DataTypes.DATE,        allowNull: true,  field: 'last_login_at' },
  createdAt:       { type: DataTypes.DATE,        allowNull: false, defaultValue: DataTypes.NOW, field: 'created_at' },
  updatedAt:       { type: DataTypes.DATE,        allowNull: false, defaultValue: DataTypes.NOW, field: 'updated_at' },
}, {
  tableName: 'auth_user',
  timestamps: false,
});

module.exports = User;
