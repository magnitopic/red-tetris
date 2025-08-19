import { jest } from '@jest/globals';
import StatusMessage from '../../../src/Utils/StatusMessage.js';
let refreshTokenMiddleware, authUtils, jwt, userModel, createAccessToken;
beforeAll(async () => {
  await jest.unstable_mockModule('pg', () => {
    const mockClient = function () { return { connect: jest.fn(), end: jest.fn(), query: jest.fn() }; };
    const mockPool = function () { return { connect: jest.fn(), end: jest.fn(), query: jest.fn() }; };
    return {
      Client: mockClient,
      Pool: mockPool,
      default: { Client: mockClient, Pool: mockPool }
    };
  });
  await jest.unstable_mockModule('../../../src/Utils/authUtils.js', () => ({
    checkAuthStatus: jest.fn(),
    isIgnored: jest.fn(),
    setSession: jest.fn(),
  }));
  await jest.unstable_mockModule('jsonwebtoken', () => ({
    verify: jest.fn(),
    default: { verify: jest.fn() }
  }));
  await jest.unstable_mockModule('../../../src/Models/UserModel.js', () => ({
    default: { getById: jest.fn() }
  }));
  await jest.unstable_mockModule('../../../src/Utils/jsonWebTokenUtils.js', () => ({
    createAccessToken: jest.fn(),
    default: { createAccessToken: jest.fn() }
  }));
  authUtils = await import('../../../src/Utils/authUtils.js');
  jwt = await import('jsonwebtoken');
  userModel = (await import('../../../src/Models/UserModel.js')).default;
  createAccessToken = (await import('../../../src/Utils/jsonWebTokenUtils.js')).createAccessToken;
  ({ refreshTokenMiddleware } = await import('../../../src/Middlewares/refreshTokenMiddleware.js'));
});

describe('refreshTokenMiddleware', () => {
  beforeAll(() => {
    jest.spyOn(console, 'info').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should call next if already authorized', async () => {
    authUtils.checkAuthStatus.mockResolvedValue({ isAuthorized: true });
    const req = { path: '/foo', cookies: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), clearCookie: jest.fn().mockReturnThis() };
    const next = jest.fn();
    await refreshTokenMiddleware([])(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('should call next if route is ignored', async () => {
    authUtils.checkAuthStatus.mockResolvedValue({ isAuthorized: false });
    authUtils.isIgnored.mockReturnValue(true);
    const req = { path: '/ignored', cookies: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), clearCookie: jest.fn().mockReturnThis() };
    const next = jest.fn();
    await refreshTokenMiddleware(['/ignored'])(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('should call next if no refresh token', async () => {
    authUtils.checkAuthStatus.mockResolvedValue({ isAuthorized: false });
    authUtils.isIgnored.mockReturnValue(false);
    const req = { path: '/foo', cookies: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), clearCookie: jest.fn().mockReturnThis() };
    const next = jest.fn();
    await refreshTokenMiddleware([])(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('should return 500 if user is null', async () => {
    authUtils.checkAuthStatus.mockResolvedValue({ isAuthorized: false });
    authUtils.isIgnored.mockReturnValue(false);
    const req = { path: '/foo', cookies: { refresh_token: 'validtoken' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), clearCookie: jest.fn().mockReturnThis(), cookie: jest.fn() };
    const next = jest.fn();
    jwt.verify.mockReturnValue({ id: 1 });
    userModel.getById.mockResolvedValue(null);
    await refreshTokenMiddleware([])(req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ msg: StatusMessage.INTERNAL_SERVER_ERROR });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 400 if user is empty array', async () => {
    authUtils.checkAuthStatus.mockResolvedValue({ isAuthorized: false });
    authUtils.isIgnored.mockReturnValue(false);
    const req = { path: '/foo', cookies: { refresh_token: 'validtoken' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), clearCookie: jest.fn().mockReturnThis(), cookie: jest.fn() };
    const next = jest.fn();
    jwt.verify.mockReturnValue({ id: 1 });
    userModel.getById.mockResolvedValue([]);
    await refreshTokenMiddleware([])(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ msg: StatusMessage.BAD_REQUEST });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if refresh_token does not match', async () => {
    authUtils.checkAuthStatus.mockResolvedValue({ isAuthorized: false });
    authUtils.isIgnored.mockReturnValue(false);
    const req = { path: '/foo', cookies: { refresh_token: 'token1' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), clearCookie: jest.fn().mockReturnThis(), cookie: jest.fn() };
    const next = jest.fn();
    jwt.verify.mockReturnValue({ id: 1 });
    userModel.getById.mockResolvedValue({ refresh_token: 'token2' });
    await refreshTokenMiddleware([])(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.clearCookie).toHaveBeenCalledWith('access_token');
    expect(res.clearCookie).toHaveBeenCalledWith('refresh_token');
    expect(res.json).toHaveBeenCalledWith({ msg: StatusMessage.REFRESH_TOKEN_REVOKED });
    expect(next).not.toHaveBeenCalled();
  });
});
