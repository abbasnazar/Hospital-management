'use strict';

const { Op } = require('sequelize');
const { IcuRecord, Ward, Bed, sequelize } = require('../models');
const { NotFound } = require('../utils/errors');
const wardSvc = require('./ward.service');

async function dashboard() {
  const icuWards = await Ward.findAll({ where: { category: 'ICU', active: true } });
  const occupancy = await wardSvc.occupancyFor(icuWards);
  const totals = occupancy.reduce((a, w) => ({
    totalBeds: a.totalBeds + w.totalBeds,
    occupied:  a.occupied + w.occupied,
    available: a.available + w.available,
  }), { totalBeds: 0, occupied: 0, available: 0 });

  const active = await IcuRecord.findAll({ where: { status: 'ACTIVE' } });
  const critical = active.filter((r) => r.critical).length;
  const assignedDoctors = [...new Set(active.map((r) => r.assignedDoctorId).filter(Boolean))];
  const assignedNurses  = [...new Set(active.map((r) => r.assignedNurseId).filter(Boolean))];

  return {
    wards: occupancy,
    ...totals,
    occupancyRate: totals.totalBeds ? Math.round((totals.occupied / totals.totalBeds) * 100) : 0,
    activePatients: active.length,
    criticalPatients: critical,
    assignedDoctors,
    assignedNurses,
    timestamp: new Date(),
  };
}

async function transferIn(body) {
  return sequelize.transaction(async (t) => {
    if (body.bedId) {
      const bed = await Bed.findByPk(body.bedId, { transaction: t });
      if (!bed) throw NotFound(`bed ${body.bedId} not found`);
      await bed.update({ status: 'OCCUPIED' }, { transaction: t });
    }
    return IcuRecord.create({
      admissionId:      body.admissionId,
      patientId:        body.patientId,
      bedId:            body.bedId || null,
      assignedDoctorId: body.assignedDoctorId || null,
      assignedNurseId:  body.assignedNurseId || null,
      critical:         body.critical ? 1 : 0,
      status:           'ACTIVE',
    }, { transaction: t });
  });
}

async function transferOut(id) {
  return sequelize.transaction(async (t) => {
    const rec = await IcuRecord.findByPk(id, { transaction: t });
    if (!rec) throw NotFound(`ICU record ${id} not found`);
    await rec.update({ status: 'TRANSFERRED_OUT', transferredOutAt: new Date() }, { transaction: t });
    if (rec.bedId) await Bed.update({ status: 'CLEANING' }, { where: { id: rec.bedId }, transaction: t });
    return rec;
  });
}

async function list({ status = 'ACTIVE' }) {
  const rows = await IcuRecord.findAll({ where: status ? { status } : {}, order: [['id', 'DESC']] });
  return { content: rows };
}

module.exports = { dashboard, transferIn, transferOut, list };
