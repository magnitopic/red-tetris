import { jest } from '@jest/globals';

let sessionMiddleware, authUtils;

beforeAll(async () => {
  await jest.unstable_mockModule('../../../src/Utils/authUtils.js', () => ({
    setSession: jest.fn(),
  }));
  authUtils = await import('../../../src/Utils/authUtils.js');
  ({ sessionMiddleware } = await import('../../../src/Middlewares/sessionMiddleware.js'));
});

describe('sessionMiddleware', () => {
  it('should call setSession and next', () => {
    const req = { cookies: { access_token: 'token' } };
    const res = {};
    const next = jest.fn();
    sessionMiddleware()(req, res, next);
    expect(authUtils.setSession).toHaveBeenCalledWith(req, 'token');
    expect(next).toHaveBeenCalled();
  });
});
