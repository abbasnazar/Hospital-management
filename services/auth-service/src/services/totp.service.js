'use strict';

const speakeasy = require('speakeasy');

function generateSecret(label) {
  const s = speakeasy.generateSecret({ name: `HMIS (${label})`, length: 20 });
  return { base32: s.base32, otpauthUrl: s.otpauth_url };
}

function verify(secret, token) {
  if (!secret || !token) return false;
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window:   1,
  });
}

module.exports = { generateSecret, verify };
