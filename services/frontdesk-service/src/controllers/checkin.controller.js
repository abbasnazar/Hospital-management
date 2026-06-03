'use strict';

const Joi = require('joi');
const validate = require('../middleware/validate');
const { authRequired, requireRoles } = require('../middleware/auth');
const svc = require('../services/checkin.service');

const createSchema = Joi.object({
  patientId:     Joi.number().integer().positive().required(),
  appointmentId: Joi.number().integer().positive().optional(),
  doctorId:      Joi.number().integer().positive().optional(),
});

const statusSchema = Joi.object({
  status: Joi.string().valid('BOOKED', 'CHECKED_IN', 'WAITING', 'IN_CONSULTATION', 'COMPLETED').required(),
});

module.exports = (router) => {
  router.post('/',
    authRequired, requireRoles('ADMIN', 'RECEPTIONIST', 'NURSE'),
    validate(createSchema),
    async (req, res, next) => {
      try { res.status(201).json(await svc.create(req.body, req.user)); } catch (e) { next(e); }
    });

  router.get('/',
    authRequired, requireRoles('ADMIN', 'RECEPTIONIST', 'NURSE', 'DOCTOR'),
    async (req, res, next) => {
      try { res.json(await svc.list(req.query)); } catch (e) { next(e); }
    });

  router.get('/:id',
    authRequired, requireRoles('ADMIN', 'RECEPTIONIST', 'NURSE', 'DOCTOR'),
    async (req, res, next) => {
      try { res.json(await svc.getById(req.params.id)); } catch (e) { next(e); }
    });

  router.patch('/:id/status',
    authRequired, requireRoles('ADMIN', 'RECEPTIONIST', 'NURSE', 'DOCTOR'),
    validate(statusSchema),
    async (req, res, next) => {
      try { res.json(await svc.setStatus(req.params.id, req.body.status)); } catch (e) { next(e); }
    });
};
