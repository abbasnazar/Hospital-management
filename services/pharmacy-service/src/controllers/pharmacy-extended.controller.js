'use strict';

const Joi = require('joi');
const validate = require('../middleware/validate');
const { authRequired, requireFunc } = require('../middleware/auth');
const Pharmacy = require('../models');
const { NotFound } = require('../utils/errors');

const schemas = {
  supplier: Joi.object({
    name: Joi.string().max(120).required(),
    contact: Joi.string().max(80).optional(),
    phone: Joi.string().max(20).optional(),
    email: Joi.string().email().optional(),
  }),
  po: Joi.object({
    supplierId: Joi.number().required(),
    poNumber: Joi.string().max(40).required(),
    poDate: Joi.date().iso().required(),
    expectedDelivery: Joi.date().iso().optional(),
  }),
  grn: Joi.object({
    poId: Joi.number().required(),
    grnNumber: Joi.string().max(40).required(),
    totalItems: Joi.number().required(),
    acceptedItems: Joi.number().required(),
  }),
  indent: Joi.object({
    department: Joi.string().max(80).required(),
    medicineId: Joi.number().required(),
    quantity: Joi.number().required(),
    reason: Joi.string().max(300).optional(),
  }),
  query: Joi.object({
    page: Joi.number().integer().min(0).default(0),
    size: Joi.number().integer().min(1).max(200).default(20),
  }),
};

module.exports = (router) => {
  // Suppliers
  router.post('/suppliers', authRequired, requireFunc('pharmacy.supplier.manage'), validate(schemas.supplier),
    async (req, res, next) => {
      try { res.status(201).json(await Pharmacy.Supplier.create(req.body)); } catch (e) { next(e); }
    });

  router.get('/suppliers', authRequired, requireFunc('pharmacy.supplier.manage'),
    async (req, res, next) => {
      try { res.json(await Pharmacy.Supplier.findAll({ where: { status: 'ACTIVE' } })); } catch (e) { next(e); }
    });

  router.put('/suppliers/:id', authRequired, requireFunc('pharmacy.supplier.manage'), validate(schemas.supplier.min(1)),
    async (req, res, next) => {
      try {
        const sup = await Pharmacy.Supplier.findByPk(req.params.id);
        if (!sup) throw new NotFound('Supplier not found');
        res.json(await sup.update(req.body));
      } catch (e) { next(e); }
    });

  // Purchase Orders
  router.post('/po', authRequired, requireFunc('pharmacy.po.create'), validate(schemas.po),
    async (req, res, next) => {
      try { res.status(201).json(await Pharmacy.PurchaseOrder.create(req.body)); } catch (e) { next(e); }
    });

  router.get('/po', authRequired, requireFunc('pharmacy.po.view'), validate(schemas.query, 'query'),
    async (req, res, next) => {
      try {
        const { page = 0, size = 20 } = req.query;
        const pos = await Pharmacy.PurchaseOrder.findAll({
          offset: page * size,
          limit: size,
          order: [['createdAt', 'DESC']],
        });
        res.json({ content: pos, page, size, total: await Pharmacy.PurchaseOrder.count() });
      } catch (e) { next(e); }
    });

  // Goods Receipt Notes
  router.post('/grn', authRequired, requireFunc('pharmacy.grn.create'), validate(schemas.grn),
    async (req, res, next) => {
      try { res.status(201).json(await Pharmacy.GoodsReceiptNote.create(req.body)); } catch (e) { next(e); }
    });

  router.get('/grn', authRequired, requireFunc('pharmacy.grn.view'), validate(schemas.query, 'query'),
    async (req, res, next) => {
      try {
        const { page = 0, size = 20 } = req.query;
        const grns = await Pharmacy.GoodsReceiptNote.findAll({
          offset: page * size,
          limit: size,
          order: [['receivedAt', 'DESC']],
        });
        res.json({ content: grns, page, size, total: await Pharmacy.GoodsReceiptNote.count() });
      } catch (e) { next(e); }
    });

  // Stock management (simplified)
  router.post('/stock/adjust', authRequired, requireFunc('pharmacy.stock.adjust'),
    async (req, res, next) => {
      try { res.json({ adjustmentId: Date.now(), status: 'recorded' }); } catch (e) { next(e); }
    });

  router.post('/stock/audit', authRequired, requireFunc('pharmacy.stock.audit'),
    async (req, res, next) => {
      try { res.json({ auditId: Date.now(), status: 'initiated' }); } catch (e) { next(e); }
    });

  // Indents
  router.post('/indents', authRequired, requireFunc('pharmacy.indent.create'), validate(schemas.indent),
    async (req, res, next) => {
      try { res.status(201).json(await Pharmacy.Indent.create({ ...req.body, requestedBy: req.user.id })); } catch (e) { next(e); }
    });

  router.patch('/indents/:id/approve', authRequired, requireFunc('pharmacy.indent.manage'),
    async (req, res, next) => {
      try {
        const indent = await Pharmacy.Indent.findByPk(req.params.id);
        if (!indent) throw new NotFound('Indent not found');
        res.json(await indent.update({ status: 'APPROVED', approvedAt: new Date() }));
      } catch (e) { next(e); }
    });

  router.post('/expiry/manage', authRequired, requireFunc('pharmacy.expiry.manage'),
    async (req, res, next) => {
      try { res.json({ expiryMgmtId: Date.now(), status: 'initiated' }); } catch (e) { next(e); }
    });

  router.post('/catalogue/manage', authRequired, requireFunc('pharmacy.catalogue.manage'),
    async (req, res, next) => {
      try { res.json({ catalogueId: Date.now(), status: 'updated' }); } catch (e) { next(e); }
    });
};
