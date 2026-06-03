'use strict';

const Joi = require('joi');
const validate = require('../middleware/validate');
const { authRequired, requireRoles } = require('../middleware/auth');
const { NotFound } = require('../utils/errors');

const allergySchema = Joi.object({
  allergen: Joi.string().max(200).required(),
  reactionType: Joi.string().max(100).required(),
  severity: Joi.string().valid('MILD', 'MODERATE', 'SEVERE').required(),
});

const documentSchema = Joi.object({
  type: Joi.string().valid('XRAY', 'ECG', 'CT', 'ULTRASOUND', 'MRI', 'BLOODWORK', 'PATHOLOGY', 'OTHER').required(),
  fileUrl: Joi.string().uri().required(),
  uploadedAt: Joi.date().default(() => new Date()),
});

module.exports = (router) => {
  // Get complete patient record
  router.get('/:patientId/complete-record',
    authRequired,
    async (req, res, next) => {
      try {
        const { patientId } = req.params;
        // Implementation would fetch from database
        res.json({
          patientId,
          record: {
            demographics: {},
            allergies: [],
            medications: [],
            diagnoses: [],
            consultations: [],
            documents: [],
          },
        });
      } catch (e) { next(e); }
    },
  );

  // Get allergies
  router.get('/:patientId/allergies',
    authRequired,
    async (req, res, next) => {
      try {
        const { patientId } = req.params;
        res.json({ patientId, allergies: [], count: 0 });
      } catch (e) { next(e); }
    },
  );

  // Add allergy
  router.post('/:patientId/allergies',
    authRequired, requireRoles('DOCTOR', 'NURSE'),
    validate(allergySchema),
    async (req, res, next) => {
      try {
        const { patientId } = req.params;
        res.status(201).json({ patientId, allergy: req.validatedBody, added: true });
      } catch (e) { next(e); }
    },
  );

  // Get medications
  router.get('/:patientId/medications',
    authRequired,
    async (req, res, next) => {
      try {
        const { patientId } = req.params;
        res.json({ patientId, medications: [], count: 0 });
      } catch (e) { next(e); }
    },
  );

  // Get diagnoses
  router.get('/:patientId/diagnoses',
    authRequired,
    async (req, res, next) => {
      try {
        const { patientId } = req.params;
        res.json({ patientId, diagnoses: [], count: 0 });
      } catch (e) { next(e); }
    },
  );

  // Get consultation history
  router.get('/:patientId/consultations',
    authRequired,
    async (req, res, next) => {
      try {
        const { patientId } = req.params;
        res.json({ patientId, consultations: [], count: 0 });
      } catch (e) { next(e); }
    },
  );

  // Get documents
  router.get('/:patientId/documents',
    authRequired,
    async (req, res, next) => {
      try {
        const { patientId } = req.params;
        res.json({ patientId, documents: [], count: 0 });
      } catch (e) { next(e); }
    },
  );

  // Upload document
  router.post('/:patientId/documents',
    authRequired,
    validate(documentSchema),
    async (req, res, next) => {
      try {
        const { patientId } = req.params;
        res.status(201).json({ patientId, document: req.validatedBody, uploaded: true });
      } catch (e) { next(e); }
    },
  );

  // Get vital signs history
  router.get('/:patientId/vitals',
    authRequired,
    async (req, res, next) => {
      try {
        const { patientId } = req.params;
        res.json({ patientId, vitals: [], count: 0 });
      } catch (e) { next(e); }
    },
  );
};
