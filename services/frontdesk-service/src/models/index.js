'use strict';

const sequelize = require('../db/sequelize');
const Triage    = require('./Triage');
const Checkin   = require('./Checkin');
const Queue     = require('./Queue');
const Emergency = require('./Emergency');
const OpdTokenSeries = require('./OpdTokenSeries');
const VisitorPass = require('./VisitorPass');
const Feedback = require('./Feedback');
const { ReferralOutward, ReferralInward } = require('./Referral');

Checkin.hasMany(Queue,  { foreignKey: 'checkin_id', as: 'queueEntries' });
Queue.belongsTo(Checkin, { foreignKey: 'checkin_id', as: 'checkin' });

module.exports = {
  sequelize, Triage, Checkin, Queue, Emergency,
  OpdTokenSeries, VisitorPass, Feedback, ReferralOutward, ReferralInward
};
