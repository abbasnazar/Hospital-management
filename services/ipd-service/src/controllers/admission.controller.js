'use strict';

const Joi = require('joi');
const validate = require('../middleware/validate');
const { authRequired, requireRoles } = require('../middleware/auth');
const svc = require('../services/admission.service');

const createSchema = Joi.object({
  patientId:          Joi.number().integer().positive().required(),
  doctorId:           Joi.number().integer().positive().required(),
  admissionType:      Joi.string().valid('EMERGENCY', 'PLANNED').default('PLANNED'),
  admissionSource:    Joi.string().valid('DOCTOR_RECOMMENDATION', 'EMERGENCY', 'PLANNED').optional(),
  reason:             Joi.string().max(500).required(),
  expectedStay:       Joi.number().integer().min(1).optional(),
  department:         Joi.string().max(80).optional(),
  bedType:            Joi.string().max(40).optional(),
  bedId:              Joi.number().integer().positive().optional(),
  emergencyId:        Joi.number().integer().positive().optional(),
  consultingDoctorId: Joi.number().integer().positive().optional(),
});

const approveSchema = Joi.object({ bedId: Joi.number().integer().positive().optional() });

module.exports = (router) => {
  router.post('/',
    authRequired, requireRoles('DOCTOR', 'ADMIN', 'NURSE'),
    validate(createSchema),
    async (req, res, next) => { try { res.status(201).json(await svc.create(req.body, req.user)); } catch (e) { next(e); } });

  router.get('/',
    authRequired, requireRoles('DOCTOR', 'ADMIN', 'NURSE'),
    async (req, res, next) => { try { res.json(await svc.list(req.query)); } catch (e) { next(e); } });

  router.get('/patients/:patientId/current-admission',
    authRequired, requireRoles('DOCTOR', 'ADMIN', 'NURSE'),
    async (req, res, next) => { try { res.json(await svc.currentAdmission(req.params.patientId)); } catch (e) { next(e); } });

  router.get('/:id',
    authRequired, requireRoles('DOCTOR', 'ADMIN', 'NURSE'),
    async (req, res, next) => { try { res.json(await svc.getById(req.params.id)); } catch (e) { next(e); } });

  router.patch('/:id/approve',
    authRequired, requireRoles('ADMIN', 'RECEPTIONIST', 'DOCTOR'),
    validate(approveSchema),
    async (req, res, next) => { try { res.json(await svc.approve(req.params.id, req.body, req.user)); } catch (e) { next(e); } });

  router.patch('/:id',
    authRequired, requireRoles('DOCTOR', 'ADMIN'),
    async (req, res, next) => { try { res.json(await svc.update(req.params.id, req.body)); } catch (e) { next(e); } });
};
