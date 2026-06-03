'use strict';

const Joi = require('joi');
const validate = require('../middleware/validate');
const { authRequired, requireFunc } = require('../middleware/auth');
const Lab = require('../models');
const { NotFound } = require('../utils/errors');

const schemas = {
  test: Joi.object({
    code: Joi.string().max(30).required(),
    name: Joi.string().max(200).required(),
    specimen: Joi.string().max(60).optional(),
    loinc: Joi.string().max(20).optional(),
    price: Joi.number().required(),
    refRange: Joi.string().max(80).optional(),
  }),
  radOrder: Joi.object({
    patientId: Joi.number().required(),
    doctorId: Joi.number().required(),
    modality: Joi.string().max(40).required(),
    bodyPart: Joi.string().max(80).required(),
    indication: Joi.string().max(300).optional(),
    priority: Joi.string().valid('ROUTINE','URGENT').optional(),
  }),
  radReport: Joi.object({
    radiologistId: Joi.number().required(),
    findings: Joi.string().required(),
    impression: Joi.string().required(),
    recommendations: Joi.string().optional(),
  }),
  query: Joi.object({
    page: Joi.number().integer().min(0).default(0),
    size: Joi.number().integer().min(1).max(200).default(20),
  }),
};

module.exports = (router) => {
  // Test catalogue
  router.post('/tests', authRequired, requireFunc('lab.tests.manage'), validate(schemas.test),
    async (req, res, next) => {
      try { res.status(201).json(await Lab.LabCatalogue.create(req.body)); } catch (e) { next(e); }
    });

  router.get('/tests', authRequired, requireFunc('lab.tests.manage'),
    async (req, res, next) => {
      try { res.json(await Lab.LabCatalogue.findAll({ where: { active: true } })); } catch (e) { next(e); }
    });

  router.put('/tests/:id', authRequired, requireFunc('lab.tests.manage'), validate(schemas.test.min(1)),
    async (req, res, next) => {
      try {
        const test = await Lab.LabCatalogue.findByPk(req.params.id);
        if (!test) throw new NotFound('Test not found');
        res.json(await test.update(req.body));
      } catch (e) { next(e); }
    });

  // Radiology orders
  router.post('/radiology/orders', authRequired, requireFunc('radiology.order.create'), validate(schemas.radOrder),
    async (req, res, next) => {
      try { res.status(201).json(await Lab.RadiologyOrder.create(req.body)); } catch (e) { next(e); }
    });

  router.get('/radiology/orders/:patientId', authRequired, requireFunc('radiology.order.view'), validate(schemas.query, 'query'),
    async (req, res, next) => {
      try {
        const { page = 0, size = 20 } = req.query;
        const orders = await Lab.RadiologyOrder.findAll({
          where: { patientId: req.params.patientId },
          offset: page * size,
          limit: size,
          order: [['orderedAt', 'DESC']],
        });
        res.json({ content: orders, page, size, total: await Lab.RadiologyOrder.count({ where: { patientId: req.params.patientId } }) });
      } catch (e) { next(e); }
    });

  // Radiology reports
  router.post('/radiology/:orderId/report', authRequired, requireFunc('radiology.report.enter'), validate(schemas.radReport),
    async (req, res, next) => {
      try {
        const order = await Lab.RadiologyOrder.findByPk(req.params.orderId);
        if (!order) throw new NotFound('Order not found');
        await order.update({ completedAt: new Date() });
        res.status(201).json(await Lab.RadiologyReport.create({ orderId: req.params.orderId, ...req.body }));
      } catch (e) { next(e); }
    });

  router.get('/radiology/:orderId/report', authRequired, requireFunc('radiology.order.view'),
    async (req, res, next) => {
      try {
        const report = await Lab.RadiologyReport.findOne({ where: { orderId: req.params.orderId } });
        res.json(report || {});
      } catch (e) { next(e); }
    });

  // Results verification/amendment (simplified)
  router.patch('/results/:id/verify', authRequired, requireFunc('lab.results.verify'),
    async (req, res, next) => {
      try { res.json({ id: req.params.id, verified: true }); } catch (e) { next(e); }
    });

  router.patch('/results/:id/amend', authRequired, requireFunc('lab.results.amend'),
    async (req, res, next) => {
      try { res.json({ id: req.params.id, amended: true }); } catch (e) { next(e); }
    });

  router.post('/qc/log', authRequired, requireFunc('lab.qc.log'),
    async (req, res, next) => {
      try { res.status(201).json({ qcId: Date.now() }); } catch (e) { next(e); }
    });
};
