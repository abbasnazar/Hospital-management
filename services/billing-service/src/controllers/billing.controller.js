'use strict';

const Joi = require('joi');
const { v4: uuid } = require('uuid');
const validate = require('../middleware/validate');
const { authRequired, requireRoles } = require('../middleware/auth');
const { sequelize, Invoice, InvoiceItem, Payment, Claim } = require('../models');
const { NotFound, BadRequest } = require('../utils/errors');

const schemas = {
  invoice: Joi.object({
    patientId:   Joi.number().integer().positive().required(),
    encounterId: Joi.number().integer().positive().optional(),
    items: Joi.array().items(Joi.object({
      itemType:    Joi.string().valid('CONSULT','LAB','PHARMACY','PROCEDURE','ROOM','OTHER').required(),
      description: Joi.string().max(200).required(),
      qty:         Joi.number().integer().min(1).default(1),
      unitPrice:   Joi.number().min(0).required(),
      tax:         Joi.number().min(0).default(0),
    })).min(1).required(),
    discount: Joi.number().min(0).default(0),
  }),
  payment: Joi.object({
    invoiceId: Joi.number().integer().positive().required(),
    method:    Joi.string().valid('CASH','CARD','UPI','INSURANCE','NETBANKING').required(),
    amount:    Joi.number().positive().required(),
    txnRef:    Joi.string().max(120).optional(),
  }),
  claim: Joi.object({
    invoiceId: Joi.number().integer().positive().required(),
    payerCode: Joi.string().max(40).required(),
    amount:    Joi.number().positive().required(),
    remarks:   Joi.string().max(500).optional(),
  }),
};

const billingStaff = ['ADMIN','RECEPTIONIST','PHARMACIST'];

module.exports = (router) => {
  router.post('/invoices',
    authRequired, requireRoles(...billingStaff),
    validate(schemas.invoice),
    async (req, res, next) => {
      try {
        const invoice = await sequelize.transaction(async (t) => {
          const { items, discount, ...header } = req.body;
          let subtotal = 0, tax = 0;
          const enriched = items.map((i) => {
            const lineTotal = (Number(i.unitPrice) * i.qty) + Number(i.tax);
            subtotal += Number(i.unitPrice) * i.qty;
            tax      += Number(i.tax);
            return { ...i, total: lineTotal.toFixed(2) };
          });
          const total = subtotal + tax - Number(discount);
          const inv = await Invoice.create({
            ...header,
            invoiceNo:   `INV-${new Date().getFullYear()}-${uuid().slice(0, 8).toUpperCase()}`,
            subtotal:    subtotal.toFixed(2),
            taxAmount:   tax.toFixed(2),
            discount:    Number(discount).toFixed(2),
            totalAmount: total.toFixed(2),
            balanceDue:  total.toFixed(2),
            status:      'OPEN',
          }, { transaction: t });
          await InvoiceItem.bulkCreate(
            enriched.map((i) => ({ ...i, invoiceId: inv.id })),
            { transaction: t },
          );
          return Invoice.findByPk(inv.id, { include: [{ model: InvoiceItem, as: 'items' }], transaction: t });
        });
        res.status(201).json(invoice);
      } catch (e) { next(e); }
    },
  );

  router.get('/invoices/:id',
    authRequired, requireRoles(...billingStaff,'DOCTOR','PATIENT'),
    async (req, res, next) => {
      try {
        const inv = await Invoice.findByPk(req.params.id, {
          include: [
            { model: InvoiceItem, as: 'items' },
            { model: Payment,     as: 'payments' },
            { model: Claim,       as: 'claims' },
          ],
        });
        if (!inv) throw NotFound(`invoice ${req.params.id} not found`);
        res.json(inv);
      } catch (e) { next(e); }
    },
  );

  router.post('/payments',
    authRequired, requireRoles(...billingStaff),
    validate(schemas.payment),
    async (req, res, next) => {
      try {
        const payment = await sequelize.transaction(async (t) => {
          const inv = await Invoice.findByPk(req.body.invoiceId, { transaction: t, lock: t.LOCK.UPDATE });
          if (!inv) throw NotFound(`invoice ${req.body.invoiceId} not found`);
          if (Number(req.body.amount) > Number(inv.balanceDue) + 0.01) {
            throw BadRequest('amount exceeds balance due');
          }
          const p = await Payment.create({ ...req.body, status: 'CAPTURED' }, { transaction: t });
          const newBal = Number(inv.balanceDue) - Number(req.body.amount);
          inv.balanceDue = newBal.toFixed(2);
          inv.status     = newBal <= 0.005 ? 'PAID' : 'PARTIAL';
          await inv.save({ transaction: t });
          return p;
        });
        res.status(201).json(payment);
      } catch (e) { next(e); }
    },
  );

  router.post('/claims',
    authRequired, requireRoles('ADMIN','RECEPTIONIST'),
    validate(schemas.claim),
    async (req, res, next) => {
      try {
        const inv = await Invoice.findByPk(req.body.invoiceId);
        if (!inv) throw NotFound(`invoice ${req.body.invoiceId} not found`);
        const claim = await Claim.create({
          ...req.body,
          claimNo: `CLM-${new Date().getFullYear()}-${uuid().slice(0, 8).toUpperCase()}`,
          status:  'SUBMITTED',
        });
        res.status(201).json(claim);
      } catch (e) { next(e); }
    },
  );
};
