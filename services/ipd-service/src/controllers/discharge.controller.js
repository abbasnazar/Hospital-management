'use strict';

const Joi = require('joi');
const validate = require('../middleware/validate');
const { authRequired, requireRoles } = require('../middleware/auth');
const svc = require('../services/discharge.service');

const requestSchema = Joi.object({
  admissionId:      Joi.number().integer().positive().required(),
  dischargeSummary: Joi.string().max(2000).optional(),
});

const approveSchema = Joi.object({
  dischargeType:    Joi.string().valid('HOME', 'TRANSFER', 'ABSCONDED', 'DECEASED').default('HOME'),
  dischargeSummary: Joi.string().max(2000).optional(),
  followUpDate:     Joi.date().optional(),
});

module.exports = (router) => {
  router.post('/requests',
    authRequired, requireRoles('DOCTOR', 'ADMIN'),
    validate(requestSchema),
    async (req, res, next) => { try { res.status(201).json(await svc.createRequest(req.body, req.user)); } catch (e) { next(e); } });

  router.get('/requests',
    authRequired, requireRoles('DOCTOR', 'ADMIN', 'NURSE', 'PHARMACIST', 'RECEPTIONIST'),
    async (req, res, next) => { try { res.json(await svc.listRequests(req.query)); } catch (e) { next(e); } });

  router.patch('/requests/:id/billing-clear',
    authRequired, requireRoles('ADMIN', 'RECEPTIONIST'),
    async (req, res, next) => { try { res.json(await svc.billingClear(req.params.id)); } catch (e) { next(e); } });

  router.patch('/requests/:id/pharmacy-clear',
    authRequired, requireRoles('ADMIN', 'PHARMACIST'),
    async (req, res, next) => { try { res.json(await svc.pharmacyClear(req.params.id)); } catch (e) { next(e); } });

  router.patch('/requests/:id/approve',
    authRequired, requireRoles('DOCTOR', 'ADMIN'),
    validate(approveSchema),
    async (req, res, next) => { try { res.json(await svc.approve(req.params.id, req.body, req.user)); } catch (e) { next(e); } });

  router.get('/requests/:id/summary',
    authRequired, requireRoles('DOCTOR', 'ADMIN', 'NURSE'),
    async (req, res, next) => { try { res.json(await svc.summary(req.params.id)); } catch (e) { next(e); } });
};
