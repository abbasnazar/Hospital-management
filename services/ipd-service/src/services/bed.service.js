'use strict';

const { Bed, Ward, Admission, sequelize } = require('../models');
const { NotFound, Conflict } = require('../utils/errors');

const VALID = ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'CLEANING', 'MAINTENANCE'];

async function list({ wardId, status }) {
  const where = {};
  if (wardId) where.wardId = wardId;
  if (status) where.status = status;
  const rows = await Bed.findAll({
    where,
    include: [{ model: Ward, as: 'ward' }],
    order: [['ward_id', 'ASC'], ['bed_number', 'ASC']],
  });
  return { content: rows };
}

async function getById(id) {
  const bed = await Bed.findByPk(id);
  if (!bed) throw NotFound(`bed ${id} not found`);
  return bed;
}

async function allocate(id, body) {
  return sequelize.transaction(async (t) => {
    const bed = await Bed.findByPk(id, { transaction: t });
    if (!bed) throw NotFound(`bed ${id} not found`);
    if (bed.status === 'OCCUPIED') throw Conflict(`bed ${id} already occupied`);
    await bed.update({ status: 'OCCUPIED' }, { transaction: t });
    if (body.admissionId) {
      await Admission.update({ bedId: id, status: 'ADMITTED' }, { where: { id: body.admissionId }, transaction: t });
    }
    return bed;
  });
}

async function release(id) {
  return sequelize.transaction(async (t) => {
    const bed = await Bed.findByPk(id, { transaction: t });
    if (!bed) throw NotFound(`bed ${id} not found`);
    await bed.update({ status: 'CLEANING' }, { transaction: t });
    await Admission.update({ bedId: null }, { where: { bedId: id }, transaction: t });
    return bed;
  });
}

async function setStatus(id, status) {
  if (!VALID.includes(status)) throw Conflict(`invalid bed status ${status}`);
  const bed = await getById(id);
  await bed.update({ status });
  return bed;
}

module.exports = { list, getById, allocate, release, setStatus, VALID };
