'use strict';

const Joi = require('joi');
const validate = require('../middleware/validate');
const { authRequired, requireRoles } = require('../middleware/auth');
const svc = require('../services/emergency.service');

const createSchema = Joi.object({
  patientId:         Joi.number().integer().positive().optional(),
  arrivalTime:       Joi.date().optional(),
  incidentType:      Joi.string().max(100).optional(),
  severity:          Joi.string().valid('GREEN', 'YELLOW', 'RED').optional(),
  broughtBy:         Joi.string().max(120).optional(),
  ambulanceNumber:   Joi.string().max(40).optional(),
  emergencyDoctorId: Joi.number().integer().positive().optional(),
});

const statusSchema = Joi.object({
  status:            Joi.string().valid('WAITING', 'UNDER_TREATMENT', 'OBSERVATION', 'ADMITTED', 'DISCHARGED').optional(),
  emergencyDoctorId: Joi.number().integer().positive().optional(),
  severity:          Joi.string().valid('GREEN', 'YELLOW', 'RED').optional(),
}).min(1);

const ROLES = ['ADMIN', 'RECEPTIONIST', 'DOCTOR', 'NURSE'];

module.exports = (router) => {
  router.post('/',
    authRequired, requireRoles(...ROLES),
    validate(createSchema),
    async (req, res, next) => {
      try { res.status(201).json(await svc.create(req.body)); } catch (e) { next(e); }
    });

  router.get('/',
    authRequired, requireRoles(...ROLES),
    async (req, res, next) => {
      try { res.json(await svc.list(req.query)); } catch (e) { next(e); }
    });

  router.get('/:id',
    authRequired, requireRoles(...ROLES),
    async (req, res, next) => {
      try { res.json(await svc.getById(req.params.id)); } catch (e) { next(e); }
    });

  router.patch('/:id/status',
    authRequired, requireRoles(...ROLES),
    validate(statusSchema),
    async (req, res, next) => {
      try { res.json(await svc.update(req.params.id, req.body)); } catch (e) { next(e); }
    });
};
