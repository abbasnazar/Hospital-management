'use strict';

const { ReferralOutward, ReferralInward } = require('../models');
const { NotFound } = require('../utils/errors');

const createOutward = async (data) => {
  return ReferralOutward.create({
    patientId: data.patientId,
    doctorId: data.doctorId,
    referralTo: data.referralTo,
    reason: data.reason,
    status: 'PENDING',
  });
};

const getOutward = async (patientId, query) => {
  const { page = 0, size = 20 } = query;
  const referrals = await ReferralOutward.findAll({
    where: { patientId },
    offset: page * size,
    limit: size,
    order: [['createdAt', 'DESC']],
  });
  const total = await ReferralOutward.count({ where: { patientId } });
  return { content: referrals, page, size, total };
};

const createInward = async (data) => {
  return ReferralInward.create({
    patientId: data.patientId,
    referredFrom: data.referredFrom,
    referredBy: data.referredBy,
    reason: data.reason,
    status: 'REGISTERED',
  });
};

const getInward = async (patientId, query) => {
  const { page = 0, size = 20 } = query;
  const referrals = await ReferralInward.findAll({
    where: { patientId },
    offset: page * size,
    limit: size,
    order: [['createdAt', 'DESC']],
  });
  const total = await ReferralInward.count({ where: { patientId } });
  return { content: referrals, page, size, total };
};

module.exports = { createOutward, getOutward, createInward, getInward };
