'use strict';

const Joi = require('joi');
const validate = require('../middleware/validate');
const { authRequired, requireFunc } = require('../middleware/auth');
const tokenSvc = require('../services/opd-token.service');
const visitorSvc = require('../services/visitor-pass.service');
const feedbackSvc = require('../services/feedback.service');
const referralSvc = require('../services/referral.service');

const schemas = {
  tokenSeries: Joi.object({
    department:  Joi.string().max(80).required(),
    seriesName:  Joi.string().max(40).required(),
    resetDaily:  Joi.boolean().optional(),
  }),
  visitorPass: Joi.object({
    patientId:   Joi.number().required(),
    visitorName: Joi.string().max(120).required(),
    relationship:Joi.string().max(40).optional(),
    passNumber:  Joi.string().max(40).required(),
    validUntil:  Joi.date().iso().required(),
  }),
  feedback: Joi.object({
    patientId:   Joi.number().required(),
    doctorId:    Joi.number().optional(),
    department:  Joi.string().max(80).optional(),
    rating:      Joi.number().integer().min(1).max(5).required(),
    comments:    Joi.string().max(500).optional(),
  }),
  referralOut: Joi.object({
    patientId:   Joi.number().required(),
    doctorId:    Joi.number().required(),
    referralTo:  Joi.string().max(120).required(),
    reason:      Joi.string().max(500).required(),
  }),
  referralIn: Joi.object({
    patientId:   Joi.number().required(),
    referredFrom:Joi.string().max(120).required(),
    referredBy:  Joi.string().max(120).required(),
    reason:      Joi.string().max(500).required(),
  }),
  query: Joi.object({
    page: Joi.number().integer().min(0).default(0),
    size: Joi.number().integer().min(1).max(200).default(20),
  }),
};

module.exports = (router) => {
  // OPD Token Series
  router.post('/opd/token-series',
    authRequired, requireFunc('opd.token.manage'),
    validate(schemas.tokenSeries),
    async (req, res, next) => {
      try { res.status(201).json(await tokenSvc.create(req.body)); } catch (e) { next(e); }
    },
  );

  router.get('/opd/token-series/:dept',
    authRequired, requireFunc('opd.census.view'),
    async (req, res, next) => {
      try { res.json(await tokenSvc.getByDept(req.params.dept)); } catch (e) { next(e); }
    },
  );

  router.post('/opd/next-token/:dept',
    authRequired, requireFunc('opd.fee.collect'),
    async (req, res, next) => {
      try { res.json({ token: await tokenSvc.getNextToken(req.params.dept) }); } catch (e) { next(e); }
    },
  );

  // Visitor Passes
  router.post('/visitor-passes',
    authRequired, requireFunc('visitor.pass.manage'),
    validate(schemas.visitorPass),
    async (req, res, next) => {
      try { res.status(201).json(await visitorSvc.create(req.body)); } catch (e) { next(e); }
    },
  );

  router.get('/visitor-passes/patient/:patientId',
    authRequired, requireFunc('visitor.pass.manage'),
    validate(schemas.query, 'query'),
    async (req, res, next) => {
      try { res.json(await visitorSvc.getByPatient(req.params.patientId, req.query)); } catch (e) { next(e); }
    },
  );

  router.patch('/visitor-passes/:id/invalidate',
    authRequired, requireFunc('visitor.pass.manage'),
    async (req, res, next) => {
      try { res.json(await visitorSvc.invalidate(req.params.id)); } catch (e) { next(e); }
    },
  );

  // Feedback
  router.post('/feedback',
    authRequired, requireFunc('feedback.collect'),
    validate(schemas.feedback),
    async (req, res, next) => {
      try { res.status(201).json(await feedbackSvc.create(req.body)); } catch (e) { next(e); }
    },
  );

  router.get('/feedback/department/:dept',
    authRequired, requireFunc('feedback.view'),
    validate(schemas.query, 'query'),
    async (req, res, next) => {
      try { res.json(await feedbackSvc.getByDept(req.params.dept, req.query)); } catch (e) { next(e); }
    },
  );

  // Referrals - Outward
  router.post('/referrals/outward',
    authRequired, requireFunc('referral.outward.create'),
    validate(schemas.referralOut),
    async (req, res, next) => {
      try { res.status(201).json(await referralSvc.createOutward(req.body)); } catch (e) { next(e); }
    },
  );

  router.get('/referrals/outward/patient/:patientId',
    authRequired, requireFunc('referral.outward.create'),
    validate(schemas.query, 'query'),
    async (req, res, next) => {
      try { res.json(await referralSvc.getOutward(req.params.patientId, req.query)); } catch (e) { next(e); }
    },
  );

  // Referrals - Inward
  router.post('/referrals/inward',
    authRequired, requireFunc('referral.inward.manage'),
    validate(schemas.referralIn),
    async (req, res, next) => {
      try { res.status(201).json(await referralSvc.createInward(req.body)); } catch (e) { next(e); }
    },
  );

  router.get('/referrals/inward/patient/:patientId',
    authRequired, requireFunc('referral.inward.manage'),
    validate(schemas.query, 'query'),
    async (req, res, next) => {
      try { res.json(await referralSvc.getInward(req.params.patientId, req.query)); } catch (e) { next(e); }
    },
  );
};
