'use strict';

const { Op } = require('sequelize');
const { Checkin, Queue, sequelize } = require('../models');
const { NotFound } = require('../utils/errors');

// Token number resets per calendar day: T-<count-today + 1>, zero padded.
async function generateToken(t) {
  const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
  const todayCount = await Checkin.count({ where: { createdAt: { [Op.gte]: startOfDay } }, transaction: t });
  return `T-${String(todayCount + 1).padStart(3, '0')}`;
}

async function nextQueuePosition(t) {
  const waiting = await Checkin.count({ where: { status: { [Op.in]: ['CHECKED_IN', 'WAITING'] } }, transaction: t });
  return waiting + 1;
}

async function create(body, user) {
  return sequelize.transaction(async (t) => {
    const tokenNo       = await generateToken(t);
    const queuePosition = await nextQueuePosition(t);
    const checkin = await Checkin.create({
      patientId:     body.patientId,
      appointmentId: body.appointmentId || null,
      tokenNo,
      queuePosition,
      status:        'CHECKED_IN',
      checkedInBy:   user ? user.id : null,
      checkedInAt:   new Date(),
    }, { transaction: t });

    // If a doctor is known, place the patient on that doctor's queue immediately.
    if (body.doctorId) {
      await Queue.create({
        doctorId:      body.doctorId,
        patientId:     body.patientId,
        checkinId:     checkin.id,
        tokenNo,
        queuePosition,
        status:        'WAITING',
      }, { transaction: t });
    }
    return checkin;
  });
}

async function list({ status, page = 0, size = 50 }) {
  const where = {};
  if (status) where.status = status;
  const { rows, count } = await Checkin.findAndCountAll({
    where,
    limit:  Math.min(Number(size), 200),
    offset: Number(page) * Number(size),
    order:  [['id', 'DESC']],
  });
  return { content: rows, totalElements: count, page: Number(page), size: Number(size) };
}

async function getById(id) {
  const row = await Checkin.findByPk(id);
  if (!row) throw NotFound(`checkin ${id} not found`);
  return row;
}

async function setStatus(id, status) {
  const row = await getById(id);
  await row.update({ status, updatedAt: new Date() });
  return row;
}

module.exports = { create, list, getById, setStatus };
