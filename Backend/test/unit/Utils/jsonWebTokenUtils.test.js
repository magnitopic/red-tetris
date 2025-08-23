import { jest } from '@jest/globals';

const jwt = { sign: jest.fn(() => 'token') };
process.env.JWT_SECRET_KEY = 'secret';
process.env.ACCESS_TOKEN_EXPIRY = '1h';
process.env.REFRESH_TOKEN_EXPIRY = '2h';
await jest.unstable_mockModule('jsonwebtoken', () => ({ default: jwt }));

const utils = await import('../../../src/Utils/jsonWebTokenUtils.js');

describe('jsonWebTokenUtils', () => {
  it('createAccessToken returns token', () => {
    const token = utils.createAccessToken({ id: 1, username: 'u' });
    expect(token).toBe('token');
  });
  it('createRefreshToken returns token', () => {
    const token = utils.createRefreshToken({ id: 1, username: 'u' });
    expect(token).toBe('token');
  });
});
