'use strict';

const sequelize        = require('../db/sequelize');
const Ward             = require('./Ward');
const Bed              = require('./Bed');
const Admission        = require('./Admission');
const Transfer         = require('./Transfer');
const IcuRecord        = require('./IcuRecord');
const NursingNote      = require('./NursingNote');
const DischargeRequest = require('./DischargeRequest');
const Discharge        = require('./Discharge');
const DietOrder        = require('./DietOrder');
const OTSchedule       = require('./OTSchedule');
const OTNotes          = require('./OTNotes');
const AnaesthesiaRecord= require('./AnaesthesiaRecord');
const BirthRecord      = require('./BirthRecord');
const DeathRecord      = require('./DeathRecord');
const MlcRecord        = require('./MlcRecord');

Ward.hasMany(Bed,   { foreignKey: 'ward_id', as: 'beds' });
Bed.belongsTo(Ward, { foreignKey: 'ward_id', as: 'ward' });

Admission.belongsTo(Bed, { foreignKey: 'bed_id', as: 'bed' });

Admission.hasMany(Transfer,         { foreignKey: 'admission_id', as: 'transfers' });
Admission.hasMany(IcuRecord,        { foreignKey: 'admission_id', as: 'icuRecords' });
Admission.hasMany(NursingNote,      { foreignKey: 'admission_id', as: 'nursingNotes' });
Admission.hasMany(DischargeRequest, { foreignKey: 'admission_id', as: 'dischargeRequests' });
Admission.hasMany(Discharge,        { foreignKey: 'admission_id', as: 'discharges' });
Admission.hasMany(DietOrder,        { foreignKey: 'admission_id', as: 'dietOrders' });
Admission.hasMany(OTSchedule,       { foreignKey: 'admission_id', as: 'otSchedules' });
Admission.hasMany(OTNotes,          { foreignKey: 'admission_id', as: 'otNotes' });
Admission.hasMany(AnaesthesiaRecord,{ foreignKey: 'admission_id', as: 'anaesthesiaRecords' });
Admission.hasMany(BirthRecord,      { foreignKey: 'admission_id', as: 'birthRecords' });
Admission.hasMany(DeathRecord,      { foreignKey: 'admission_id', as: 'deathRecords' });
Admission.hasMany(MlcRecord,        { foreignKey: 'admission_id', as: 'mlcRecords' });

module.exports = {
  sequelize, Ward, Bed, Admission, Transfer, IcuRecord, NursingNote, DischargeRequest, Discharge,
  DietOrder, OTSchedule, OTNotes, AnaesthesiaRecord, BirthRecord, DeathRecord, MlcRecord,
};
