'use strict';

const Joi = require('joi');
const validate = require('../middleware/validate');
const { authRequired, requireFunc } = require('../middleware/auth');
const { Staff, Attendance, Leave } = require('../models');

const schemas = {
  staff: Joi.object({
    employeeId: Joi.string().max(40).required(),
    firstName: Joi.string().max(80).required(),
    lastName: Joi.string().max(80).required(),
    designation: Joi.string().max(80).required(),
    department: Joi.string().max(80).required(),
    phone: Joi.string().max(20).optional(),
    email: Joi.string().email().optional(),
  }),
  attendance: Joi.object({
    staffId: Joi.number().required(),
    attendanceDate: Joi.date().iso().required(),
    status: Joi.string().valid('PRESENT','ABSENT','LEAVE','LATE').required(),
  }),
  leave: Joi.object({
    staffId: Joi.number().required(),
    leaveType: Joi.string().max(40).required(),
    fromDate: Joi.date().iso().required(),
    toDate: Joi.date().iso().required(),
    reason: Joi.string().max(300).optional(),
  }),
  query: Joi.object({ page: Joi.number().integer().min(0).default(0), size: Joi.number().integer().min(1).max(200).default(20) }),
};

module.exports = (router) => {
  router.get('/staff', authRequired, requireFunc('hr.staff.view'),
    async (req, res, next) => { try { res.json(await Staff.findAll()); } catch (e) { next(e); } });

  router.post('/staff', authRequired, requireFunc('hr.staff.manage'), validate(schemas.staff),
    async (req, res, next) => { try { res.status(201).json(await Staff.create(req.body)); } catch (e) { next(e); } });

  router.put('/staff/:id', authRequired, requireFunc('hr.staff.manage'), validate(schemas.staff.min(1)),
    async (req, res, next) => { try { const s = await Staff.findByPk(req.params.id); res.json(await s.update(req.body)); } catch (e) { next(e); } });

  router.get('/attendance', authRequired, requireFunc('hr.attendance.view'), validate(schemas.query, 'query'),
    async (req, res, next) => { try { const att = await Attendance.findAll({ offset: req.query.page * req.query.size, limit: req.query.size }); res.json({ content: att, page: req.query.page, size: req.query.size }); } catch (e) { next(e); } });

  router.post('/attendance', authRequired, requireFunc('hr.attendance.mark'), validate(schemas.attendance),
    async (req, res, next) => { try { res.status(201).json(await Attendance.create(req.body)); } catch (e) { next(e); } });

  router.get('/roster', authRequired, requireFunc('hr.roster.view'),
    async (req, res, next) => { try { res.json({ roster: [] }); } catch (e) { next(e); } });

  router.post('/roster', authRequired, requireFunc('hr.roster.manage'),
    async (req, res, next) => { try { res.status(201).json({ rosterId: Date.now() }); } catch (e) { next(e); } });

  router.get('/leave', authRequired, requireFunc('hr.leave.view'), validate(schemas.query, 'query'),
    async (req, res, next) => { try { const leaves = await Leave.findAll({ offset: req.query.page * req.query.size, limit: req.query.size }); res.json({ content: leaves, page: req.query.page, size: req.query.size }); } catch (e) { next(e); } });

  router.post('/leave', authRequired, requireFunc('hr.leave.apply'), validate(schemas.leave),
    async (req, res, next) => { try { res.status(201).json(await Leave.create(req.body)); } catch (e) { next(e); } });

  router.patch('/leave/:id/approve', authRequired, requireFunc('hr.leave.approve'),
    async (req, res, next) => { try { const l = await Leave.findByPk(req.params.id); res.json(await l.update({ status: 'APPROVED', approvedAt: new Date(), approvedBy: req.user.id })); } catch (e) { next(e); } });

  router.get('/payroll', authRequired, requireFunc('hr.payroll.view'),
    async (req, res, next) => { try { res.json({ payslips: [] }); } catch (e) { next(e); } });

  router.post('/payroll/run', authRequired, requireFunc('hr.payroll.run'),
    async (req, res, next) => { try { res.status(201).json({ payrollId: Date.now() }); } catch (e) { next(e); } });
};
