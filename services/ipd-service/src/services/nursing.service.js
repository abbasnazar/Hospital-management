'use strict';

const { NursingNote, Admission } = require('../models');
const { NotFound } = require('../utils/errors');

async function createNote(body, user) {
  const adm = await Admission.findByPk(body.admissionId);
  if (!adm) throw NotFound(`admission ${body.admissionId} not found`);
  return NursingNote.create({
    admissionId: body.admissionId,
    patientId:   body.patientId || adm.patientId,
    nurseId:     user ? user.id : body.nurseId,
    noteType:    body.noteType || 'OBSERVATION',
    vitals:      body.vitals || null,
    medication:  body.medication || null,
    note:        body.note || null,
  });
}

async function listNotes({ admissionId }) {
  const where = {};
  if (admissionId) where.admissionId = admissionId;
  const rows = await NursingNote.findAll({ where, order: [['id', 'DESC']] });
  return { content: rows };
}

module.exports = { createNote, listNotes };
