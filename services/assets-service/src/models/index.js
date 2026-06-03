'use strict';
const sequelize = require('../db/sequelize');

const Asset = sequelize.define('Asset', {
  id: { type: require('sequelize').DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  assetCode: { type: require('sequelize').DataTypes.STRING(40), allowNull: false, unique: true, field: 'asset_code' },
  assetName: { type: require('sequelize').DataTypes.STRING(120), allowNull: false, field: 'asset_name' },
  category: { type: require('sequelize').DataTypes.STRING(60), allowNull: false },
  location: { type: require('sequelize').DataTypes.STRING(120), allowNull: false },
  serialNo: { type: require('sequelize').DataTypes.STRING(80), allowNull: true, field: 'serial_no' },
  purchaseDate: { type: require('sequelize').DataTypes.DATEONLY, allowNull: false, field: 'purchase_date' },
  purchaseCost: { type: require('sequelize').DataTypes.DECIMAL(12,2), allowNull: false, field: 'purchase_cost' },
  status: { type: require('sequelize').DataTypes.STRING(20), allowNull: false, defaultValue: 'ACTIVE' },
  createdAt: { type: require('sequelize').DataTypes.DATE, allowNull: false, defaultValue: require('sequelize').DataTypes.NOW, field: 'created_at' },
}, { tableName: 'asset_register', timestamps: false });

const Maintenance = sequelize.define('Maintenance', {
  id: { type: require('sequelize').DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  assetId: { type: require('sequelize').DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'asset_id' },
  maintenanceType: { type: require('sequelize').DataTypes.STRING(60), allowNull: false, field: 'maintenance_type' },
  requestedBy: { type: require('sequelize').DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'requested_by' },
  requestDate: { type: require('sequelize').DataTypes.DATE, allowNull: false, defaultValue: require('sequelize').DataTypes.NOW, field: 'request_date' },
  status: { type: require('sequelize').DataTypes.STRING(20), allowNull: false, defaultValue: 'OPEN' },
  completedAt: { type: require('sequelize').DataTypes.DATE, allowNull: true, field: 'completed_at' },
  notes: { type: require('sequelize').DataTypes.STRING(500), allowNull: true },
}, { tableName: 'asset_maintenance', timestamps: false });

module.exports = { sequelize, Asset, Maintenance };
