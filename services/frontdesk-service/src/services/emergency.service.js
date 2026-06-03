'use strict';

const { Emergency } = require('../models');
const { NotFound } = require('../utils/errors');

async function generateEmergencyNo() {
  const last = await Emergency.findOne({ order: [['id', 'DESC']] });
  const next = (last ? last.id : 0) + 1;
  return `EMG${String(next).padStart(6, '0')}`;
}

async function create(body) {
  const emergencyNo = await generateEmergencyNo();
  return Emergency.create({
    emergencyNo,
    patientId:         body.patientId || null,
    arrivalTime:       body.arrivalTime || new Date(),
    incidentType:      body.incidentType || null,
    severity:          body.severity || 'YELLOW',
    broughtBy:         body.broughtBy || null,
    ambulanceNumber:   body.ambulanceNumber || null,
    emergencyDoctorId: body.emergencyDoctorId || null,
    status:            'WAITING',
  });
}

async function list({ status, page = 0, size = 50 }) {
  const where = {};
  if (status) where.status = status;
  const { rows, count } = await Emergency.findAndCountAll({
    where,
    limit:  Math.min(Number(size), 200),
    offset: Number(page) * Number(size),
    order:  [['id', 'DESC']],
  });
  return { content: rows, totalElements: count, page: Number(page), size: Number(size) };
}

async function getById(id) {
  const row = await Emergency.findByPk(id);
  if (!row) throw NotFound(`emergency case ${id} not found`);
  return row;
}

async function update(id, body) {
  const row = await getById(id);
  await row.update({ ...body, updatedAt: new Date() });
  return row;
}

module.exports = { create, list, getById, update };
