'use strict';

const { DataTypes } = require('sequelize');
const sequelize     = require('../db/sequelize');

const DietOrder = sequelize.define('DietOrder', {
  id:          { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  admissionId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'admission_id' },
  dietType:    { type: DataTypes.STRING(60),  allowNull: false, field: 'diet_type' },
  restrictions:{ type: DataTypes.STRING(500), allowNull: true },
  orderedBy:   { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'ordered_by' },
  orderedAt:   { type: DataTypes.DATE,        allowNull: false, defaultValue: DataTypes.NOW, field: 'ordered_at' },
  status:      { type: DataTypes.STRING(20),  allowNull: false, defaultValue: 'ACTIVE' },
  endedAt:     { type: DataTypes.DATE,        allowNull: true, field: 'ended_at' },
}, {
  tableName: 'ipd_diet_order',
  timestamps: false,
});

module.exports = DietOrder;
