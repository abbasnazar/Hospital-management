'use strict';

const Joi = require('joi');
const validate = require('../middleware/validate');
const { authRequired, requireRoles } = require('../middleware/auth');
const svc = require('../services/bed.service');

const allocateSchema = Joi.object({ admissionId: Joi.number().integer().positive().optional() });
const statusSchema   = Joi.object({ status: Joi.string().valid(...svc.VALID).required() });

const RW = ['ADMIN', 'NURSE', 'DOCTOR'];

module.exports = (router) => {
  router.get('/',
    authRequired, requireRoles(...RW, 'RECEPTIONIST'),
    async (req, res, next) => { try { res.json(await svc.list(req.query)); } catch (e) { next(e); } });

  router.get('/:id',
    authRequired, requireRoles(...RW, 'RECEPTIONIST'),
    async (req, res, next) => { try { res.json(await svc.getById(req.params.id)); } catch (e) { next(e); } });

  router.post('/:id/allocate',
    authRequired, requireRoles(...RW),
    validate(allocateSchema),
    async (req, res, next) => { try { res.json(await svc.allocate(req.params.id, req.body)); } catch (e) { next(e); } });

  router.post('/:id/release',
    authRequired, requireRoles(...RW),
    async (req, res, next) => { try { res.json(await svc.release(req.params.id)); } catch (e) { next(e); } });

  router.patch('/:id/status',
    authRequired, requireRoles(...RW),
    validate(statusSchema),
    async (req, res, next) => { try { res.json(await svc.setStatus(req.params.id, req.body.status)); } catch (e) { next(e); } });
};
