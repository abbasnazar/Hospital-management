'use strict';

const { Insurance, Patient } = require('../models');
const { NotFound, BadRequest } = require('../utils/errors');

const getByPatient = async (patientId, query) => {
  const { page = 0, size = 20 } = query;
  const offset = page * size;

  const insurances = await Insurance.findAll({
    where: { patientId },
    offset,
    limit: size,
    order: [['createdAt', 'DESC']],
  });

  const total = await Insurance.count({ where: { patientId } });

  return { content: insurances, page, size, total };
};

const getById = async (id) => {
  const insurance = await Insurance.findByPk(id);
  if (!insurance) throw new NotFound('Insurance not found');
  return insurance;
};

const create = async (patientId, data) => {
  await Patient.findByPk(patientId);

  return Insurance.create({
    patientId,
    provider: data.provider,
    policyNo: data.policyNo,
    memberId: data.memberId,
    groupId: data.groupId,
    validFrom: data.validFrom,
    validUntil: data.validUntil,
    status: data.status || 'ACTIVE',
  });
};

const update = async (id, data) => {
  const insurance = await Insurance.findByPk(id);
  if (!insurance) throw new NotFound('Insurance not found');

  return insurance.update({
    provider: data.provider !== undefined ? data.provider : insurance.provider,
    policyNo: data.policyNo !== undefined ? data.policyNo : insurance.policyNo,
    memberId: data.memberId !== undefined ? data.memberId : insurance.memberId,
    groupId: data.groupId !== undefined ? data.groupId : insurance.groupId,
    validFrom: data.validFrom !== undefined ? data.validFrom : insurance.validFrom,
    validUntil: data.validUntil !== undefined ? data.validUntil : insurance.validUntil,
    status: data.status !== undefined ? data.status : insurance.status,
  });
};

const remove = async (id) => {
  const insurance = await Insurance.findByPk(id);
  if (!insurance) throw new NotFound('Insurance not found');
  await insurance.destroy();
};

module.exports = { getByPatient, getById, create, update, remove };
