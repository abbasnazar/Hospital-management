'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Prescription = sequelize.define('Prescription', {
    id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
    encounterId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    patientId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    doctorId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    status: { type: DataTypes.ENUM('DRAFT', 'ACTIVE', 'DISPENSING', 'COMPLETED', 'CANCELLED'), defaultValue: 'DRAFT' },
    clinicalNotes: { type: DataTypes.TEXT, allowNull: true },
    approvalNotes: { type: DataTypes.TEXT, allowNull: true },
    signedAt: { type: DataTypes.DATE, allowNull: true },
    cancelledAt: { type: DataTypes.DATE, allowNull: true },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, onUpdate: DataTypes.NOW },
  }, {
    tableName: 'prescription_prescription',
    timestamps: false,
  });

  return Prescription;
};
