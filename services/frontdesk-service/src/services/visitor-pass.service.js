'use strict';

const { VisitorPass } = require('../models');
const { NotFound } = require('../utils/errors');

const create = async (data) => {
  return VisitorPass.create({
    patientId: data.patientId,
    visitorName: data.visitorName,
    relationship: data.relationship,
    passNumber: data.passNumber,
    issuedAt: new Date(),
    validUntil: data.validUntil,
    status: 'ACTIVE',
  });
};

const getByPatient = async (patientId, query) => {
  const { page = 0, size = 20 } = query;
  const passes = await VisitorPass.findAll({
    where: { patientId },
    offset: page * size,
    limit: size,
    order: [['issuedAt', 'DESC']],
  });
  const total = await VisitorPass.count({ where: { patientId } });
  return { content: passes, page, size, total };
};

const invalidate = async (id) => {
  const pass = await VisitorPass.findByPk(id);
  if (!pass) throw new NotFound('Visitor pass not found');
  return pass.update({ status: 'INVALIDATED' });
};

module.exports = { create, getByPatient, invalidate };
