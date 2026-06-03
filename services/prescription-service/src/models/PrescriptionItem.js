'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PrescriptionItem = sequelize.define('PrescriptionItem', {
    id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
    prescriptionId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    medicineId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    dose: { type: DataTypes.VARCHAR(60), allowNull: false },
    frequency: { type: DataTypes.VARCHAR(60), allowNull: false },
    durationDays: { type: DataTypes.INTEGER, defaultValue: 1 },
    qty: { type: DataTypes.INTEGER, defaultValue: 1 },
    instructions: { type: DataTypes.TEXT, allowNull: true },
    clinicalReason: { type: DataTypes.TEXT, allowNull: true },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, {
    tableName: 'prescription_item',
    timestamps: false,
  });

  return PrescriptionItem;
};
