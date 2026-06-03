'use strict';

const Joi = require('joi');
const validate = require('../middleware/validate');
const { authRequired, requireRoles } = require('../middleware/auth');
const svc = require('../services/triage.service');

const createSchema = Joi.object({
  patientId:        Joi.number().integer().positive().required(),
  appointmentId:    Joi.number().integer().positive().optional(),
  temperature:      Joi.number().min(25).max(45).optional(),
  pulse:            Joi.number().integer().min(0).max(300).optional(),
  bpSystolic:       Joi.number().integer().min(0).max(300).optional(),
  bpDiastolic:      Joi.number().integer().min(0).max(200).optional(),
  oxygenSaturation: Joi.number().integer().min(0).max(100).optional(),
  weight:           Joi.number().min(0).max(500).optional(),
  height:           Joi.number().min(0).max(300).optional(),
  chiefComplaint:   Joi.string().max(500).optional(),
  priority:         Joi.string().valid('GREEN', 'YELLOW', 'RED').optional(),
});

const updateSchema = Joi.object({
  priority: Joi.string().valid('GREEN', 'YELLOW', 'RED').optional(),
  status:   Joi.string().max(20).optional(),
}).min(1);

module.exports = (router) => {
  router.post('/',
    authRequired, requireRoles('ADMIN', 'RECEPTIONIST', 'NURSE', 'DOCTOR'),
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

  router.patch('/:id',
    authRequired, requireRoles('ADMIN', 'RECEPTIONIST', 'NURSE', 'DOCTOR'),
    validate(updateSchema),
    async (req, res, next) => {
      try { res.json(await svc.update(req.params.id, req.body)); } catch (e) { next(e); }
    });
};
