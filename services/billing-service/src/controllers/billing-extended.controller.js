'use strict';

const Joi = require('joi');
const validate = require('../middleware/validate');
const { authRequired, requireFunc } = require('../middleware/auth');

const schemas = {
  advance: Joi.object({ patientId: Joi.number().required(), amount: Joi.number().required() }),
  refund: Joi.object({ patientId: Joi.number().required(), amount: Joi.number().required(), reason: Joi.string().required() }),
  creditNote: Joi.object({ invoiceId: Joi.number().required(), amount: Joi.number().required(), reason: Joi.string().required() }),
  package: Joi.object({ code: Joi.string().required(), name: Joi.string().required(), amount: Joi.number().required() }),
  tpa: Joi.object({ invoiceId: Joi.number().required(), amount: Joi.number().required() }),
};

module.exports = (router) => {
  const post = (fn) => async (req, res, next) => { try { res.status(201).json(await fn(req.body)); } catch (e) { next(e); } };
  const get = (fn) => async (req, res, next) => { try { res.json(fn()); } catch (e) { next(e); } };

  // Advance payments
  router.post('/advance', authRequired, requireFunc('billing.advance.collect'), validate(schemas.advance),
    post(async (data) => ({ advanceId: Date.now(), ...data, status: 'RECORDED' })));

  router.patch('/advance/:id/adjust', authRequired, requireFunc('billing.advance.adjust'),
    async (req, res, next) => { try { res.json({ advanceId: req.params.id, adjusted: true }); } catch (e) { next(e); } });

  // Refunds
  router.post('/refund', authRequired, requireFunc('billing.refund.create'), validate(schemas.refund),
    post(async (data) => ({ refundId: Date.now(), ...data, status: 'PENDING' })));

  router.patch('/refund/:id/approve', authRequired, requireFunc('billing.refund.approve'),
    async (req, res, next) => { try { res.json({ refundId: req.params.id, approved: true }); } catch (e) { next(e); } });

  // Credit notes
  router.post('/credit-note', authRequired, requireFunc('billing.credit.note'), validate(schemas.creditNote),
    post(async (data) => ({ creditNoteId: Date.now(), ...data, status: 'ISSUED' })));

  // Service packages
  router.post('/packages', authRequired, requireFunc('billing.package.manage'), validate(schemas.package),
    post(async (data) => ({ packageId: Date.now(), ...data, status: 'ACTIVE' })));

  router.get('/packages', authRequired, requireFunc('billing.package.manage'),
    get(() => ({ packages: [] })));

  router.post('/package-apply', authRequired, requireFunc('billing.package.apply'),
    async (req, res, next) => { try { res.json({ applied: true }); } catch (e) { next(e); } });

  // TPA
  router.post('/tpa/preauth', authRequired, requireFunc('billing.tpa.preauth'), validate(schemas.tpa),
    post(async (data) => ({ preauthId: Date.now(), ...data, status: 'SUBMITTED' })));

  router.get('/tpa/panels', authRequired, requireFunc('billing.tpa.manage'),
    get(() => ({ tpaPanels: [] })));

  router.post('/tpa/panels', authRequired, requireFunc('billing.tpa.manage'),
    post(async (data) => ({ tpaId: Date.now(), ...data })));

  // Tax & Cashier
  router.post('/tax-config', authRequired, requireFunc('billing.tax.manage'),
    async (req, res, next) => { try { res.status(201).json({ taxId: Date.now() }); } catch (e) { next(e); } });

  router.get('/cashier-summary', authRequired, requireFunc('billing.cashier.summary'),
    get(() => ({ shift: 'MORNING', totalCollection: 0 })));

  // Expenses
  router.post('/expenses', authRequired, requireFunc('billing.expense.create'),
    post(async (data) => ({ expenseId: Date.now(), ...data })));

  router.get('/expenses', authRequired, requireFunc('billing.expense.view'),
    get(() => ({ expenses: [] })));
};
