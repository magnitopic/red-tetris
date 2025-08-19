
import { jest } from '@jest/globals';
import StatusMessage from '../../../src/Utils/StatusMessage.js';
let checkAuthStatusMiddleware, authUtils;
beforeAll(async () => {
  await jest.unstable_mockModule('../../../src/Utils/authUtils.js', () => ({
    isIgnored: jest.fn(),
    checkAuthStatus: jest.fn(),
  }));
  authUtils = await import('../../../src/Utils/authUtils.js');
  ({ checkAuthStatusMiddleware } = await import('../../../src/Middlewares/checkAuthStatusMiddleware.js'));
});

describe('checkAuthStatusMiddleware', () => {
  it('should call next if route is ignored', async () => {
    authUtils.isIgnored.mockReturnValue(true);
    const req = { path: '/ignored' };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    await checkAuthStatusMiddleware(['/ignored'])(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('should call next if authorized', async () => {
    authUtils.isIgnored.mockReturnValue(false);
    authUtils.checkAuthStatus.mockResolvedValue({ isAuthorized: true });
    const req = { path: '/not-ignored' };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    await checkAuthStatusMiddleware([])(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('should return 401 if not authorized', async () => {
    authUtils.isIgnored.mockReturnValue(false);
    authUtils.checkAuthStatus.mockResolvedValue({ isAuthorized: false });
    const req = { path: '/not-ignored' };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    await checkAuthStatusMiddleware([])(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ msg: StatusMessage.NOT_LOGGED_IN });
  });
});
