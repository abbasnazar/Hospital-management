'use strict';

const Joi      = require('joi');
const validate = require('../middleware/validate');
const { authRequired, requireRoles } = require('../middleware/auth');
const svc      = require('../services/patient.service');

const schemas = {
  create: Joi.object({
    firstName:        Joi.string().min(1).max(80).required(),
    lastName:         Joi.string().min(1).max(80).required(),
    dob:              Joi.date().iso().required(),
    gender:           Joi.string().valid('M','F','O').required(),
    phone:            Joi.string().max(20).optional(),
    email:            Joi.string().email().optional(),
    address:          Joi.string().max(500).optional(),
    emergencyContact: Joi.string().max(120).optional(),
    bloodGroup:       Joi.string().max(4).optional(),
    visitCategory:    Joi.string().valid('OPD','CASUALTY').default('OPD'),
  }),
  update: Joi.object({
    firstName:        Joi.string().min(1).max(80).optional(),
    lastName:         Joi.string().min(1).max(80).optional(),
    dob:              Joi.date().iso().optional(),
    gender:           Joi.string().valid('M','F','O').optional(),
    phone:            Joi.string().max(20).optional(),
    email:            Joi.string().email().optional(),
    address:          Joi.string().max(500).optional(),
    emergencyContact: Joi.string().max(120).optional(),
    bloodGroup:       Joi.string().max(4).optional(),
    visitCategory:    Joi.string().valid('OPD','CASUALTY').optional(),
  }).min(1),
  query: Joi.object({
    q:    Joi.string().max(80).optional(),
    page: Joi.number().integer().min(0).default(0),
    size: Joi.number().integer().min(1).max(200).default(20),
  }),
};

const clinicalRoles = ['ADMIN','DOCTOR','NURSE','RECEPTIONIST'];

module.exports = (router) => {
  router.post('/',
    authRequired, requireRoles('ADMIN','RECEPTIONIST'),
    validate(schemas.create),
    async (req, res, next) => {
      try { res.status(201).json(await svc.create(req.body)); } catch (e) { next(e); }
    },
  );

  router.get('/',
    authRequired, requireRoles(...clinicalRoles),
    validate(schemas.query, 'query'),
    async (req, res, next) => {
      try { res.json(await svc.list(req.query)); } catch (e) { next(e); }
    },
  );

  router.get('/:id',
    authRequired, requireRoles(...clinicalRoles),
    async (req, res, next) => {
      try { res.json(await svc.getById(req.params.id)); } catch (e) { next(e); }
    },
  );

  router.put('/:id',
    authRequired, requireRoles('ADMIN','RECEPTIONIST','DOCTOR'),
    validate(schemas.update),
    async (req, res, next) => {
      try { res.json(await svc.update(req.params.id, req.body)); } catch (e) { next(e); }
    },
  );

  router.delete('/:id',
    authRequired, requireRoles('ADMIN'),
    async (req, res, next) => {
      try { await svc.remove(req.params.id); res.status(204).end(); } catch (e) { next(e); }
    },
  );
};
