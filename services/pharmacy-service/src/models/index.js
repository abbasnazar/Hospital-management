'use strict';
const sequelize = require('../db/sequelize');
const Medicine = require('./Medicine');
const Batch = require('./Batch');
const Prescription = require('./Prescription');
const Dispense = require('./Dispense');
const Supplier = require('./Supplier');
const PurchaseOrder = require('./PurchaseOrder');
const GoodsReceiptNote = require('./GoodsReceiptNote');
const Indent = require('./Indent');

module.exports = {
  sequelize, Medicine, Batch, Prescription, Dispense, Supplier, PurchaseOrder, GoodsReceiptNote, Indent
};
