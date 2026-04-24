'use strict';

const Joi      = require('joi');
const validate = require('../middleware/validate');
const { authRequired, requireRoles } = require('../middleware/auth');
const svc      = require('../services/appointment.service');

const schemas = {
  book: Joi.object({
    patientId: Joi.number().integer().positive().required(),
    doctorId:  Joi.number().integer().positive().required(),
    slotStart: Joi.date().iso().required(),
    slotEnd:   Joi.date().iso().required(),
    reason:    Joi.string().max(200).optional(),
  }),
  query: Joi.object({
    doctorId:  Joi.number().integer().optional(),
    patientId: Joi.number().integer().optional(),
    status:    Joi.string().optional(),
    from:      Joi.date().iso().optional(),
    to:        Joi.date().iso().optional(),
    page:      Joi.number().integer().min(0).default(0),
    size:      Joi.number().integer().min(1).max(500).default(50),
  }),
  cancel: Joi.object({ reason: Joi.string().max(200).optional() }),
};

const bookingRoles = ['ADMIN','RECEPTIONIST','DOCTOR','NURSE'];
const viewRoles    = ['ADMIN','DOCTOR','NURSE','RECEPTIONIST','PATIENT'];

module.exports = (router) => {
  router.post('/',
    authRequired, requireRoles(...bookingRoles),
    validate(schemas.book),
    async (req, res, next) => {
      try { res.status(201).json(await svc.book(req.body)); } catch (e) { next(e); }
    },
  );

  router.get('/',
    authRequired, requireRoles(...viewRoles),
    validate(schemas.query, 'query'),
    async (req, res, next) => {
      try { res.json(await svc.list(req.query)); } catch (e) { next(e); }
    },
  );

  router.post('/:id/cancel',
    authRequired, requireRoles(...bookingRoles),
    validate(schemas.cancel),
    async (req, res, next) => {
      try { res.json(await svc.cancel(req.params.id, req.body.reason)); } catch (e) { next(e); }
    },
  );
};
