'use strict';

const { Op } = require('sequelize');
const { authRequired, requireRoles } = require('../middleware/auth');
const { sequelize, DailyMis } = require('../models');

const analyticsRoles = ['ADMIN','DOCTOR','RECEPTIONIST'];

module.exports = (router) => {
  /**
   * Daily MIS report.
   *
   * Strategy:
   *   - TODAY's numbers are always computed live from the transactional tables
   *     so the dashboard reflects reality in real time.
   *   - HISTORICAL dates prefer a pre-aggregated `reporting_daily_mis` row if
   *     one exists (populated by the nightly rollup job), and fall back to
   *     live computation otherwise.
   */
  router.get('/mis/daily',
    authRequired, requireRoles(...analyticsRoles),
    async (req, res, next) => {
      try {
        const { site = 'MAIN', date } = req.query;

        if (!date) {
          const rows = await DailyMis.findAll({ where: { site }, order: [['reportDate','DESC']], limit: 30 });
          return res.json({ content: rows });
        }

        // Use the DB's current date (respects MySQL server timezone) so that
        // "isToday" stays correct regardless of UTC / local time differences.
        const [{ today: todayIso }] = await sequelize.query(
          'SELECT DATE_FORMAT(CURRENT_DATE, "%Y-%m-%d") AS today',
          { type: sequelize.QueryTypes.SELECT },
        );
        const isToday = (date === todayIso);

        const [live] = await sequelize.query(`
          SELECT
            (SELECT COUNT(*) FROM patient_patient
               WHERE DATE(created_at) = :d)                                    AS registrations,
            (SELECT COUNT(*) FROM patient_appointment
               WHERE DATE(slot_start) = :d
                 AND status NOT IN ('CANCELLED','NO_SHOW'))                    AS opd_count,
            (SELECT COUNT(*) FROM lab_order
               WHERE DATE(ordered_at) = :d)                                    AS lab_orders,
            (SELECT COUNT(*) FROM pharmacy_dispense
               WHERE DATE(dispensed_at) = :d)                                  AS rx_dispensed,
            (SELECT COALESCE(SUM(total_amount),0) FROM billing_invoice
               WHERE DATE(created_at) = :d)                                    AS revenue_gross,
            (SELECT COALESCE(SUM(amount),0) FROM billing_payment
               WHERE DATE(paid_at) = :d AND status = 'CAPTURED')               AS revenue_net
        `, { replacements: { d: date }, type: sequelize.QueryTypes.SELECT });

        const preAgg = isToday ? null : await DailyMis.findOne({ where: { reportDate: date, site } });

        res.json({
          reportDate:    date,
          site,
          registrations: Number(live.registrations) || 0,
          opdCount:      preAgg ? preAgg.opdCount     : (Number(live.opd_count)     || 0),
          ipdAdmissions: preAgg ? preAgg.ipdAdmissions : 0,
          ipdDischarges: preAgg ? preAgg.ipdDischarges : 0,
          labOrders:     preAgg ? preAgg.labOrders    : (Number(live.lab_orders)    || 0),
          rxDispensed:   preAgg ? preAgg.rxDispensed  : (Number(live.rx_dispensed)  || 0),
          revenueGross:  preAgg ? preAgg.revenueGross : (Number(live.revenue_gross) || 0),
          revenueNet:    preAgg ? preAgg.revenueNet   : (Number(live.revenue_net)   || 0),
        });
      } catch (e) { next(e); }
    },
  );

  router.get('/mis/range',
    authRequired, requireRoles(...analyticsRoles),
    async (req, res, next) => {
      try {
        const { from, to, site = 'MAIN' } = req.query;
        const where = { site };
        if (from || to) {
          where.reportDate = {};
          if (from) where.reportDate[Op.gte] = from;
          if (to)   where.reportDate[Op.lte] = to;
        }
        const rows = await DailyMis.findAll({ where, order: [['reportDate','ASC']] });
        res.json({ content: rows });
      } catch (e) { next(e); }
    },
  );

  router.get('/revenue/monthly',
    authRequired, requireRoles('ADMIN'),
    async (_req, res, next) => {
      try {
        const rows = await sequelize.query(`
          SELECT DATE_FORMAT(paid_at, '%Y-%m') AS month,
                 SUM(amount) AS revenue
          FROM billing_payment
          WHERE status = 'CAPTURED'
          GROUP BY month
          ORDER BY month DESC
          LIMIT 24
        `, { type: sequelize.QueryTypes.SELECT });
        res.json({ content: rows });
      } catch (e) { next(e); }
    },
  );

  router.get('/operational/patient-counts',
    authRequired, requireRoles(...analyticsRoles),
    async (_req, res, next) => {
      try {
        const [row] = await sequelize.query(
          'SELECT COUNT(*) AS total_patients FROM patient_patient',
          { type: sequelize.QueryTypes.SELECT },
        );
        res.json(row);
      } catch (e) { next(e); }
    },
  );

  // Power BI compatible (OData-like) flat payload.
  router.get('/powerbi/patients',
    authRequired, requireRoles('ADMIN'),
    async (_req, res, next) => {
      try {
        const rows = await sequelize.query(`
          SELECT id, mrn, first_name, last_name, gender, dob, blood_group, created_at
          FROM patient_patient ORDER BY id DESC LIMIT 10000
        `, { type: sequelize.QueryTypes.SELECT });
        res.json({ value: rows, '@odata.count': rows.length });
      } catch (e) { next(e); }
    },
  );

  router.get('/powerbi/revenue',
    authRequired, requireRoles('ADMIN'),
    async (_req, res, next) => {
      try {
        const rows = await sequelize.query(`
          SELECT p.id, p.invoice_id, p.method, p.amount, p.status, p.paid_at,
                 i.patient_id, i.total_amount
          FROM billing_payment p
          JOIN billing_invoice i ON i.id = p.invoice_id
          ORDER BY p.id DESC LIMIT 10000
        `, { type: sequelize.QueryTypes.SELECT });
        res.json({ value: rows, '@odata.count': rows.length });
      } catch (e) { next(e); }
    },
  );
};
