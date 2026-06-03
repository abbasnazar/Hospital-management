'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PrescriptionApprovalLog = sequelize.define('PrescriptionApprovalLog', {
    id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
    prescriptionId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    doctorId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    action: { type: DataTypes.ENUM('CREATED', 'MODIFIED', 'SIGNED', 'CANCELLED', 'APPROVED'), allowNull: false },
    comments: { type: DataTypes.TEXT, allowNull: true },
    timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, {
    tableName: 'prescription_approval_log',
    timestamps: false,
  });

  return PrescriptionApprovalLog;
};
