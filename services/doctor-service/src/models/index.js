'use strict';

const sequelize    = require('../db/sequelize');
const ClinicalNote = require('./ClinicalNote');
const Diagnosis    = require('./Diagnosis');

module.exports = { sequelize, ClinicalNote, Diagnosis };
