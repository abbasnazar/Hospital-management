'use strict';

const { Op } = require('sequelize');
const { Admission, Bed, sequelize } = require('../models');
const { NotFound, Conflict, BadRequest } = require('../utils/errors');

async function generateAdmissionNo(t) {
  const last = await Admission.findOne({ order: [['id', 'DESC']], transaction: t });
  const next = (last ? last.id : 0) + 1;
  return `ADM${String(next).padStart(6, '0')}`;
}

// Mark a bed OCCUPIED inside a transaction (throws if not available).
async function occupyBed(bedId, t) {
  const bed = await Bed.findByPk(bedId, { transaction: t });
  if (!bed) throw NotFound(`bed ${bedId} not found`);
  if (bed.status !== 'AVAILABLE' && bed.status !== 'RESERVED') {
    throw Conflict(`bed ${bedId} is ${bed.status}`);
  }
  await bed.update({ status: 'OCCUPIED' }, { transaction: t });
  return bed;
}

async function create(body, user) {
  return sequelize.transaction(async (t) => {
    const source = body.admissionSource || (body.admissionType === 'EMERGENCY' ? 'EMERGENCY' : 'PLANNED');
    // Doctor recommendations start PENDING and are approved by reception/admin.
    const status = source === 'DOCTOR_RECOMMENDATION' ? 'PENDING' : 'ACTIVE';
    const admissionNo = await generateAdmissionNo(t);

    if (body.bedId && status === 'ACTIVE') await occupyBed(body.bedId, t);

    return Admission.create({
      patientId:          body.patientId,
      doctorId:           body.doctorId,
      bedId:              status === 'ACTIVE' ? (body.bedId || null) : null,
      admissionType:      body.admissionType || 'PLANNED',
      reason:             body.reason,
      expectedStay:       body.expectedStay || null,
      admittedBy:         user ? user.id : body.doctorId,
      status,
      admissionNo,
      admissionSource:    source,
      department:         body.department || null,
      bedType:            body.bedType || null,
      emergencyId:        body.emergencyId || null,
      consultingDoctorId: body.consultingDoctorId || null,
    }, { transaction: t });
  });
}

async function list({ status, patientId, page = 0, size = 50 }) {
  const where = {};
  if (status)    where.status = status;
  if (patientId) where.patientId = patientId;
  const { rows, count } = await Admission.findAndCountAll({
    where,
    include: [{ model: Bed, as: 'bed' }],
    limit:  Math.min(Number(size), 200),
    offset: Number(page) * Number(size),
    order:  [['id', 'DESC']],
  });
  return { content: rows, totalElements: count, page: Number(page), size: Number(size) };
}

async function getById(id) {
  const row = await Admission.findByPk(id, { include: [{ model: Bed, as: 'bed' }] });
  if (!row) throw NotFound(`admission ${id} not found`);
  return row;
}

// Approve a PENDING admission and (optionally) allocate a bed.
async function approve(id, body, user) {
  return sequelize.transaction(async (t) => {
    const adm = await Admission.findByPk(id, { transaction: t });
    if (!adm) throw NotFound(`admission ${id} not found`);
    const bedId = body.bedId || adm.bedId;
    if (!bedId) throw BadRequest('bedId required to admit the patient');
    await occupyBed(bedId, t);
    await adm.update({ status: 'ADMITTED', bedId, admittedBy: user ? user.id : adm.admittedBy }, { transaction: t });
    return adm;
  });
}

async function update(id, body) {
  const adm = await getById(id);
  await adm.update(body);
  return adm;
}

async function currentAdmission(patientId) {
  const adm = await Admission.findOne({
    where: { patientId, status: { [Op.in]: ['ACTIVE', 'ADMITTED', 'TRANSFERRED'] } },
    include: [{ model: Bed, as: 'bed' }],
    order: [['id', 'DESC']],
  });
  return { patientId: Number(patientId), admission: adm };
}

module.exports = { create, list, getById, approve, update, currentAdmission, occupyBed };
