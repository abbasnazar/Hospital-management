'use strict';

const Joi = require('joi');
const validate = require('../middleware/validate');
const { authRequired, requireRoles } = require('../middleware/auth');
const svc    = require('../services/nursing.service');
const bedSvc = require('../services/bed.service');

const noteSchema = Joi.object({
  admissionId: Joi.number().integer().positive().required(),
  patientId:   Joi.number().integer().positive().optional(),
  noteType:    Joi.string().valid('VITALS', 'MEDICATION', 'OBSERVATION').default('OBSERVATION'),
  vitals:      Joi.object().optional(),
  medication:  Joi.string().max(200).optional(),
  note:        Joi.string().max(5000).optional(),
});

const bedStatusSchema = Joi.object({ status: Joi.string().valid(...bedSvc.VALID).required() });

const ROLES = ['NURSE', 'ADMIN'];

module.exports = (router) => {
  router.post('/notes',
    authRequired, requireRoles(...ROLES),
    validate(noteSchema),
    async (req, res, next) => { try { res.status(201).json(await svc.createNote(req.body, req.user)); } catch (e) { next(e); } });

  router.get('/notes',
    authRequired, requireRoles('NURSE', 'ADMIN', 'DOCTOR'),
    async (req, res, next) => { try { res.json(await svc.listNotes(req.query)); } catch (e) { next(e); } });

  router.patch('/beds/:id/status',
    authRequired, requireRoles(...ROLES),
    validate(bedStatusSchema),
    async (req, res, next) => { try { res.json(await bedSvc.setStatus(req.params.id, req.body.status)); } catch (e) { next(e); } });
};
