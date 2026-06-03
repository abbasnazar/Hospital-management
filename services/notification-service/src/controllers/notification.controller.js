'use strict';

const Joi = require('joi');
const validate = require('../middleware/validate');
const { authRequired, requireRoles } = require('../middleware/auth');

const messageSchema = Joi.object({
  recipientId: Joi.number().integer().positive().required(),
  subject: Joi.string().max(200).required(),
  body: Joi.string().max(2000).required(),
  messageType: Joi.string().valid('CLINICAL', 'APPOINTMENT', 'BILLING', 'ALERT', 'GENERAL').default('GENERAL'),
});

const notificationSchema = Joi.object({
  userId: Joi.number().integer().positive().required(),
  type: Joi.string().valid('EMAIL', 'SMS', 'PUSH', 'IN_APP').required(),
  subject: Joi.string().max(200).required(),
  body: Joi.string().max(2000).required(),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').default('MEDIUM'),
});

const reminderSchema = Joi.object({
  appointmentId: Joi.number().integer().positive().required(),
  patientId: Joi.number().integer().positive().required(),
  reminderType: Joi.string().valid('EMAIL', 'SMS', 'BOTH').default('BOTH'),
  hoursBeforeAppointment: Joi.number().integer().min(1).default(24),
});

module.exports = (router) => {
  // Send message (doctor-patient)
  router.post('/messages',
    authRequired,
    validate(messageSchema),
    async (req, res, next) => {
      try {
        const message = {
          id: Math.floor(Math.random() * 10000),
          ...req.validatedBody,
          senderId: req.user.id,
          sentAt: new Date(),
          status: 'SENT',
        };
        res.status(201).json(message);
      } catch (e) { next(e); }
    },
  );

  // Get messages (inbox)
  router.get('/messages',
    authRequired,
    async (req, res, next) => {
      try {
        res.json({
          userId: req.user.id,
          messages: [],
          count: 0,
          timestamp: new Date(),
        });
      } catch (e) { next(e); }
    },
  );

  // Send notification
  router.post('/',
    authRequired, requireRoles('SYSTEM', 'ADMIN'),
    validate(notificationSchema),
    async (req, res, next) => {
      try {
        const notification = {
          id: Math.floor(Math.random() * 10000),
          ...req.validatedBody,
          sentAt: new Date(),
          status: 'SENT',
        };
        res.status(201).json(notification);
      } catch (e) { next(e); }
    },
  );

  // Set appointment reminder
  router.post('/appointment-reminders',
    authRequired, requireRoles('SYSTEM', 'ADMIN'),
    validate(reminderSchema),
    async (req, res, next) => {
      try {
        res.status(201).json({
          ...req.validatedBody,
          reminderId: Math.floor(Math.random() * 10000),
          scheduled: true,
          timestamp: new Date(),
        });
      } catch (e) { next(e); }
    },
  );

  // Get notifications for user
  router.get('/user',
    authRequired,
    async (req, res, next) => {
      try {
        res.json({
          userId: req.user.id,
          notifications: [],
          count: 0,
          unreadCount: 0,
          timestamp: new Date(),
        });
      } catch (e) { next(e); }
    },
  );

  // Mark notification as read
  router.put('/:id/read',
    authRequired,
    async (req, res, next) => {
      try {
        res.json({
          id: req.params.id,
          read: true,
          readAt: new Date(),
        });
      } catch (e) { next(e); }
    },
  );
};
