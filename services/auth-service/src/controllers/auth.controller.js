'use strict';

const Joi      = require('joi');
const validate = require('../middleware/validate');
const auth     = require('../services/auth.service');

const schemas = {
  register: Joi.object({
    username: Joi.string().min(3).max(80).required(),
    email:    Joi.string().email().required(),
    password: Joi.string().min(8).max(128).required(),
    roles:    Joi.array().items(Joi.string().valid(
      'ADMIN','DOCTOR','NURSE','LAB_TECH','PHARMACIST','RECEPTIONIST','PATIENT',
    )).optional(),
  }),
  login: Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
    otp:      Joi.string().pattern(/^[0-9]{6}$/).optional(),
  }),
  refresh: Joi.object({ refreshToken: Joi.string().required() }),
  otp:     Joi.object({ otp: Joi.string().pattern(/^[0-9]{6}$/).required() }),
};

module.exports = (router) => {
  router.post('/register', validate(schemas.register), async (req, res, next) => {
    try { res.status(201).json(await auth.register(req.body)); } catch (e) { next(e); }
  });

  router.post('/login', validate(schemas.login), async (req, res, next) => {
    try { res.json(await auth.login(req.body)); } catch (e) { next(e); }
  });

  router.post('/refresh', validate(schemas.refresh), async (req, res, next) => {
    try { res.json(await auth.refresh(req.body.refreshToken)); } catch (e) { next(e); }
  });

  const authRequired = require('../middleware/authRequired');
  router.post('/mfa/enrol', authRequired, async (req, res, next) => {
    try { res.json(await auth.enrolMfa(req.user.id)); } catch (e) { next(e); }
  });

  router.post('/mfa/verify', authRequired, validate(schemas.otp), async (req, res, next) => {
    try { res.json(await auth.verifyMfa(req.user.id, req.body.otp)); } catch (e) { next(e); }
  });
};
