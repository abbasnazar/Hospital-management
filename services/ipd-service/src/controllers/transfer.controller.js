'use strict';

const Joi = require('joi');
const validate = require('../middleware/validate');
const { authRequired, requireRoles } = require('../middleware/auth');
const svc = require('../services/transfer.service');

const createSchema = Joi.object({
  admissionId:    Joi.number().integer().positive().required(),
  fromBedId:      Joi.number().integer().positive().optional(),
  toBedId:        Joi.number().integer().positive().optional(),
  fromLocation:   Joi.string().max(80).optional(),
  toLocation:     Joi.string().max(80).optional(),
  reason:         Joi.string().max(500).optional(),
  doctorApproval: Joi.boolean().optional(),
});

const ROLES = ['ADMIN', 'NURSE', 'DOCTOR'];

module.exports = (router) => {
  router.post('/',
    authRequired, requireRoles(...ROLES),
    validate(createSchema),
    async (req, res, next) => { try { res.status(201).json(await svc.create(req.body, req.user)); } catch (e) { next(e); } });

  router.get('/',
    authRequired, requireRoles(...ROLES),
    async (req, res, next) => { try { res.json(await svc.list(req.query)); } catch (e) { next(e); } });
};
