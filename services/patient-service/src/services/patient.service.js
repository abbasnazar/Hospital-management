'use strict';

const { Op } = require('sequelize');
const { Patient, sequelize } = require('../models');
const { NotFound, Conflict } = require('../utils/errors');

async function generateMrn() {
  const last = await Patient.findOne({ order: [['id', 'DESC']] });
  const next = (last ? last.id : 0) + 1;
  return `MRN${String(next).padStart(6, '0')}`;
}

async function findDuplicate({ firstName, lastName, dob, phone }) {
  return Patient.findOne({
    where: {
      firstName, lastName, dob,
      ...(phone ? { phone } : {}),
    },
  });
}

async function create(body) {
  return sequelize.transaction(async (t) => {
    const dup = await findDuplicate(body);
    if (dup) throw Conflict(`duplicate patient, existing MRN=${dup.mrn}`);
    const mrn = await generateMrn();
    return Patient.create({ ...body, mrn }, { transaction: t });
  });
}

async function list({ q, page = 0, size = 20 }) {
  const where = {};
  if (q) {
    where[Op.or] = [
      { firstName: { [Op.like]: `%${q}%` } },
      { lastName:  { [Op.like]: `%${q}%` } },
      { mrn:       { [Op.like]: `%${q}%` } },
      { phone:     { [Op.like]: `%${q}%` } },
    ];
  }
  const { rows, count } = await Patient.findAndCountAll({
    where,
    limit:  Math.min(Number(size), 200),
    offset: Number(page) * Number(size),
    order:  [['id', 'DESC']],
  });
  return {
    content:       rows,
    totalElements: count,
    page:          Number(page),
    size:          Number(size),
  };
}

async function getById(id) {
  const p = await Patient.findByPk(id);
  if (!p) throw NotFound(`patient ${id} not found`);
  return p;
}

async function update(id, body) {
  const p = await getById(id);
  await p.update({ ...body, version: p.version + 1 });
  return p;
}

async function remove(id) {
  const p = await getById(id);
  await p.destroy();
}

module.exports = { create, list, getById, update, remove };
