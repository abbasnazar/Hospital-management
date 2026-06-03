'use strict';

const { OpdTokenSeries } = require('../models');
const { NotFound } = require('../utils/errors');

const getByDept = async (dept) => {
  return OpdTokenSeries.findOne({ where: { department: dept } });
};

const create = async (data) => {
  return OpdTokenSeries.create({
    department: data.department,
    seriesName: data.seriesName,
    currentNum: 0,
    resetDaily: data.resetDaily !== undefined ? data.resetDaily : true,
    status: 'ACTIVE',
  });
};

const getNextToken = async (dept) => {
  const series = await OpdTokenSeries.findOne({ where: { department: dept } });
  if (!series) throw new NotFound('OPD token series not found');

  const nextNum = series.currentNum + 1;
  await series.update({ currentNum: nextNum });
  return `${series.seriesName}-${nextNum}`;
};

const resetDaily = async (dept) => {
  const series = await OpdTokenSeries.findOne({ where: { department: dept } });
  if (series && series.resetDaily) {
    await series.update({ currentNum: 0 });
  }
};

module.exports = { getByDept, create, getNextToken, resetDaily };
