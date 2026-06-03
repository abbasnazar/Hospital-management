'use strict';

const { DataTypes } = require('sequelize');
const sequelize     = require('../db/sequelize');

const BirthRecord = sequelize.define('BirthRecord', {
  id:          { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  admissionId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'admission_id' },
  motherId:    { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'mother_id' },
  childName:   { type: DataTypes.STRING(120),     allowNull: true, field: 'child_name' },
  dob:         { type: DataTypes.DATE,            allowNull: false },
  gender:      { type: DataTypes.CHAR(1),         allowNull: false },
  weight:      { type: DataTypes.DECIMAL(5,2),    allowNull: true },
  liveBirth:   { type: DataTypes.BOOLEAN,         allowNull: false, defaultValue: true, field: 'live_birth' },
  apgarScore:  { type: DataTypes.INTEGER,         allowNull: true, field: 'apgar_score' },
  registeredAt:{ type: DataTypes.DATE,            allowNull: false, defaultValue: DataTypes.NOW, field: 'registered_at' },
}, {
  tableName: 'ipd_birth_record',
  timestamps: false,
});

module.exports = BirthRecord;
