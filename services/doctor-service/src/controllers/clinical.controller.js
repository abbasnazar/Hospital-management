'use strict';

const Joi      = require('joi');
const validate = require('../middleware/validate');
const { authRequired, requireRoles } = require('../middleware/auth');
const { ClinicalNote, Diagnosis } = require('../models');
const { NotFound } = require('../utils/errors');

const noteSchema = Joi.object({
  encounterId: Joi.number().integer().positive().required(),
  patientId:   Joi.number().integer().positive().required(),
  note:        Joi.object({
    s: Joi.string().allow('').optional(),
    o: Joi.string().allow('').optional(),
    a: Joi.string().allow('').optional(),
    p: Joi.string().allow('').optional(),
  }).unknown(true).required(),
});

const dxSchema = Joi.object({
  encounterId: Joi.number().integer().positive().required(),
  patientId:   Joi.number().integer().positive().required(),
  code:        Joi.string().max(20).required(),
  codeSystem:  Joi.string().max(20).default('ICD10'),
  description: Joi.string().max(300).required(),
  severity:    Joi.string().max(20).optional(),
  onsetDate:   Joi.date().iso().optional(),
});

module.exports = (router) => {
  router.post('/notes',
    authRequired, requireRoles('DOCTOR'),
    validate(noteSchema),
    async (req, res, next) => {
      try {
        const n = await ClinicalNote.create({ ...req.body, doctorId: req.user.id });
        res.status(201).json(n);
      } catch (e) { next(e); }
    },
  );

  router.get('/notes/:id',
    authRequired, requireRoles('DOCTOR','NURSE','ADMIN'),
    async (req, res, next) => {
      try {
        const n = await ClinicalNote.findByPk(req.params.id);
        if (!n) throw NotFound(`note ${req.params.id} not found`);
        res.json(n);
      } catch (e) { next(e); }
    },
  );

  router.post('/notes/:id/sign',
    authRequired, requireRoles('DOCTOR'),
    async (req, res, next) => {
      try {
        const n = await ClinicalNote.findByPk(req.params.id);
        if (!n) throw NotFound(`note ${req.params.id} not found`);
        n.signedAt = new Date();
        await n.save();
        res.json(n);
      } catch (e) { next(e); }
    },
  );

  router.post('/diagnosis',
    authRequired, requireRoles('DOCTOR'),
    validate(dxSchema),
    async (req, res, next) => {
      try { res.status(201).json(await Diagnosis.create(req.body)); } catch (e) { next(e); }
    },
  );

  router.get('/diagnosis',
    authRequired, requireRoles('DOCTOR','NURSE','ADMIN'),
    async (req, res, next) => {
      try {
        const { patientId } = req.query;
        const where = patientId ? { patientId } : {};
        const rows = await Diagnosis.findAll({ where, order: [['id','DESC']], limit: 200 });
        res.json({ content: rows });
      } catch (e) { next(e); }
    },
  );

  router.get('/patients/:patientId/discharge-summary',
    authRequired, requireRoles('DOCTOR','NURSE','ADMIN'),
    async (req, res, next) => {
      try {
        const patientId = req.params.patientId;
        const [notes, dx] = await Promise.all([
          ClinicalNote.findAll({ where: { patientId }, order: [['id','DESC']], limit: 50 }),
          Diagnosis.findAll({    where: { patientId }, order: [['id','DESC']], limit: 50 }),
        ]);
        res.json({ patientId: Number(patientId), notes, diagnoses: dx, generatedAt: new Date().toISOString() });
      } catch (e) { next(e); }
    },
  );
};
