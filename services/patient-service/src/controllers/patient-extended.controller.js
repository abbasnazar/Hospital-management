'use strict';

const Joi      = require('joi');
const validate = require('../middleware/validate');
const { authRequired, requireRoles, requireFunc } = require('../middleware/auth');
const consentSvc = require('../services/consent.service');
const insuranceSvc = require('../services/insurance.service');
const slotSvc = require('../services/appointment-slot.service');
const waitlistSvc = require('../services/appointment-waitlist.service');

const schemas = {
  consent: Joi.object({
    type:        Joi.string().max(80).required(),
    description: Joi.string().max(500).optional(),
    signedBy:    Joi.string().max(120).optional(),
    signedAt:    Joi.date().iso().optional(),
  }),
  insurance: Joi.object({
    provider:    Joi.string().max(120).required(),
    policyNo:    Joi.string().max(80).required(),
    memberId:    Joi.string().max(80).optional(),
    groupId:     Joi.string().max(80).optional(),
    validFrom:   Joi.date().iso().required(),
    validUntil:  Joi.date().iso().required(),
    status:      Joi.string().valid('ACTIVE','INACTIVE').optional(),
  }),
  slot: Joi.object({
    doctorId:        Joi.number().required(),
    dayOfWeek:       Joi.string().valid('MON','TUE','WED','THU','FRI','SAT','SUN').required(),
    startTime:       Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
    endTime:         Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
    maxAppointments: Joi.number().integer().min(1).optional(),
  }),
  waitlist: Joi.object({
    doctorId:     Joi.number().required(),
    preferredDate: Joi.date().iso().required(),
    reason:       Joi.string().max(200).optional(),
  }),
  query: Joi.object({
    page: Joi.number().integer().min(0).default(0),
    size: Joi.number().integer().min(1).max(200).default(20),
  }),
};

module.exports = (router) => {
  // Consent endpoints
  router.get('/:patientId/consents',
    authRequired, requireFunc('patients.consent.view'),
    validate(schemas.query, 'query'),
    async (req, res, next) => {
      try { res.json(await consentSvc.getByPatient(req.params.patientId, req.query)); } catch (e) { next(e); }
    },
  );

  router.post('/:patientId/consents',
    authRequired, requireFunc('patients.consent.create'),
    validate(schemas.consent),
    async (req, res, next) => {
      try { res.status(201).json(await consentSvc.create(req.params.patientId, req.body)); } catch (e) { next(e); }
    },
  );

  router.patch('/consents/:id/revoke',
    authRequired, requireFunc('patients.consent.revoke'),
    async (req, res, next) => {
      try { res.json(await consentSvc.revoke(req.params.id)); } catch (e) { next(e); }
    },
  );

  // Insurance endpoints
  router.get('/:patientId/insurance',
    authRequired, requireFunc('patients.insurance.view'),
    validate(schemas.query, 'query'),
    async (req, res, next) => {
      try { res.json(await insuranceSvc.getByPatient(req.params.patientId, req.query)); } catch (e) { next(e); }
    },
  );

  router.post('/:patientId/insurance',
    authRequired, requireFunc('patients.insurance.manage'),
    validate(schemas.insurance),
    async (req, res, next) => {
      try { res.status(201).json(await insuranceSvc.create(req.params.patientId, req.body)); } catch (e) { next(e); }
    },
  );

  router.put('/insurance/:id',
    authRequired, requireFunc('patients.insurance.manage'),
    validate(schemas.insurance.min(1)),
    async (req, res, next) => {
      try { res.json(await insuranceSvc.update(req.params.id, req.body)); } catch (e) { next(e); }
    },
  );

  router.delete('/insurance/:id',
    authRequired, requireFunc('patients.insurance.manage'),
    async (req, res, next) => {
      try { await insuranceSvc.remove(req.params.id); res.status(204).end(); } catch (e) { next(e); }
    },
  );

  // Appointment slot endpoints
  router.get('/slots/by-doctor/:doctorId',
    authRequired, requireFunc('appointments.slots.manage'),
    validate(schemas.query, 'query'),
    async (req, res, next) => {
      try { res.json(await slotSvc.getByDoctor(req.params.doctorId, req.query)); } catch (e) { next(e); }
    },
  );

  router.post('/slots',
    authRequired, requireFunc('appointments.slots.manage'),
    validate(schemas.slot),
    async (req, res, next) => {
      try { res.status(201).json(await slotSvc.create(req.body)); } catch (e) { next(e); }
    },
  );

  router.put('/slots/:id',
    authRequired, requireFunc('appointments.slots.manage'),
    validate(schemas.slot.min(1)),
    async (req, res, next) => {
      try { res.json(await slotSvc.update(req.params.id, req.body)); } catch (e) { next(e); }
    },
  );

  router.delete('/slots/:id',
    authRequired, requireFunc('appointments.slots.manage'),
    async (req, res, next) => {
      try { await slotSvc.remove(req.params.id); res.status(204).end(); } catch (e) { next(e); }
    },
  );

  // Waitlist endpoints
  router.get('/:patientId/waitlist',
    authRequired, requireFunc('appointments.waitlist.manage'),
    validate(schemas.query, 'query'),
    async (req, res, next) => {
      try { res.json(await waitlistSvc.getByPatient(req.params.patientId, req.query)); } catch (e) { next(e); }
    },
  );

  router.post('/waitlist',
    authRequired, requireFunc('appointments.waitlist.manage'),
    validate(schemas.waitlist),
    async (req, res, next) => {
      try { res.status(201).json(await waitlistSvc.addToWaitlist(req.body.patientId, req.body)); } catch (e) { next(e); }
    },
  );

  router.patch('/waitlist/:id/move-up',
    authRequired, requireFunc('appointments.waitlist.manage'),
    async (req, res, next) => {
      try { res.json(await waitlistSvc.moveUp(req.params.id)); } catch (e) { next(e); }
    },
  );
};
