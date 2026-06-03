'use strict';

const Joi = require('joi');
const validate = require('../middleware/validate');
const { authRequired, requireFunc } = require('../middleware/auth');
const { Incident, Infection, NeedleStick } = require('../models');

const schemas = {
  incident: Joi.object({
    patientId: Joi.number().optional(),
    reportedBy: Joi.number().required(),
    incidentType: Joi.string().max(60).required(),
    description: Joi.string().max(500).required(),
    severity: Joi.string().valid('LOW','MEDIUM','HIGH').optional(),
  }),
  infection: Joi.object({
    patientId: Joi.number().required(),
    infectionType: Joi.string().max(80).required(),
    organism: Joi.string().max(120).optional(),
    recordedBy: Joi.number().required(),
  }),
  needleStick: Joi.object({
    staffId: Joi.number().required(),
    injuryDate: Joi.date().iso().required(),
    exposureSource: Joi.string().max(120).required(),
  }),
};

module.exports = (router) => {
  router.post('/incidents', authRequired, requireFunc('quality.incident.report'), validate(schemas.incident),
    async (req, res, next) => { try { res.status(201).json(await Incident.create(req.body)); } catch (e) { next(e); } });

  router.get('/incidents', authRequired, requireFunc('quality.incident.manage'),
    async (req, res, next) => { try { const inc = await Incident.findAll(); res.json(inc); } catch (e) { next(e); } });

  router.patch('/incidents/:id/manage', authRequired, requireFunc('quality.incident.manage'),
    async (req, res, next) => { try { const i = await Incident.findByPk(req.params.id); res.json(await i.update({ status: req.body.status })); } catch (e) { next(e); } });

  router.post('/infections', authRequired, requireFunc('quality.infection.log'), validate(schemas.infection),
    async (req, res, next) => { try { res.status(201).json(await Infection.create(req.body)); } catch (e) { next(e); } });

  router.get('/infections', authRequired, requireFunc('quality.infection.view'),
    async (req, res, next) => { try { const inf = await Infection.findAll(); res.json(inf); } catch (e) { next(e); } });

  router.post('/needle-stick', authRequired, requireFunc('quality.needle.stick.log'), validate(schemas.needleStick),
    async (req, res, next) => { try { res.status(201).json(await NeedleStick.create(req.body)); } catch (e) { next(e); } });

  router.post('/audit', authRequired, requireFunc('quality.audit.clinical'),
    async (req, res, next) => { try { res.status(201).json({ auditId: Date.now() }); } catch (e) { next(e); } });

  router.get('/indicators', authRequired, requireFunc('quality.indicator.view'),
    async (req, res, next) => { try { res.json({ kqis: [] }); } catch (e) { next(e); } });
};
