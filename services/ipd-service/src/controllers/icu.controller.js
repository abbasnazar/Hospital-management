'use strict';

const Joi = require('joi');
const validate = require('../middleware/validate');
const { authRequired, requireRoles } = require('../middleware/auth');
const svc = require('../services/icu.service');

const transferInSchema = Joi.object({
  admissionId:      Joi.number().integer().positive().required(),
  patientId:        Joi.number().integer().positive().required(),
  bedId:            Joi.number().integer().positive().optional(),
  assignedDoctorId: Joi.number().integer().positive().optional(),
  assignedNurseId:  Joi.number().integer().positive().optional(),
  critical:         Joi.boolean().optional(),
});

const ROLES = ['ADMIN', 'NURSE', 'DOCTOR'];

module.exports = (router) => {
  router.get('/dashboard',
    authRequired, requireRoles(...ROLES),
    async (_req, res, next) => { try { res.json(await svc.dashboard()); } catch (e) { next(e); } });

  router.get('/',
    authRequired, requireRoles(...ROLES),
    async (req, res, next) => { try { res.json(await svc.list(req.query)); } catch (e) { next(e); } });

  router.post('/transfer-in',
    authRequired, requireRoles(...ROLES),
    validate(transferInSchema),
    async (req, res, next) => { try { res.status(201).json(await svc.transferIn(req.body)); } catch (e) { next(e); } });

  router.post('/:id/transfer-out',
    authRequired, requireRoles(...ROLES),
    async (req, res, next) => { try { res.json(await svc.transferOut(req.params.id)); } catch (e) { next(e); } });
};
