'use strict';

const { Op } = require('sequelize');
const { Appointment, Patient, sequelize } = require('../models');
const { NotFound, Conflict, BadRequest } = require('../utils/errors');

async function book(body) {
  if (new Date(body.slotEnd) <= new Date(body.slotStart)) {
    throw BadRequest('slotEnd must be after slotStart');
  }

  const patient = await Patient.findByPk(body.patientId);
  if (!patient) throw NotFound(`patient ${body.patientId} not found`);

  return sequelize.transaction(async (t) => {
    const overlap = await Appointment.findOne({
      where: {
        doctorId: body.doctorId,
        status:   { [Op.notIn]: ['CANCELLED', 'NO_SHOW'] },
        slotStart: { [Op.lt]: body.slotEnd   },
        slotEnd:   { [Op.gt]: body.slotStart },
      },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (overlap) throw Conflict('doctor has an overlapping appointment');
    return Appointment.create({ ...body, status: 'BOOKED' }, { transaction: t });
  });
}

async function list({ doctorId, patientId, status, from, to, page = 0, size = 50 }) {
  const where = {};
  if (doctorId)  where.doctorId  = doctorId;
  if (patientId) where.patientId = patientId;
  if (status)    where.status    = status;
  if (from || to) {
    where.slotStart = {};
    if (from) where.slotStart[Op.gte] = from;
    if (to)   where.slotStart[Op.lte] = to;
  }
  const { rows, count } = await Appointment.findAndCountAll({
    where,
    limit:  Math.min(Number(size), 500),
    offset: Number(page) * Number(size),
    order:  [['slotStart', 'ASC']],
  });
  return { content: rows, totalElements: count, page: Number(page), size: Number(size) };
}

async function cancel(id, reason) {
  const a = await Appointment.findByPk(id);
  if (!a) throw NotFound(`appointment ${id} not found`);
  a.status = 'CANCELLED';
  if (reason) a.reason = reason;
  await a.save();
  return a;
}

module.exports = { book, list, cancel };
