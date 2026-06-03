'use strict';

const { DataTypes } = require('sequelize');
const sequelize     = require('../db/sequelize');

const OTSchedule = sequelize.define('OTSchedule', {
  id:             { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  admissionId:    { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'admission_id' },
  scheduledDate:  { type: DataTypes.DATE,            allowNull: false, field: 'scheduled_date' },
  surgeonId:      { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'surgeon_id' },
  anaesthetistId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true, field: 'anaesthetist_id' },
  procedure:      { type: DataTypes.STRING(200),     allowNull: false },
  notes:          { type: DataTypes.STRING(500),     allowNull: true },
  status:         { type: DataTypes.STRING(20),      allowNull: false, defaultValue: 'SCHEDULED' },
  createdAt:      { type: DataTypes.DATE,            allowNull: false, defaultValue: DataTypes.NOW, field: 'created_at' },
}, {
  tableName: 'ipd_ot_schedule',
  timestamps: false,
});

module.exports = OTSchedule;
