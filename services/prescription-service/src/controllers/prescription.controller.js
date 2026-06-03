'use strict';

const Joi = require('joi');
const validate = require('../middleware/validate');
const { authRequired, requireRoles } = require('../middleware/auth');
const { NotFound, BadRequest, Conflict } = require('../utils/errors');

const prescriptionSchema = Joi.object({
  encounterId: Joi.number().integer().positive().required(),
  patientId: Joi.number().integer().positive().required(),
  items: Joi.array().items(
    Joi.object({
      medicineId: Joi.number().integer().positive().required(),
      dose: Joi.string().max(60).required(),
      frequency: Joi.string().max(60).required(),
      durationDays: Joi.number().integer().min(1).default(1),
      qty: Joi.number().integer().min(1).default(1),
      instructions: Joi.string().max(500).optional(),
      clinicalReason: Joi.string().max(500).optional(),
    })
  ).min(1).required(),
  clinicalNotes: Joi.string().max(1000).optional(),
});

const prescriptionUpdateSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      medicineId: Joi.number().integer().positive().required(),
      dose: Joi.string().max(60).required(),
      frequency: Joi.string().max(60).required(),
      durationDays: Joi.number().integer().min(1).default(1),
      qty: Joi.number().integer().min(1).default(1),
      instructions: Joi.string().max(500).optional(),
      clinicalReason: Joi.string().max(500).optional(),
    })
  ).optional(),
  clinicalNotes: Joi.string().max(1000).optional(),
});

const notesSchema = Joi.object({
  notes: Joi.string().max(1000).required(),
});

module.exports = (router) => {
  // Create prescription
  router.post('/',
    authRequired, requireRoles('DOCTOR'),
    validate(prescriptionSchema),
    async (req, res, next) => {
      try {
        // Implementation would connect to database
        const prescription = {
          id: Math.floor(Math.random() * 10000),
          ...req.validatedBody,
          doctorId: req.user.id,
          status: 'DRAFT',
          createdAt: new Date(),
        };
        res.status(201).json(prescription);
      } catch (e) { next(e); }
    },
  );

  // Get prescription by ID
  router.get('/:id',
    authRequired,
    async (req, res, next) => {
      try {
        // Implementation would fetch from database
        res.json({ id: req.params.id, status: 'ACTIVE' });
      } catch (e) { next(e); }
    },
  );

  // Update prescription (before dispensing)
  router.put('/:id',
    authRequired, requireRoles('DOCTOR'),
    validate(prescriptionUpdateSchema),
    async (req, res, next) => {
      try {
        const { id } = req.params;
        // Implementation would update database
        res.json({ id, ...req.validatedBody, updated: true });
      } catch (e) { next(e); }
    },
  );

  // Sign prescription
  router.post('/:id/sign',
    authRequired, requireRoles('DOCTOR'),
    async (req, res, next) => {
      try {
        const { id } = req.params;
        // Implementation would sign in database
        res.json({ id, signedAt: new Date(), status: 'ACTIVE' });
      } catch (e) { next(e); }
    },
  );

  // Cancel prescription
  router.post('/:id/cancel',
    authRequired, requireRoles('DOCTOR'),
    async (req, res, next) => {
      try {
        const { id } = req.params;
        // Implementation would cancel in database
        res.json({ id, cancelledAt: new Date(), status: 'CANCELLED' });
      } catch (e) { next(e); }
    },
  );

  // Add notes to prescription
  router.post('/:id/notes/add',
    authRequired, requireRoles('DOCTOR'),
    validate(notesSchema),
    async (req, res, next) => {
      try {
        const { id } = req.params;
        // Implementation would add notes in database
        res.json({ id, notesAdded: true, timestamp: new Date() });
      } catch (e) { next(e); }
    },
  );

  // Get prescription history for patient
  router.get('/patient/:patientId',
    authRequired,
    async (req, res, next) => {
      try {
        const { patientId } = req.params;
        // Implementation would query database
        res.json({ patientId, prescriptions: [], count: 0 });
      } catch (e) { next(e); }
    },
  );
};
