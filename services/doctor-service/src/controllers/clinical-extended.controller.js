'use strict';

const Joi = require('joi');
const validate = require('../middleware/validate');
const { authRequired, requireFunc } = require('../middleware/auth');
const { NotFound } = require('../utils/errors');

const schemas = {
  vitals: Joi.object({
    admissionId: Joi.number().required(),
    temperature: Joi.number().optional(),
    pulse: Joi.number().optional(),
    bpSystolic: Joi.number().optional(),
    bpDiastolic: Joi.number().optional(),
    spo2: Joi.number().optional(),
    rr: Joi.number().optional(),
    weight: Joi.number().optional(),
  }),
  fluid: Joi.object({
    admissionId: Joi.number().required(),
    intakeMl: Joi.number().required(),
    intakeNotes: Joi.string().optional(),
    outputMl: Joi.number().required(),
    outputNotes: Joi.string().optional(),
  }),
  wound: Joi.object({
    admissionId: Joi.number().required(),
    woundLocation: Joi.string().required(),
    woundStatus: Joi.string().required(),
    dressingType: Joi.string().required(),
    notes: Joi.string().optional(),
  }),
  procedure: Joi.object({
    admissionId: Joi.number().required(),
    procedureType: Joi.string().required(),
    findings: Joi.string().optional(),
    complications: Joi.string().optional(),
  }),
  pain: Joi.object({
    admissionId: Joi.number().required(),
    painScale: Joi.number().min(0).max(10).required(),
    scaleType: Joi.string().optional(),
    location: Joi.string().optional(),
    management: Joi.string().optional(),
  }),
  physio: Joi.object({
    admissionId: Joi.number().required(),
    goals: Joi.string().required(),
    frequency: Joi.string().required(),
  }),
  physioNote: Joi.object({
    referralId: Joi.number().required(),
    sessionNotes: Joi.string().optional(),
    progress: Joi.string().optional(),
  }),
};

module.exports = (router) => {
  const recordVital = async (req, res, next) => {
    try { res.status(201).json({ vitalId: Date.now(), ...req.body }); } catch (e) { next(e); }
  };

  router.post('/vitals', authRequired, requireFunc('clinical.vitals.chart'), validate(schemas.vitals), recordVital);
  router.get('/vitals/:admissionId', authRequired, requireFunc('clinical.vitals.chart'), async (req, res, next) => {
    try { res.json({ admissionId: req.params.admissionId, vitals: [] }); } catch (e) { next(e); }
  });

  router.post('/fluid-balance', authRequired, requireFunc('clinical.fluid.balance'), validate(schemas.fluid),
    async (req, res, next) => {
      try { res.status(201).json({ fluidId: Date.now(), ...req.body }); } catch (e) { next(e); }
    });

  router.post('/wound-care', authRequired, requireFunc('clinical.wound.care'), validate(schemas.wound),
    async (req, res, next) => {
      try { res.status(201).json({ woundId: Date.now(), ...req.body }); } catch (e) { next(e); }
    });

  router.post('/procedures', authRequired, requireFunc('clinical.procedure.notes'), validate(schemas.procedure),
    async (req, res, next) => {
      try { res.status(201).json({ procedureId: Date.now(), ...req.body }); } catch (e) { next(e); }
    });

  router.post('/pain-assessment', authRequired, requireFunc('clinical.pain.assessment'), validate(schemas.pain),
    async (req, res, next) => {
      try { res.status(201).json({ painId: Date.now(), ...req.body }); } catch (e) { next(e); }
    });

  router.post('/physio-referral', authRequired, requireFunc('clinical.physio.order'), validate(schemas.physio),
    async (req, res, next) => {
      try { res.status(201).json({ referralId: Date.now(), ...req.body }); } catch (e) { next(e); }
    });

  router.post('/physio-notes', authRequired, requireFunc('clinical.physio.notes'), validate(schemas.physioNote),
    async (req, res, next) => {
      try { res.status(201).json({ noteId: Date.now(), ...req.body }); } catch (e) { next(e); }
    });

  router.post('/referral-internal', authRequired, requireFunc('clinical.referral.internal'),
    async (req, res, next) => {
      try { res.status(201).json({ referralId: Date.now(), status: 'CREATED' }); } catch (e) { next(e); }
    });

  router.post('/templates', authRequired, requireFunc('clinical.template.manage'),
    async (req, res, next) => {
      try { res.status(201).json({ templateId: Date.now(), status: 'CREATED' }); } catch (e) { next(e); }
    });
};
