'use strict';

const sequelize   = require('../db/sequelize');
const Patient     = require('./Patient');
const Appointment = require('./Appointment');

Patient.hasMany(Appointment,   { foreignKey: 'patient_id', as: 'appointments' });
Appointment.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

module.exports = { sequelize, Patient, Appointment };
