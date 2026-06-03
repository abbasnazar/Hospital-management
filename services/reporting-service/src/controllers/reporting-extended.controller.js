'use strict';

const Joi = require('joi');
const validate = require('../middleware/validate');
const { authRequired, requireFunc } = require('../middleware/auth');

const schema = { query: Joi.object({ startDate: Joi.date().iso().optional(), endDate: Joi.date().iso().optional() }) };

const reports = {
  ipdCensus: () => ({ bedOccupancy: 0.75, admissions: 45, discharges: 38, alos: 4.2 }),
  doctorPerf: () => ({ topDoctors: [], consultations: 0, revenue: 0 }),
  labTat: () => ({ avgTat: '2.5 hours', onTimeRate: 0.92 }),
  pharmConsump: () => ({ slowMoving: [], consumption: [] }),
  outstandingDues: () => ({ totalDue: 0, patientCount: 0 }),
  insuranceClaims: () => ({ submitted: 0, approved: 0, rejected: 0, pending: 0 }),
};

module.exports = (router) => {
  router.get('/ipd-census', authRequired, requireFunc('reports.ipd.census'), validate(schema.query, 'query'),
    async (req, res, next) => { try { res.json(reports.ipdCensus()); } catch (e) { next(e); } });

  router.get('/doctor-performance', authRequired, requireFunc('reports.doctor.performance'), validate(schema.query, 'query'),
    async (req, res, next) => { try { res.json(reports.doctorPerf()); } catch (e) { next(e); } });

  router.get('/lab-tat', authRequired, requireFunc('reports.lab.tat'), validate(schema.query, 'query'),
    async (req, res, next) => { try { res.json(reports.labTat()); } catch (e) { next(e); } });

  router.get('/pharmacy-consumption', authRequired, requireFunc('reports.pharmacy.consumption'), validate(schema.query, 'query'),
    async (req, res, next) => { try { res.json(reports.pharmConsump()); } catch (e) { next(e); } });

  router.get('/billing-outstanding', authRequired, requireFunc('reports.billing.outstanding'), validate(schema.query, 'query'),
    async (req, res, next) => { try { res.json(reports.outstandingDues()); } catch (e) { next(e); } });

  router.get('/insurance-claims', authRequired, requireFunc('reports.insurance.claims'), validate(schema.query, 'query'),
    async (req, res, next) => { try { res.json(reports.insuranceClaims()); } catch (e) { next(e); } });

  router.post('/custom/build', authRequired, requireFunc('reports.custom.build'),
    async (req, res, next) => { try { res.status(201).json({ reportId: Date.now(), status: 'CREATED' }); } catch (e) { next(e); } });

  router.post('/custom/schedule', authRequired, requireFunc('reports.custom.schedule'),
    async (req, res, next) => { try { res.status(201).json({ scheduleId: Date.now(), status: 'SCHEDULED' }); } catch (e) { next(e); } });

  router.get('/export/:id/excel', authRequired, requireFunc('reports.export.excel'),
    async (req, res, next) => { try { res.json({ reportId: req.params.id, format: 'XLSX', url: '/exports/report.xlsx' }); } catch (e) { next(e); } });

  router.get('/audit-trail', authRequired, requireFunc('reports.audit.trail'), validate(schema.query, 'query'),
    async (req, res, next) => { try { res.json({ auditEvents: [] }); } catch (e) { next(e); } });
};
