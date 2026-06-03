'use strict';

const { Feedback } = require('../models');

const create = async (data) => {
  return Feedback.create({
    patientId: data.patientId,
    doctorId: data.doctorId,
    department: data.department,
    rating: data.rating,
    comments: data.comments,
  });
};

const getByDept = async (dept, query) => {
  const { page = 0, size = 20 } = query;
  const feedback = await Feedback.findAll({
    where: { department: dept },
    offset: page * size,
    limit: size,
    order: [['createdAt', 'DESC']],
  });
  const total = await Feedback.count({ where: { department: dept } });
  const avgRating = await Feedback.findAll({
    attributes: [['AVG(rating)', 'avgRating']],
    where: { department: dept },
    raw: true,
  });
  return { content: feedback, page, size, total, avgRating: avgRating[0]?.avgRating };
};

module.exports = { create, getByDept };
