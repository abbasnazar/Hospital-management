'use strict';

process.env.JWT_SECRET = 'test-secret-must-be-long-enough-to-satisfy-jsonwebtoken-1234567890';

const jwtSvc = require('../src/services/jwt.service');

describe('jwt service', () => {
  test('round-trips access token claims', () => {
    const fakeUser = { id: 42, username: 'alice', email: 'a@b' };
    const roles    = [{ code: 'DOCTOR' }];
    const token    = jwtSvc.signAccessToken(fakeUser, roles);
    const claims   = jwtSvc.verify(token);
    expect(claims.uid).toBe(42);
    expect(claims.sub).toBe('alice');
    expect(claims.roles).toEqual(['DOCTOR']);
    expect(claims.type).toBe('access');
  });
});
