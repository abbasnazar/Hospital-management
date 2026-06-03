'use strict';

const { DataTypes } = require('sequelize');
const sequelize     = require('../db/sequelize');

const DeathRecord = sequelize.define('DeathRecord', {
  id:          { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  admissionId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'admission_id' },
  patientId:   { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'patient_id' },
  deathTime:   { type: DataTypes.DATE,            allowNull: false, field: 'death_time' },
  deathCause:  { type: DataTypes.STRING(300),     allowNull: false, field: 'death_cause' },
  certifiedBy: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'certified_by' },
  registeredAt:{ type: DataTypes.DATE,            allowNull: false, defaultValue: DataTypes.NOW, field: 'registered_at' },
}, {
  tableName: 'ipd_death_record',
  timestamps: false,
});

module.exports = DeathRecord;
