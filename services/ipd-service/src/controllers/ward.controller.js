'use strict';

const { authRequired, requireRoles } = require('../middleware/auth');
const svc = require('../services/ward.service');

const ROLES = ['ADMIN', 'NURSE', 'DOCTOR', 'RECEPTIONIST'];

module.exports = (router) => {
  router.get('/',
    authRequired, requireRoles(...ROLES),
    async (_req, res, next) => { try { res.json(await svc.list()); } catch (e) { next(e); } });

  router.get('/:wardId/census',
    authRequired, requireRoles(...ROLES),
    async (req, res, next) => { try { res.json(await svc.census(req.params.wardId)); } catch (e) { next(e); } });
};
