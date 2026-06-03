'use strict';

const { Router } = require('express');
const logger = require('../utils/logger');
const { User, Organization, PermGroup, PermRole } = require('../models');

const router = Router();
const allowedCategories = ['Hospital', 'Medical Store', 'Laboratory', 'Clinic'];

function isAllowedCategory(category) {
  return allowedCategories.includes(category);
}

// GET /superadmin/categories - List all categories
router.get('/categories', async (req, res, next) => {
  try {
    const orgs = await Organization.findAll({ order: [['createdAt', 'DESC']] });
    res.json(orgs);
  } catch (err) {
    logger.error('list categories', { err: err.message });
    next(err);
  }
});

// POST /superadmin/categories - Create category
router.post('/categories', async (req, res, next) => {
  try {
    const { name, category } = req.body;
    if (!name || !category) return res.status(400).json({ type: 'about:blank', title: 'BAD_REQUEST', status: 400, detail: 'name and category required' });
    if (!isAllowedCategory(category)) return res.status(403).json({ type: 'about:blank', title: 'FORBIDDEN', status: 403, detail: `category must be one of: ${allowedCategories.join(', ')}` });

    const org = await Organization.create({ name, category, createdBy: req.user.id });
    res.status(201).json(org);
  } catch (err) {
    logger.error('create category', { err: err.message, user: req.user.username });
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ type: 'about:blank', title: 'CONFLICT', status: 409, detail: 'category name already exists' });
    }
    next(err);
  }
});

// PATCH /superadmin/categories/:id - Edit category
router.patch('/categories/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, category } = req.body;

    const org = await Organization.findByPk(id);
    if (!org) return res.status(404).json({ type: 'about:blank', title: 'NOT_FOUND', status: 404, detail: 'category not found' });
    if (category && !isAllowedCategory(category)) return res.status(403).json({ type: 'about:blank', title: 'FORBIDDEN', status: 403, detail: `category must be one of: ${allowedCategories.join(', ')}` });

    if (name) org.name = name;
    if (category) org.category = category;
    await org.save();

    res.json(org);
  } catch (err) {
    logger.error('edit category', { err: err.message, user: req.user.username });
    next(err);
  }
});

// DELETE /superadmin/categories/:id - Delete category
router.delete('/categories/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const org = await Organization.findByPk(id);
    if (!org) return res.status(404).json({ type: 'about:blank', title: 'NOT_FOUND', status: 404, detail: 'category not found' });

    await org.destroy();
    res.status(204).send();
  } catch (err) {
    logger.error('delete category', { err: err.message, user: req.user.username });
    next(err);
  }
});

// GET /superadmin/admins - List all admin accounts
router.get('/admins', async (req, res, next) => {
  try {
    const admins = await User.findAll({
      where: { /* admins are users with ADMIN or SUPERADMIN system role and org_id is set */ },
      include: [
        { association: 'roles', attributes: ['code'] },
        { association: 'organization', attributes: ['id', 'name', 'category'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    // Filter to only return actual admins (those with ADMIN system role and an org)
    const filtered = admins.filter(u => u.roles.some(r => r.code === 'ADMIN') && u.orgId);
    res.json(filtered);
  } catch (err) {
    logger.error('list admins', { err: err.message });
    next(err);
  }
});

// POST /superadmin/admins - Create admin account
router.post('/admins', async (req, res, next) => {
  try {
    const { username, email, password, orgId } = req.body;
    if (!username || !email || !password || !orgId) {
      return res.status(400).json({ type: 'about:blank', title: 'BAD_REQUEST', status: 400, detail: 'username, email, password, orgId required' });
    }

    // Check org exists
    const org = await Organization.findByPk(orgId);
    if (!org) return res.status(404).json({ type: 'about:blank', title: 'NOT_FOUND', status: 404, detail: 'organization not found' });
    if (!isAllowedCategory(org.category)) return res.status(403).json({ type: 'about:blank', title: 'FORBIDDEN', status: 403, detail: `organization category must be one of: ${allowedCategories.join(', ')}` });

    // Create user with ADMIN role (system role)
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({ username, email, passwordHash: hash, orgId, status: 'ACTIVE' });

    // Assign ADMIN system role
    const { Role } = require('../models');
    const adminRole = await Role.findOne({ where: { code: 'ADMIN' } });
    if (adminRole) await user.addRole(adminRole);

    res.status(201).json({ id: user.id, username: user.username, email: user.email, orgId: user.orgId });
  } catch (err) {
    logger.error('create admin', { err: err.message, user: req.user.username });
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ type: 'about:blank', title: 'CONFLICT', status: 409, detail: 'username or email already exists' });
    }
    next(err);
  }
});

// PATCH /superadmin/admins/:id - Edit admin (change org, archive/unarchive)
router.patch('/admins/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { orgId, status } = req.body;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ type: 'about:blank', title: 'NOT_FOUND', status: 404, detail: 'user not found' });

    if (orgId) {
      const org = await Organization.findByPk(orgId);
      if (!org) return res.status(404).json({ type: 'about:blank', title: 'NOT_FOUND', status: 404, detail: 'organization not found' });
      user.orgId = orgId;
    }
    if (status && ['ACTIVE', 'INACTIVE', 'ARCHIVED'].includes(status)) user.status = status;

    await user.save();
    res.json({ id: user.id, username: user.username, email: user.email, orgId: user.orgId, status: user.status });
  } catch (err) {
    logger.error('edit admin', { err: err.message, user: req.user.username });
    next(err);
  }
});

module.exports = router;
