'use strict';

const { AppointmentWaitlist, Patient } = require('../models');
const { NotFound } = require('../utils/errors');

const getByPatient = async (patientId, query) => {
  const { page = 0, size = 20 } = query;
  const offset = page * size;

  const waitlist = await AppointmentWaitlist.findAll({
    where: { patientId },
    offset,
    limit: size,
    order: [['position', 'ASC']],
  });

  const total = await AppointmentWaitlist.count({ where: { patientId } });

  return { content: waitlist, page, size, total };
};

const getByDoctor = async (doctorId, query) => {
  const { page = 0, size = 20 } = query;
  const offset = page * size;

  const waitlist = await AppointmentWaitlist.findAll({
    where: { doctorId, status: 'WAITING' },
    offset,
    limit: size,
    order: [['position', 'ASC']],
  });

  const total = await AppointmentWaitlist.count({ where: { doctorId, status: 'WAITING' } });

  return { content: waitlist, page, size, total };
};

const getById = async (id) => {
  const entry = await AppointmentWaitlist.findByPk(id);
  if (!entry) throw new NotFound('Waitlist entry not found');
  return entry;
};

const addToWaitlist = async (patientId, data) => {
  await Patient.findByPk(patientId);

  const lastPosition = await AppointmentWaitlist.max('position', {
    where: { doctorId: data.doctorId, status: 'WAITING' },
  }) || 0;

  return AppointmentWaitlist.create({
    patientId,
    doctorId: data.doctorId,
    preferredDate: data.preferredDate,
    reason: data.reason,
    position: lastPosition + 1,
    status: 'WAITING',
  });
};

const moveUp = async (id) => {
  const entry = await AppointmentWaitlist.findByPk(id);
  if (!entry) throw new NotFound('Waitlist entry not found');

  if (entry.position > 1) {
    const prevEntry = await AppointmentWaitlist.findOne({
      where: { doctorId: entry.doctorId, position: entry.position - 1, status: 'WAITING' },
    });

    if (prevEntry) {
      prevEntry.position += 1;
      entry.position -= 1;
      await prevEntry.save();
    }
  }

  return entry.save();
};

const notifySlotAvailable = async (doctorId, preferredDate) => {
  const entries = await AppointmentWaitlist.findAll({
    where: { doctorId, preferredDate, status: 'WAITING' },
    order: [['position', 'ASC']],
    limit: 1,
  });

  if (entries.length > 0) {
    entries[0].notifiedAt = new Date();
    await entries[0].save();
    return entries[0];
  }
};

module.exports = { getByPatient, getByDoctor, getById, addToWaitlist, moveUp, notifySlotAvailable };
