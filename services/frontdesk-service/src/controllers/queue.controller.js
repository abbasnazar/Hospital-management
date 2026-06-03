'use strict';

const Joi = require('joi');
const validate = require('../middleware/validate');
const { authRequired, requireRoles } = require('../middleware/auth');
const svc = require('../services/queue.service');

const callNextSchema = Joi.object({
  doctorId: Joi.number().integer().positive().optional(),
  entryId:  Joi.number().integer().positive().optional(),
}).or('doctorId', 'entryId');

const reassignSchema = Joi.object({
  doctorId: Joi.number().integer().positive().required(),
});

const ROLES = ['ADMIN', 'RECEPTIONIST', 'NURSE', 'DOCTOR'];

module.exports = (router) => {
  router.get('/',
    authRequired, requireRoles(...ROLES),
    async (req, res, next) => {
      try { res.json(await svc.list(req.query)); } catch (e) { next(e); }
    });

  router.get('/stats',
    authRequired, requireRoles(...ROLES),
    async (req, res, next) => {
      try { res.json(await svc.stats(req.query.doctorId)); } catch (e) { next(e); }
    });

  router.post('/call-next',
    authRequired, requireRoles(...ROLES),
    validate(callNextSchema),
    async (req, res, next) => {
      try { res.json(await svc.callNext(req.body)); } catch (e) { next(e); }
    });

  router.post('/:id/skip',
    authRequired, requireRoles(...ROLES),
    async (req, res, next) => {
      try { res.json(await svc.skip(req.params.id)); } catch (e) { next(e); }
    });

  router.post('/:id/no-show',
    authRequired, requireRoles(...ROLES),
    async (req, res, next) => {
      try { res.json(await svc.noShow(req.params.id)); } catch (e) { next(e); }
    });

  router.post('/:id/complete',
    authRequired, requireRoles(...ROLES),
    async (req, res, next) => {
      try { res.json(await svc.complete(req.params.id)); } catch (e) { next(e); }
    });

  router.post('/:id/reassign',
    authRequired, requireRoles(...ROLES),
    validate(reassignSchema),
    async (req, res, next) => {
      try { res.json(await svc.reassign(req.params.id, req.body.doctorId)); } catch (e) { next(e); }
    });
};
