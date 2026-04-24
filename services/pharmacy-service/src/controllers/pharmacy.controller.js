'use strict';

const Joi = require('joi');
const { Op, literal } = require('sequelize');
const validate = require('../middleware/validate');
const { authRequired, requireRoles } = require('../middleware/auth');
const {
  sequelize, Medicine, Batch, Prescription, PrescriptionItem, Dispense,
} = require('../models');
const { NotFound, BadRequest } = require('../utils/errors');

const schemas = {
  medicine: Joi.object({
    sku: Joi.string().max(40).required(),
    name: Joi.string().max(200).required(),
    strength: Joi.string().max(60).optional(),
    form: Joi.string().max(40).optional(),
    schedule: Joi.string().max(10).optional(),
    unitPrice: Joi.number().positive().required(),
    reorderLevel: Joi.number().integer().min(0).default(10),
  }),
  batch: Joi.object({
    medicineId: Joi.number().integer().positive().required(),
    batchNo:    Joi.string().max(40).required(),
    expiryDate: Joi.date().iso().required(),
    qtyOnHand:  Joi.number().integer().min(0).required(),
    costPrice:  Joi.number().min(0).required(),
  }),
  rx: Joi.object({
    encounterId: Joi.number().integer().positive().required(),
    patientId:   Joi.number().integer().positive().required(),
    notes:       Joi.string().max(500).optional(),
    items:       Joi.array().items(Joi.object({
      medicineId:   Joi.number().integer().positive().required(),
      dose:         Joi.string().max(60).required(),
      frequency:    Joi.string().max(60).required(),
      durationDays: Joi.number().integer().min(1).default(1),
      qty:          Joi.number().integer().min(1).required(),
    })).min(1).required(),
  }),
  dispense: Joi.object({
    prescriptionId: Joi.number().integer().positive().required(),
    batchId:        Joi.number().integer().positive().required(),
    qty:            Joi.number().integer().min(1).required(),
  }),
};

const staff = ['PHARMACIST','ADMIN','DOCTOR','NURSE'];

module.exports = (router) => {
  router.get('/medicines',
    authRequired, requireRoles(...staff),
    async (req, res, next) => {
      try {
        const where = { active: true };
        if (req.query.q) where[Op.or] = [{ name: { [Op.like]: `%${req.query.q}%` } }, { sku: { [Op.like]: `%${req.query.q}%` } }];
        res.json({ content: await Medicine.findAll({ where, limit: 200 }) });
      } catch (e) { next(e); }
    },
  );

  router.post('/medicines',
    authRequired, requireRoles('ADMIN','PHARMACIST'),
    validate(schemas.medicine),
    async (req, res, next) => {
      try { res.status(201).json(await Medicine.create(req.body)); } catch (e) { next(e); }
    },
  );

  router.post('/batches',
    authRequired, requireRoles('PHARMACIST'),
    validate(schemas.batch),
    async (req, res, next) => {
      try { res.status(201).json(await Batch.create(req.body)); } catch (e) { next(e); }
    },
  );

  router.get('/alerts/stock',
    authRequired, requireRoles('PHARMACIST','ADMIN'),
    async (_req, res, next) => {
      try {
        // Low stock + near-expiry (90 days)
        const [lowStock, nearExpiry] = await Promise.all([
          sequelize.query(`
            SELECT m.id, m.sku, m.name, m.reorder_level,
                   COALESCE(SUM(b.qty_on_hand),0) AS qty_on_hand
            FROM pharmacy_medicine m
            LEFT JOIN pharmacy_batch b ON b.medicine_id = m.id
            WHERE m.active = 1
            GROUP BY m.id
            HAVING qty_on_hand <= m.reorder_level
            LIMIT 200
          `, { type: sequelize.QueryTypes.SELECT }),
          Batch.findAll({
            where: { expiryDate: { [Op.lte]: literal('DATE_ADD(CURRENT_DATE, INTERVAL 90 DAY)') } },
            include: [{ model: Medicine, as: 'medicine' }],
            limit: 200,
          }),
        ]);
        res.json({ lowStock, nearExpiry });
      } catch (e) { next(e); }
    },
  );

  router.post('/prescriptions',
    authRequired, requireRoles('DOCTOR'),
    validate(schemas.rx),
    async (req, res, next) => {
      try {
        const { items, ...header } = req.body;
        const created = await sequelize.transaction(async (t) => {
          const rx = await Prescription.create({ ...header, doctorId: req.user.id }, { transaction: t });
          await PrescriptionItem.bulkCreate(
            items.map((i) => ({ ...i, prescriptionId: rx.id })),
            { transaction: t },
          );
          return Prescription.findByPk(rx.id, { include: [{ model: PrescriptionItem, as: 'items' }], transaction: t });
        });
        res.status(201).json(created);
      } catch (e) { next(e); }
    },
  );

  router.post('/dispense',
    authRequired, requireRoles('PHARMACIST'),
    validate(schemas.dispense),
    async (req, res, next) => {
      try {
        const result = await sequelize.transaction(async (t) => {
          const rx = await Prescription.findByPk(req.body.prescriptionId, { transaction: t });
          if (!rx) throw NotFound(`prescription ${req.body.prescriptionId} not found`);
          const batch = await Batch.findByPk(req.body.batchId, { transaction: t, lock: t.LOCK.UPDATE });
          if (!batch) throw NotFound(`batch ${req.body.batchId} not found`);
          if (batch.qtyOnHand < req.body.qty) throw BadRequest('insufficient stock');

          batch.qtyOnHand -= req.body.qty;
          await batch.save({ transaction: t });

          const medicine = await Medicine.findByPk(batch.medicineId, { transaction: t });
          const total = Number(medicine.unitPrice) * req.body.qty;

          return Dispense.create({
            ...req.body,
            dispensedBy: req.user.id,
            totalPrice:  total.toFixed(2),
          }, { transaction: t });
        });
        res.status(201).json(result);
      } catch (e) { next(e); }
    },
  );
};
