'use strict';

const Joi = require('joi');
const validate = require('../middleware/validate');
const { authRequired, requireFunc } = require('../middleware/auth');
const { Asset, Maintenance } = require('../models');

const schemas = {
  asset: Joi.object({
    assetCode: Joi.string().max(40).required(),
    assetName: Joi.string().max(120).required(),
    category: Joi.string().max(60).required(),
    location: Joi.string().max(120).required(),
    serialNo: Joi.string().max(80).optional(),
    purchaseDate: Joi.date().iso().required(),
    purchaseCost: Joi.number().required(),
  }),
  maintenance: Joi.object({
    assetId: Joi.number().required(),
    maintenanceType: Joi.string().max(60).required(),
    requestedBy: Joi.number().required(),
    notes: Joi.string().max(500).optional(),
  }),
  query: Joi.object({ page: Joi.number().integer().min(0).default(0), size: Joi.number().integer().min(1).max(200).default(20) }),
};

module.exports = (router) => {
  router.get('/assets', authRequired, requireFunc('assets.register.view'),
    async (req, res, next) => { try { const assets = await Asset.findAll(); res.json(assets); } catch (e) { next(e); } });

  router.post('/assets', authRequired, requireFunc('assets.register.manage'), validate(schemas.asset),
    async (req, res, next) => { try { res.status(201).json(await Asset.create(req.body)); } catch (e) { next(e); } });

  router.put('/assets/:id', authRequired, requireFunc('assets.register.manage'), validate(schemas.asset.min(1)),
    async (req, res, next) => { try { const a = await Asset.findByPk(req.params.id); res.json(await a.update(req.body)); } catch (e) { next(e); } });

  router.post('/amc', authRequired, requireFunc('assets.amc.manage'),
    async (req, res, next) => { try { res.status(201).json({ amcId: Date.now() }); } catch (e) { next(e); } });

  router.post('/maintenance', authRequired, requireFunc('assets.maintenance.request'),
    async (req, res, next) => { try { res.status(201).json(await Maintenance.create(req.body)); } catch (e) { next(e); } });

  router.get('/maintenance/:assetId', authRequired, requireFunc('assets.maintenance.manage'),
    async (req, res, next) => { try { const m = await Maintenance.findAll({ where: { assetId: req.params.assetId } }); res.json(m); } catch (e) { next(e); } });

  router.post('/ppm-schedule', authRequired, requireFunc('assets.ppm.schedule'),
    async (req, res, next) => { try { res.status(201).json({ ppmId: Date.now() }); } catch (e) { next(e); } });
};
