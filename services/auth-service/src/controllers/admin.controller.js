'use strict';

const { Router } = require('express');
const { Op } = require('sequelize');
const logger = require('../utils/logger');
const { User, Organization, Functionality, PermGroup, PermRole, Role } = require('../models');

const allowedCategories = ['Hospital', 'Medical Store', 'Laboratory', 'Clinic'];
function isAllowedCategory(category) {
  return allowedCategories.includes(category);
}

const router = Router();

// GET /admin/functionalities - List all base functionalities
router.get('/functionalities', async (req, res, next) => {
  try {
    const funcs = await Functionality.findAll({ order: [['module', 'ASC'], ['label', 'ASC']] });
    res.json(funcs);
  } catch (err) {
    logger.error('list functionalities', { err: err.message });
    next(err);
  }
});

// GET /admin/groups - List groups (scoped to admin's org)
router.get('/groups', async (req, res, next) => {
  try {
    const orgId = req.user.orgId;
    if (!orgId) return res.status(403).json({ type: 'about:blank', title: 'FORBIDDEN', status: 403, detail: 'no organization assigned' });

    const groups = await PermGroup.findAll({
      where: { orgId },
      include: [{ association: 'functionalities', attributes: ['id', 'code', 'label'], through: { attributes: [] } }],
      order: [['createdAt', 'DESC']],
    });
    res.json(groups);
  } catch (err) {
    logger.error('list groups', { err: err.message, user: req.user.username });
    next(err);
  }
});

// POST /admin/groups - Create group
router.post('/groups', async (req, res, next) => {
  try {
    const { name, description, functionalityIds } = req.body;
    const orgId = req.user.orgId;

    if (!name) return res.status(400).json({ type: 'about:blank', title: 'BAD_REQUEST', status: 400, detail: 'name required' });
    if (!orgId) return res.status(403).json({ type: 'about:blank', title: 'FORBIDDEN', status: 403, detail: 'no organization assigned' });

    const org = await Organization.findByPk(orgId);
    if (!org || !isAllowedCategory(org.category)) {
      return res.status(403).json({ type: 'about:blank', title: 'FORBIDDEN', status: 403, detail: `organization category must be one of: ${allowedCategories.join(', ')}` });
    }

    const group = await PermGroup.create({ name, description, orgId, createdBy: req.user.id });

    // Add functionalities if provided
    if (Array.isArray(functionalityIds) && functionalityIds.length > 0) {
      await group.addFunctionalities(functionalityIds);
    }

    await group.reload({ include: [{ association: 'functionalities', attributes: ['id', 'code', 'label'], through: { attributes: [] } }] });
    res.status(201).json(group);
  } catch (err) {
    logger.error('create group', { err: err.message, user: req.user.username });
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ type: 'about:blank', title: 'CONFLICT', status: 409, detail: 'group name already exists in this org' });
    }
    next(err);
  }
});

// PATCH /admin/groups/:id - Edit group
router.patch('/groups/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, functionalityIds } = req.body;
    const orgId = req.user.orgId;

    const group = await PermGroup.findByPk(id);
    if (!group || group.orgId !== orgId) {
      return res.status(404).json({ type: 'about:blank', title: 'NOT_FOUND', status: 404, detail: 'group not found' });
    }

    if (name) group.name = name;
    if (description !== undefined) group.description = description;
    await group.save();

    // Update functionalities if provided
    if (Array.isArray(functionalityIds)) {
      await group.setFunctionalities(functionalityIds);
    }

    await group.reload({ include: [{ association: 'functionalities', attributes: ['id', 'code', 'label'], through: { attributes: [] } }] });
    res.json(group);
  } catch (err) {
    logger.error('edit group', { err: err.message, user: req.user.username });
    next(err);
  }
});

// DELETE /admin/groups/:id - Delete group
router.delete('/groups/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const orgId = req.user.orgId;

    const group = await PermGroup.findByPk(id);
    if (!group || group.orgId !== orgId) {
      return res.status(404).json({ type: 'about:blank', title: 'NOT_FOUND', status: 404, detail: 'group not found' });
    }

    await group.destroy();
    res.status(204).send();
  } catch (err) {
    logger.error('delete group', { err: err.message, user: req.user.username });
    next(err);
  }
});

// GET /admin/roles - List roles (scoped to org)
router.get('/roles', async (req, res, next) => {
  try {
    const orgId = req.user.orgId;
    if (!orgId) return res.status(403).json({ type: 'about:blank', title: 'FORBIDDEN', status: 403, detail: 'no organization assigned' });

    const roles = await PermRole.findAll({
      where: { orgId },
      include: [
        { association: 'groups', attributes: ['id', 'name'], through: { attributes: [] } },
        { association: 'users', attributes: ['id', 'username', 'email'], through: { attributes: [] } },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(roles);
  } catch (err) {
    logger.error('list roles', { err: err.message, user: req.user.username });
    next(err);
  }
});

// POST /admin/roles - Create role
router.post('/roles', async (req, res, next) => {
  try {
    const { code, name, description, groupIds } = req.body;
    const orgId = req.user.orgId;

    if (!code || !name) return res.status(400).json({ type: 'about:blank', title: 'BAD_REQUEST', status: 400, detail: 'code and name required' });
    if (!orgId) return res.status(403).json({ type: 'about:blank', title: 'FORBIDDEN', status: 403, detail: 'no organization assigned' });

    const org = await Organization.findByPk(orgId);
    if (!org || !isAllowedCategory(org.category)) {
      return res.status(403).json({ type: 'about:blank', title: 'FORBIDDEN', status: 403, detail: `organization category must be one of: ${allowedCategories.join(', ')}` });
    }

    const role = await PermRole.create({ code, name, description, orgId, createdBy: req.user.id });

    // Add groups if provided
    if (Array.isArray(groupIds) && groupIds.length > 0) {
      await role.addGroups(groupIds);
    }

    await role.reload({ include: [{ association: 'groups', attributes: ['id', 'name'], through: { attributes: [] } }] });
    res.status(201).json(role);
  } catch (err) {
    logger.error('create role', { err: err.message, user: req.user.username });
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ type: 'about:blank', title: 'CONFLICT', status: 409, detail: 'role code already exists in this org' });
    }
    next(err);
  }
});

// PATCH /admin/roles/:id - Edit role
router.patch('/roles/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, groupIds } = req.body;
    const orgId = req.user.orgId;

    const role = await PermRole.findByPk(id);
    if (!role || role.orgId !== orgId) {
      return res.status(404).json({ type: 'about:blank', title: 'NOT_FOUND', status: 404, detail: 'role not found' });
    }

    if (name) role.name = name;
    if (description !== undefined) role.description = description;
    await role.save();

    if (Array.isArray(groupIds)) {
      await role.setGroups(groupIds);
    }

    await role.reload({ include: [{ association: 'groups', attributes: ['id', 'name'], through: { attributes: [] } }] });
    res.json(role);
  } catch (err) {
    logger.error('edit role', { err: err.message, user: req.user.username });
    next(err);
  }
});

// DELETE /admin/roles/:id - Delete role
router.delete('/roles/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const orgId = req.user.orgId;

    const role = await PermRole.findByPk(id);
    if (!role || role.orgId !== orgId) {
      return res.status(404).json({ type: 'about:blank', title: 'NOT_FOUND', status: 404, detail: 'role not found' });
    }

    await role.destroy();
    res.status(204).send();
  } catch (err) {
    logger.error('delete role', { err: err.message, user: req.user.username });
    next(err);
  }
});

// GET /admin/users - List users
router.get('/users', async (req, res, next) => {
  try {
    const orgId = req.user.orgId;
    const where = {};
    if (orgId) where.orgId = orgId; // ADMIN sees only own org; SUPERADMIN sees all

    const users = await User.findAll({
      where,
      include: [
        { association: 'roles', attributes: ['code'], through: { attributes: [] } },
        { association: 'permRoles', attributes: ['id', 'code', 'name'], through: { attributes: [] } },
        { association: 'organization', attributes: ['id', 'name', 'category'] },
      ],
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['passwordHash'] },
    });
    res.json(users);
  } catch (err) {
    logger.error('list users', { err: err.message, user: req.user.username });
    next(err);
  }
});

// POST /admin/users - Create user
router.post('/users', async (req, res, next) => {
  try {
    const { username, email, password, permRoleId, orgId } = req.body;
    const adminOrgId = req.user.orgId;

    if (!username || !email || !password || !permRoleId) {
      return res.status(400).json({ type: 'about:blank', title: 'BAD_REQUEST', status: 400, detail: 'username, email, password, permRoleId required' });
    }

    // ADMIN can only create users in their own org
    const targetOrgId = orgId || adminOrgId;
    if (targetOrgId !== adminOrgId && !req.user.roles.some(r => r.code === 'SUPERADMIN')) {
      return res.status(403).json({ type: 'about:blank', title: 'FORBIDDEN', status: 403, detail: 'cannot create users outside your organization' });
    }

    const org = await Organization.findByPk(targetOrgId);
    if (!org || !isAllowedCategory(org.category)) {
      return res.status(403).json({ type: 'about:blank', title: 'FORBIDDEN', status: 403, detail: `organization category must be one of: ${allowedCategories.join(', ')}` });
    }

    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({ username, email, passwordHash: hash, orgId: targetOrgId, status: 'ACTIVE' });

    // Assign permission role
    await user.addPermRoles([permRoleId]);

    await user.reload({
      include: [
        { association: 'permRoles', attributes: ['id', 'code', 'name'], through: { attributes: [] } },
        { association: 'organization', attributes: ['id', 'name'] },
      ],
      attributes: { exclude: ['passwordHash'] },
    });

    res.status(201).json(user);
  } catch (err) {
    logger.error('create user', { err: err.message, user: req.user.username });
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ type: 'about:blank', title: 'CONFLICT', status: 409, detail: 'username or email already exists' });
    }
    next(err);
  }
});

// PATCH /admin/users/:id - Edit user
router.patch('/users/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, permRoleIds } = req.body;
    const orgId = req.user.orgId;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ type: 'about:blank', title: 'NOT_FOUND', status: 404, detail: 'user not found' });

    // ADMIN can only edit users in their org
    if (user.orgId !== orgId && !req.user.roles.some(r => r.code === 'SUPERADMIN')) {
      return res.status(403).json({ type: 'about:blank', title: 'FORBIDDEN', status: 403, detail: 'cannot edit users outside your organization' });
    }

    if (status && ['ACTIVE', 'INACTIVE', 'ARCHIVED'].includes(status)) user.status = status;
    await user.save();

    if (Array.isArray(permRoleIds)) {
      await user.setPermRoles(permRoleIds);
    }

    await user.reload({
      include: [{ association: 'permRoles', attributes: ['id', 'code', 'name'], through: { attributes: [] } }],
      attributes: { exclude: ['passwordHash'] },
    });
    res.json(user);
  } catch (err) {
    logger.error('edit user', { err: err.message, user: req.user.username });
    next(err);
  }
});

module.exports = router;
