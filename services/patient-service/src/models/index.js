'use strict';

const sequelize           = require('../db/sequelize');
const Patient             = require('./Patient');
const Appointment         = require('./Appointment');
const Consent             = require('./Consent');
const Insurance           = require('./Insurance');
const AppointmentSlot     = require('./AppointmentSlot');
const AppointmentWaitlist = require('./AppointmentWaitlist');

Patient.hasMany(Appointment,   { foreignKey: 'patient_id', as: 'appointments' });
Appointment.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

Patient.hasMany(Consent, { foreignKey: 'patient_id', as: 'consents' });
Consent.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

Patient.hasMany(Insurance, { foreignKey: 'patient_id', as: 'insurances' });
Insurance.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

AppointmentSlot.hasMany(AppointmentWaitlist, { foreignKey: 'doctor_id', as: 'waitlist' });

module.exports = { sequelize, Patient, Appointment, Consent, Insurance, AppointmentSlot, AppointmentWaitlist };
