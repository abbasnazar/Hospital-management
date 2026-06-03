'use strict';

const { DataTypes } = require('sequelize');
const sequelize     = require('../db/sequelize');

const Patient = sequelize.define('Patient', {
  id:               { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  mrn:              { type: DataTypes.STRING(32),  allowNull: false, unique: true },
  firstName:        { type: DataTypes.STRING(80),  allowNull: false, field: 'first_name' },
  lastName:         { type: DataTypes.STRING(80),  allowNull: false, field: 'last_name' },
  dob:              { type: DataTypes.DATEONLY,    allowNull: false },
  gender:           { type: DataTypes.CHAR(1),     allowNull: false },
  phone:            { type: DataTypes.STRING(20),  allowNull: true  },
  email:            { type: DataTypes.STRING(160), allowNull: true  },
  address:          { type: DataTypes.TEXT,        allowNull: true  },
  emergencyContact: { type: DataTypes.STRING(120), allowNull: true,  field: 'emergency_contact' },
  bloodGroup:       { type: DataTypes.STRING(4),   allowNull: true,  field: 'blood_group' },
  visitCategory:    { type: DataTypes.STRING(20),  allowNull: false, defaultValue: 'OPD', field: 'visit_category' },
  version:          { type: DataTypes.BIGINT,      allowNull: false, defaultValue: 0 },
  createdAt:        { type: DataTypes.DATE,        allowNull: false, defaultValue: DataTypes.NOW, field: 'created_at' },
  updatedAt:        { type: DataTypes.DATE,        allowNull: false, defaultValue: DataTypes.NOW, field: 'updated_at' },
}, {
  tableName: 'patient_patient',
  timestamps: false,
});

module.exports = Patient;
