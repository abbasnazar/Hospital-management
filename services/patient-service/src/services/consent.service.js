'use strict';

const { Consent, Patient } = require('../models');
const { NotFound, BadRequest } = require('../utils/errors');

const getByPatient = async (patientId, query) => {
  const { page = 0, size = 20 } = query;
  const offset = page * size;

  const consents = await Consent.findAll({
    where: { patientId },
    offset,
    limit: size,
    order: [['createdAt', 'DESC']],
  });

  const total = await Consent.count({ where: { patientId } });

  return { content: consents, page, size, total };
};

const getById = async (id) => {
  const consent = await Consent.findByPk(id);
  if (!consent) throw new NotFound('Consent not found');
  return consent;
};

const create = async (patientId, data) => {
  await Patient.findByPk(patientId);

  return Consent.create({
    patientId,
    type: data.type,
    description: data.description,
    signedBy: data.signedBy,
    signedAt: data.signedAt,
  });
};

const revoke = async (id) => {
  const consent = await Consent.findByPk(id);
  if (!consent) throw new NotFound('Consent not found');

  consent.revokedAt = new Date();
  return consent.save();
};

module.exports = { getByPatient, getById, create, revoke };
