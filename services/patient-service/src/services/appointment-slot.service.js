'use strict';

const { AppointmentSlot, AppointmentWaitlist } = require('../models');
const { NotFound } = require('../utils/errors');

const getByDoctor = async (doctorId, query) => {
  const { page = 0, size = 20 } = query;
  const offset = page * size;

  const slots = await AppointmentSlot.findAll({
    where: { doctorId },
    offset,
    limit: size,
    order: [['dayOfWeek', 'ASC'], ['startTime', 'ASC']],
  });

  const total = await AppointmentSlot.count({ where: { doctorId } });

  return { content: slots, page, size, total };
};

const getById = async (id) => {
  const slot = await AppointmentSlot.findByPk(id);
  if (!slot) throw new NotFound('Appointment slot not found');
  return slot;
};

const create = async (data) => {
  return AppointmentSlot.create({
    doctorId: data.doctorId,
    dayOfWeek: data.dayOfWeek,
    startTime: data.startTime,
    endTime: data.endTime,
    maxAppointments: data.maxAppointments || 1,
    status: 'ACTIVE',
  });
};

const update = async (id, data) => {
  const slot = await AppointmentSlot.findByPk(id);
  if (!slot) throw new NotFound('Appointment slot not found');

  return slot.update({
    dayOfWeek: data.dayOfWeek !== undefined ? data.dayOfWeek : slot.dayOfWeek,
    startTime: data.startTime !== undefined ? data.startTime : slot.startTime,
    endTime: data.endTime !== undefined ? data.endTime : slot.endTime,
    maxAppointments: data.maxAppointments !== undefined ? data.maxAppointments : slot.maxAppointments,
    status: data.status !== undefined ? data.status : slot.status,
  });
};

const remove = async (id) => {
  const slot = await AppointmentSlot.findByPk(id);
  if (!slot) throw new NotFound('Appointment slot not found');
  await slot.destroy();
};

module.exports = { getByDoctor, getById, create, update, remove };
