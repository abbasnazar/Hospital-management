'use strict';

const sequelize      = require('../db/sequelize');
const User           = require('./User');
const Role           = require('./Role');
const Organization   = require('./Organization');
const Functionality  = require('./Functionality');
const PermGroup      = require('./PermGroup');
const PermRole       = require('./PermRole');

// System roles
User.belongsToMany(Role, {
  through:    'auth_user_role',
  foreignKey: 'user_id',
  otherKey:   'role_id',
  as:         'roles',
  timestamps: false,
});

Role.belongsToMany(User, {
  through:    'auth_user_role',
  foreignKey: 'role_id',
  otherKey:   'user_id',
  as:         'users',
  timestamps: false,
});

// Organization relationships
User.belongsTo(Organization, {
  foreignKey: 'orgId',
  targetKey:  'id',
  as:         'organization',
});

Organization.hasMany(User, {
  foreignKey: 'orgId',
  sourceKey:  'id',
  as:         'users',
});

Organization.hasMany(PermGroup, {
  foreignKey: 'orgId',
  sourceKey:  'id',
  as:         'groups',
});

Organization.hasMany(PermRole, {
  foreignKey: 'orgId',
  sourceKey:  'id',
  as:         'roles',
});

// Permission groups
PermGroup.belongsTo(Organization, {
  foreignKey: 'orgId',
  targetKey:  'id',
  as:         'organization',
});

PermGroup.belongsTo(User, {
  foreignKey: 'createdBy',
  targetKey:  'id',
  as:         'creator',
});

PermGroup.belongsToMany(Functionality, {
  through:    'perm_group_functionality',
  foreignKey: 'group_id',
  otherKey:   'functionality_id',
  as:         'functionalities',
  timestamps: false,
});

// Functionalities
Functionality.belongsToMany(PermGroup, {
  through:    'perm_group_functionality',
  foreignKey: 'functionality_id',
  otherKey:   'group_id',
  as:         'groups',
  timestamps: false,
});

// Permission roles
PermRole.belongsTo(Organization, {
  foreignKey: 'orgId',
  targetKey:  'id',
  as:         'organization',
});

PermRole.belongsTo(User, {
  foreignKey: 'createdBy',
  targetKey:  'id',
  as:         'creator',
});

PermRole.belongsToMany(PermGroup, {
  through:    'perm_role_group',
  foreignKey: 'role_id',
  otherKey:   'group_id',
  as:         'groups',
  timestamps: false,
});

PermGroup.belongsToMany(PermRole, {
  through:    'perm_role_group',
  foreignKey: 'group_id',
  otherKey:   'role_id',
  as:         'roles',
  timestamps: false,
});

// User-to-Permission-Role
User.belongsToMany(PermRole, {
  through:    'auth_user_perm_role',
  foreignKey: 'user_id',
  otherKey:   'role_id',
  as:         'permRoles',
  timestamps: false,
});

PermRole.belongsToMany(User, {
  through:    'auth_user_perm_role',
  foreignKey: 'role_id',
  otherKey:   'user_id',
  as:         'users',
  timestamps: false,
});

module.exports = { sequelize, User, Role, Organization, Functionality, PermGroup, PermRole };
