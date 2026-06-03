'use strict';

const { Op } = require('sequelize');
const { Triage, Emergency, sequelize } = require('../models');
const { NotFound } = require('../utils/errors');

/**
 * Derive a triage priority from vitals when the clinician did not set one.
 *   RED    → casualty flow (life-threatening derangement)
 *   YELLOW → priority queue
 *   GREEN  → normal OPD flow
 */
function derivePriority(v) {
  const spo2 = v.oxygenSaturation, pulse = v.pulse, sys = v.bpSystolic, temp = v.temperature;
  if ((spo2 != null && spo2 < 90) || (pulse != null && (pulse > 130 || pulse < 40)) ||
      (sys != null && sys < 90)   || (temp != null && temp >= 40)) return 'RED';
  if ((spo2 != null && spo2 < 94) || (pulse != null && pulse > 110) ||
      (sys != null && sys < 100)  || (temp != null && temp >= 38.5)) return 'YELLOW';
  return 'GREEN';
}

async function generateEmergencyNo() {
  const last = await Emergency.findOne({ order: [['id', 'DESC']] });
  const next = (last ? last.id : 0) + 1;
  return `EMG${String(next).padStart(6, '0')}`;
}

async function create(body, user) {
  const priority = body.priority || derivePriority(body);
  return sequelize.transaction(async (t) => {
    const row = await Triage.create(
      { ...body, priority, triagedBy: user ? user.id : null }, { transaction: t },
    );
    // RED priority routes the patient into the casualty/emergency flow.
    if (priority === 'RED') {
      await Emergency.create({
        emergencyNo:   await generateEmergencyNo(),
        patientId:     body.patientId,
        incidentType:  body.chiefComplaint || 'Critical triage',
        severity:      'RED',
        status:        'WAITING',
      }, { transaction: t });
    }
    return row;
  });
}

async function list({ status, priority, page = 0, size = 50 }) {
  const where = {};
  if (status)   where.status = status;
  if (priority) where.priority = priority;
  const { rows, count } = await Triage.findAndCountAll({
    where,
    limit:  Math.min(Number(size), 200),
    offset: Number(page) * Number(size),
    order:  [['id', 'DESC']],
  });
  return { content: rows, totalElements: count, page: Number(page), size: Number(size) };
}

async function getById(id) {
  const row = await Triage.findByPk(id);
  if (!row) throw NotFound(`triage ${id} not found`);
  return row;
}

async function update(id, body) {
  const row = await getById(id);
  await row.update({ ...body, updatedAt: new Date() });
  return row;
}

module.exports = { create, list, getById, update, derivePriority };
