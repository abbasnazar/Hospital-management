'use strict';

const Joi = require('joi');
const validate = require('../middleware/validate');
const { authRequired, requireFunc } = require('../middleware/auth');
const { DietOrder, OTSchedule, OTNotes, AnaesthesiaRecord, BirthRecord, DeathRecord, MlcRecord } = require('../models');
const { NotFound } = require('../utils/errors');

const schemas = {
  diet:      Joi.object({ dietType: Joi.string().required(), restrictions: Joi.string().optional() }),
  ot:        Joi.object({ surgeonId: Joi.number().required(), anaesthetistId: Joi.number().optional(), procedure: Joi.string().required(), scheduledDate: Joi.date().iso().required() }),
  otNotes:   Joi.object({ preopFindings: Joi.string().optional(), procedureDone: Joi.string().required(), intraopFindings: Joi.string().optional(), postopInstructions: Joi.string().optional() }),
  anaesthesia: Joi.object({ anaesthesiaType: Joi.string().required(), inductionAgent: Joi.string().optional(), maintenanceAgent: Joi.string().optional(), monitoringNotes: Joi.string().optional() }),
  birth:     Joi.object({ motherId: Joi.number().required(), dob: Joi.date().iso().required(), gender: Joi.string().required(), weight: Joi.number().optional(), liveBirth: Joi.boolean().optional(), apgarScore: Joi.number().optional() }),
  death:     Joi.object({ patientId: Joi.number().required(), deathTime: Joi.date().iso().required(), deathCause: Joi.string().required(), certifiedBy: Joi.number().required() }),
  mlc:       Joi.object({ patientId: Joi.number().required(), caseType: Joi.string().required(), injuryDetails: Joi.string().optional(), policeReported: Joi.boolean().optional(), policeStation: Joi.string().optional(), firNumber: Joi.string().optional() }),
  query:     Joi.object({ page: Joi.number().integer().min(0).default(0), size: Joi.number().integer().min(1).max(200).default(20) }),
};

module.exports = (router) => {
  router.post('/:admissionId/diet', authRequired, requireFunc('ipd.diet.manage'), validate(schemas.diet),
    async (req, res, next) => {
      try { res.status(201).json(await DietOrder.create({ ...req.body, admissionId: req.params.admissionId, orderedBy: req.user.id })); } catch (e) { next(e); }
    });

  router.get('/:admissionId/diet', authRequired, requireFunc('ipd.diet.view'),
    async (req, res, next) => {
      try { const diets = await DietOrder.findAll({ where: { admissionId: req.params.admissionId } }); res.json(diets); } catch (e) { next(e); }
    });

  router.post('/:admissionId/ot/schedule', authRequired, requireFunc('ipd.ot.schedule'), validate(schemas.ot),
    async (req, res, next) => {
      try { res.status(201).json(await OTSchedule.create({ ...req.body, admissionId: req.params.admissionId })); } catch (e) { next(e); }
    });

  router.get('/:admissionId/ot/schedule', authRequired, requireFunc('ipd.ot.view'),
    async (req, res, next) => {
      try { const ots = await OTSchedule.findAll({ where: { admissionId: req.params.admissionId } }); res.json(ots); } catch (e) { next(e); }
    });

  router.post('/:admissionId/ot/notes', authRequired, requireFunc('ipd.ot.notes'), validate(schemas.otNotes),
    async (req, res, next) => {
      try { res.status(201).json(await OTNotes.create({ ...req.body, admissionId: req.params.admissionId, surgeonId: req.user.id })); } catch (e) { next(e); }
    });

  router.post('/:admissionId/anaesthesia', authRequired, requireFunc('ipd.anaesthesia.record'), validate(schemas.anaesthesia),
    async (req, res, next) => {
      try { res.status(201).json(await AnaesthesiaRecord.create({ ...req.body, admissionId: req.params.admissionId, anaesthetistId: req.user.id })); } catch (e) { next(e); }
    });

  router.post('/:admissionId/birth', authRequired, requireFunc('ipd.birth.register'), validate(schemas.birth),
    async (req, res, next) => {
      try { res.status(201).json(await BirthRecord.create({ ...req.body, admissionId: req.params.admissionId })); } catch (e) { next(e); }
    });

  router.post('/:admissionId/death', authRequired, requireFunc('ipd.death.register'), validate(schemas.death),
    async (req, res, next) => {
      try { res.status(201).json(await DeathRecord.create({ ...req.body, admissionId: req.params.admissionId })); } catch (e) { next(e); }
    });

  router.post('/:admissionId/mlc', authRequired, requireFunc('ipd.mlc.manage'), validate(schemas.mlc),
    async (req, res, next) => {
      try { res.status(201).json(await MlcRecord.create({ ...req.body, admissionId: req.params.admissionId })); } catch (e) { next(e); }
    });

  router.get('/:admissionId/mlc', authRequired, requireFunc('ipd.mlc.manage'),
    async (req, res, next) => {
      try { const mlc = await MlcRecord.findOne({ where: { admissionId: req.params.admissionId } }); res.json(mlc || {}); } catch (e) { next(e); }
    });
};
