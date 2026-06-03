'use strict';

const { DischargeRequest, Discharge, Admission, Bed, sequelize } = require('../models');
const { NotFound, Conflict } = require('../utils/errors');

async function createRequest(body, user) {
  const adm = await Admission.findByPk(body.admissionId);
  if (!adm) throw NotFound(`admission ${body.admissionId} not found`);
  const existing = await DischargeRequest.findOne({
    where: { admissionId: body.admissionId, status: ['REQUESTED', 'BILLING_CLEARED', 'PHARMACY_CLEARED', 'APPROVED'] },
  });
  if (existing) throw Conflict(`discharge already in progress for admission ${body.admissionId}`);
  return DischargeRequest.create({
    admissionId:      body.admissionId,
    requestedBy:      user ? user.id : body.doctorId,
    dischargeSummary: body.dischargeSummary || null,
    status:           'REQUESTED',
  });
}

async function getRequest(id, t) {
  const req = await DischargeRequest.findByPk(id, { transaction: t });
  if (!req) throw NotFound(`discharge request ${id} not found`);
  return req;
}

// Recompute the workflow status from the cleared flags.
function deriveStatus(req) {
  if (req.finalApproved) return 'APPROVED';
  if (req.billingCleared && req.pharmacyCleared) return 'PHARMACY_CLEARED';
  if (req.billingCleared) return 'BILLING_CLEARED';
  return 'REQUESTED';
}

async function billingClear(id) {
  const req = await getRequest(id);
  await req.update({ billingCleared: true, status: deriveStatus({ ...req.toJSON(), billingCleared: true }) });
  return req;
}

async function pharmacyClear(id) {
  const req = await getRequest(id);
  await req.update({ pharmacyCleared: true, status: deriveStatus({ ...req.toJSON(), pharmacyCleared: true }) });
  return req;
}

// Final approval: requires both clearances. Writes the discharge record,
// frees the bed and marks the admission DISCHARGED.
async function approve(id, body, user) {
  return sequelize.transaction(async (t) => {
    const req = await getRequest(id, t);
    if (!req.billingCleared || !req.pharmacyCleared) {
      throw Conflict('billing and pharmacy clearance required before approval');
    }
    const adm = await Admission.findByPk(req.admissionId, { transaction: t });
    if (!adm) throw NotFound(`admission ${req.admissionId} not found`);

    await req.update({ finalApproved: true, approvedBy: user ? user.id : null, status: 'COMPLETED' }, { transaction: t });

    const discharge = await Discharge.create({
      admissionId:      adm.id,
      dischargeType:    body.dischargeType || 'HOME',
      dischargeSummary: body.dischargeSummary || req.dischargeSummary || null,
      followUpDate:     body.followUpDate || null,
      dischargedBy:     user ? user.id : adm.doctorId,
    }, { transaction: t });

    if (adm.bedId) await Bed.update({ status: 'CLEANING' }, { where: { id: adm.bedId }, transaction: t });
    await adm.update({ status: 'DISCHARGED', bedId: null }, { transaction: t });

    return { request: req, discharge };
  });
}

async function listRequests({ status }) {
  const where = {};
  if (status) where.status = status;
  const rows = await DischargeRequest.findAll({ where, order: [['id', 'DESC']] });
  return { content: rows };
}

async function summary(id) {
  const req = await getRequest(id);
  const adm = await Admission.findByPk(req.admissionId);
  const discharge = await Discharge.findOne({ where: { admissionId: req.admissionId }, order: [['id', 'DESC']] });
  return { request: req, admission: adm, discharge };
}

module.exports = { createRequest, billingClear, pharmacyClear, approve, listRequests, summary };
