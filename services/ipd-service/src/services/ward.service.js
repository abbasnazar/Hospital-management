'use strict';

const { Ward, Bed } = require('../models');
const { NotFound } = require('../utils/errors');

// Compute live occupancy for a set of wards from their beds.
async function occupancyFor(wards) {
  const wardIds = wards.map((w) => w.id);
  const beds = wardIds.length
    ? await Bed.findAll({ where: { wardId: wardIds } })
    : [];
  return wards.map((w) => {
    const wardBeds  = beds.filter((b) => String(b.wardId) === String(w.id));
    const occupied  = wardBeds.filter((b) => b.status === 'OCCUPIED').length;
    const available = wardBeds.filter((b) => b.status === 'AVAILABLE').length;
    const total     = wardBeds.length || w.totalBeds;
    return {
      id: w.id, name: w.name, category: w.category, floor: w.floor,
      totalBeds: total, occupied, available,
      occupancyRate: total ? Math.round((occupied / total) * 100) : 0,
    };
  });
}

async function list() {
  const wards = await Ward.findAll({ where: { active: true }, order: [['id', 'ASC']] });
  return { wards: await occupancyFor(wards) };
}

async function census(wardId) {
  const ward = await Ward.findByPk(wardId);
  if (!ward) throw NotFound(`ward ${wardId} not found`);
  const [row] = await occupancyFor([ward]);
  return { ...row, timestamp: new Date() };
}

module.exports = { list, census, occupancyFor };
