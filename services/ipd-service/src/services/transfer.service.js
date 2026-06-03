'use strict';

const { Transfer, Bed, Admission, sequelize } = require('../models');
const { NotFound } = require('../utils/errors');

// Record a patient transfer and flip the bed occupancy accordingly.
async function create(body, user) {
  return sequelize.transaction(async (t) => {
    const adm = await Admission.findByPk(body.admissionId, { transaction: t });
    if (!adm) throw NotFound(`admission ${body.admissionId} not found`);

    const fromBedId = body.fromBedId || adm.bedId || null;

    if (fromBedId) {
      await Bed.update({ status: 'CLEANING' }, { where: { id: fromBedId }, transaction: t });
    }
    if (body.toBedId) {
      const toBed = await Bed.findByPk(body.toBedId, { transaction: t });
      if (!toBed) throw NotFound(`bed ${body.toBedId} not found`);
      await toBed.update({ status: 'OCCUPIED' }, { transaction: t });
      await adm.update({ bedId: body.toBedId, status: 'TRANSFERRED' }, { transaction: t });
    }

    return Transfer.create({
      admissionId:    body.admissionId,
      patientId:      adm.patientId,
      fromBedId,
      toBedId:        body.toBedId || null,
      fromLocation:   body.fromLocation || null,
      toLocation:     body.toLocation || null,
      reason:         body.reason || null,
      doctorApproval: body.doctorApproval ? 1 : 0,
      approvedBy:     body.doctorApproval ? (user ? user.id : null) : null,
    }, { transaction: t });
  });
}

async function list({ admissionId }) {
  const where = {};
  if (admissionId) where.admissionId = admissionId;
  const rows = await Transfer.findAll({ where, order: [['id', 'DESC']] });
  return { content: rows };
}

module.exports = { create, list };
