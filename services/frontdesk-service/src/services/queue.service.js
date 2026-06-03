'use strict';

const { Op, fn, col } = require('sequelize');
const { Queue, Checkin, sequelize } = require('../models');
const { NotFound, BadRequest } = require('../utils/errors');

async function list({ doctorId, status }) {
  const where = {};
  if (doctorId) where.doctorId = doctorId;
  if (status)   where.status = status;
  const rows = await Queue.findAll({ where, order: [['queuePosition', 'ASC'], ['id', 'ASC']] });
  const current = rows.find((r) => r.status === 'IN_CONSULTATION') || null;
  const next    = rows.find((r) => r.status === 'WAITING') || null;
  return { content: rows, current, next };
}

async function getById(id) {
  const row = await Queue.findByPk(id);
  if (!row) throw NotFound(`queue entry ${id} not found`);
  return row;
}

// Call the next waiting patient for a doctor (or call a specific entry).
async function callNext({ doctorId, entryId }) {
  return sequelize.transaction(async (t) => {
    let entry;
    if (entryId) {
      entry = await Queue.findByPk(entryId, { transaction: t });
    } else {
      if (!doctorId) throw BadRequest('doctorId or entryId required');
      entry = await Queue.findOne({
        where: { doctorId, status: 'WAITING' },
        order: [['queuePosition', 'ASC'], ['id', 'ASC']],
        transaction: t,
      });
    }
    if (!entry) throw NotFound('no waiting patient in queue');
    const now = new Date();
    await entry.update({ status: 'IN_CONSULTATION', calledAt: now, startedAt: now, updatedAt: now }, { transaction: t });
    if (entry.checkinId) {
      await Checkin.update({ status: 'IN_CONSULTATION', updatedAt: now }, { where: { id: entry.checkinId }, transaction: t });
    }
    return entry;
  });
}

async function transition(id, status, checkinStatus) {
  return sequelize.transaction(async (t) => {
    const entry = await Queue.findByPk(id, { transaction: t });
    if (!entry) throw NotFound(`queue entry ${id} not found`);
    const now = new Date();
    const patch = { status, updatedAt: now };
    if (status === 'COMPLETED') patch.completedAt = now;
    await entry.update(patch, { transaction: t });
    if (entry.checkinId && checkinStatus) {
      await Checkin.update({ status: checkinStatus, updatedAt: now }, { where: { id: entry.checkinId }, transaction: t });
    }
    return entry;
  });
}

const skip      = (id) => transition(id, 'SKIPPED');
const noShow    = (id) => transition(id, 'NO_SHOW', 'COMPLETED');
const complete  = (id) => transition(id, 'COMPLETED', 'COMPLETED');

async function reassign(id, doctorId) {
  const entry = await getById(id);
  await entry.update({ doctorId, status: 'WAITING', calledAt: null, startedAt: null, updatedAt: new Date() });
  return entry;
}

async function stats(doctorId) {
  const where = doctorId ? { doctorId } : {};
  const waiting = await Queue.count({ where: { ...where, status: 'WAITING' } });
  const inConsult = await Queue.count({ where: { ...where, status: 'IN_CONSULTATION' } });
  // Average wait = startedAt - createdAt over entries that have been called.
  const rows = await Queue.findAll({
    where: { ...where, startedAt: { [Op.ne]: null } },
    attributes: ['createdAt', 'startedAt'],
    raw: true,
  });
  let avgWaitMins = 0;
  if (rows.length) {
    const total = rows.reduce((s, r) => s + (new Date(r.startedAt) - new Date(r.createdAt)), 0);
    avgWaitMins = Math.round(total / rows.length / 60000);
  }
  return { doctorId: doctorId || null, waiting, inConsultation: inConsult, avgWaitMins };
}

module.exports = { list, getById, callNext, skip, noShow, complete, reassign, stats };
