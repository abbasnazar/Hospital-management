'use strict';

const Joi       = require('joi');
const { v4: uuid } = require('uuid');
const validate  = require('../middleware/validate');
const { authRequired, requireRoles } = require('../middleware/auth');
const { LabOrder, LabSample, LabResult, LabTest } = require('../models');
const { NotFound, BadRequest } = require('../utils/errors');

const schemas = {
  order: Joi.object({
    patientId: Joi.number().integer().positive().required(),
    doctorId:  Joi.number().integer().positive().required(),
    encounterId: Joi.number().integer().positive().optional(),
    testCode:  Joi.string().max(30).required(),
    priority:  Joi.string().valid('ROUTINE','URGENT','STAT').default('ROUTINE'),
  }),
  sample: Joi.object({
    orderId: Joi.number().integer().positive().required(),
    barcode: Joi.string().max(64).optional(),
  }),
  result: Joi.object({
    sampleId:       Joi.number().integer().positive().required(),
    analyteCode:    Joi.string().max(30).required(),
    value:          Joi.string().max(200).required(),
    unit:           Joi.string().max(40).optional(),
    referenceRange: Joi.string().max(80).optional(),
    abnormalFlag:   Joi.string().valid('L','H','N','A').optional(),
  }),
};

const clinicalRoles = ['DOCTOR','NURSE','ADMIN','LAB_TECH'];

module.exports = (router) => {
  router.get('/tests',
    authRequired, requireRoles(...clinicalRoles),
    async (_req, res, next) => {
      try { res.json({ content: await LabTest.findAll({ where: { active: true } }) }); }
      catch (e) { next(e); }
    },
  );

  router.post('/orders',
    authRequired, requireRoles('DOCTOR','NURSE'),
    validate(schemas.order),
    async (req, res, next) => {
      try {
        const test = await LabTest.findOne({ where: { code: req.body.testCode } });
        if (!test) throw BadRequest(`unknown test code ${req.body.testCode}`);
        res.status(201).json(await LabOrder.create(req.body));
      } catch (e) { next(e); }
    },
  );

  router.get('/orders',
    authRequired, requireRoles(...clinicalRoles),
    async (req, res, next) => {
      try {
        const where = {};
        if (req.query.patientId) where.patientId = req.query.patientId;
        if (req.query.status)    where.status    = req.query.status;
        const rows = await LabOrder.findAll({ where, order: [['id','DESC']], limit: 200 });
        res.json({ content: rows });
      } catch (e) { next(e); }
    },
  );

  router.post('/samples',
    authRequired, requireRoles('LAB_TECH','NURSE'),
    validate(schemas.sample),
    async (req, res, next) => {
      try {
        const order = await LabOrder.findByPk(req.body.orderId);
        if (!order) throw NotFound(`order ${req.body.orderId} not found`);
        const sample = await LabSample.create({
          orderId:     req.body.orderId,
          barcode:     req.body.barcode || `BC-${Date.now()}-${uuid().slice(0, 8)}`,
          collectedAt: new Date(),
          status:      'COLLECTED',
        });
        order.status = 'IN_LAB';
        await order.save();
        res.status(201).json(sample);
      } catch (e) { next(e); }
    },
  );

  router.post('/results',
    authRequired, requireRoles('LAB_TECH'),
    validate(schemas.result),
    async (req, res, next) => {
      try {
        const sample = await LabSample.findByPk(req.body.sampleId);
        if (!sample) throw NotFound(`sample ${req.body.sampleId} not found`);
        const result = await LabResult.create({ ...req.body, verifiedBy: req.user.id });
        res.status(201).json(result);
      } catch (e) { next(e); }
    },
  );

  router.get('/orders/:id/results',
    authRequired, requireRoles(...clinicalRoles),
    async (req, res, next) => {
      try {
        const order = await LabOrder.findByPk(req.params.id, {
          include: [{ model: LabSample, as: 'samples', include: [{ model: LabResult, as: 'results' }] }],
        });
        if (!order) throw NotFound(`order ${req.params.id} not found`);
        res.json(order);
      } catch (e) { next(e); }
    },
  );
};
