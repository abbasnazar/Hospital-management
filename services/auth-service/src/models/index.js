'use strict';

const sequelize = require('../db/sequelize');
const User      = require('./User');
const Role      = require('./Role');

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

module.exports = { sequelize, User, Role };
