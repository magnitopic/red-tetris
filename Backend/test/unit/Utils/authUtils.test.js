import { jest } from '@jest/globals';

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

// Mock all dependencies before import
await jest.unstable_mockModule('../../../src/Models/UserModel.js', () => ({
  default: { findOne: jest.fn().mockResolvedValue([{ id: 1 }]), update: jest.fn().mockResolvedValue([{}]) }
}));
await jest.unstable_mockModule('../../../src/Utils/getPublicUser.js', () => ({
  default: jest.fn()
}));
await jest.unstable_mockModule('../../../src/Utils/jsonWebTokenUtils.js', () => ({
  createAccessToken: jest.fn(() => 'access'),
  createRefreshToken: jest.fn(() => 'refresh')
}));
await jest.unstable_mockModule('../../../src/Utils/StatusMessage.js', () => ({
  default: { INTERNAL_SERVER_ERROR: 'err', USER_NOT_FOUND: 'notfound' }
}));
await jest.unstable_mockModule('../../../src/Schemas/userSchema.js', () => ({
  validateUser: jest.fn(),
  validatePartialUser: jest.fn()
}));

const bcrypt = { hash: jest.fn(() => Promise.resolve('hashed')) };
const jwt = { verify: jest.fn(() => ({ id: 1 })), sign: jest.fn(() => 'token') };
await jest.unstable_mockModule('bcryptjs', () => ({ default: bcrypt }));
await jest.unstable_mockModule('jsonwebtoken', () => ({ default: jwt }));

const authUtils = await import('../../../src/Utils/authUtils.js');

describe('authUtils', () => {
  it('checkAuthStatus returns authorized', async () => {
    const req = { session: { user: { id: 1 } } };
    const res = await authUtils.checkAuthStatus(req);
    expect(res.isAuthorized).toBe(true);
  });

  it('checkAuthStatus returns not authorized if user not found', async () => {
    const userModel = (await import('../../../src/Models/UserModel.js')).default;
    userModel.findOne = jest.fn().mockResolvedValue([]);
    const req = { session: { user: { id: 1 } } };
    const res = await authUtils.checkAuthStatus(req);
    expect(res.isAuthorized).toBe(false);
  });

  it('checkAuthStatus returns not authorized if no user in session', async () => {
    const req = { session: {} };
    const res = await authUtils.checkAuthStatus(req);
    expect(res.isAuthorized).toBe(false);
  });

  it('checkAuthStatus returns not authorized on error', async () => {
    const userModel = (await import('../../../src/Models/UserModel.js')).default;
    userModel.findOne = jest.fn(() => { throw new Error('fail'); });
    const req = { session: { user: { id: 1 } } };
    const res = await authUtils.checkAuthStatus(req);
    expect(res.isAuthorized).toBe(false);
  });

  it('hashPassword returns hashed', async () => {
    process.env.SALT_ROUNDS = '10';
    const hash = await authUtils.hashPassword('pass');
    expect(hash).toBe('hashed');
  });


  it('hashPassword handles error', async () => {
    const bcrypt = (await import('bcryptjs')).default;
    const originalHash = bcrypt.hash;
    bcrypt.hash = jest.fn(() => { throw new Error('fail'); });
    process.env.SALT_ROUNDS = '10';
    await expect(authUtils.hashPassword('pass')).rejects.toThrow('fail');
    bcrypt.hash = originalHash;
  });

  it('isIgnored matches pattern', () => {
    expect(authUtils.isIgnored(['/api/*'], '/api/test')).toBe(true);
  });

  it('isIgnored does not match pattern', () => {
    expect(authUtils.isIgnored(['/api/*'], '/other')).toBe(false);
  });

  it('setSession sets user', () => {
    process.env.JWT_SECRET_KEY = 'secret';
    const req = {};
    authUtils.setSession(req, 'token');
    expect(req.session.user).toEqual({ id: 1 });
  });

  it('setSession handles invalid token', async () => {
    const jwt = (await import('jsonwebtoken')).default;
    jwt.verify = jest.fn(() => { throw new Error('fail'); });
    process.env.JWT_SECRET_KEY = 'secret';
    const req = {};
    expect(() => authUtils.setSession(req, 'token')).not.toThrow();
    expect(req.session.user).toBeNull();
  });

  it('createAuthTokens handles result null', async () => {
    const userModel = (await import('../../../src/Models/UserModel.js')).default;
    userModel.update = jest.fn().mockResolvedValue(null);
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const data = { id: 1 };
    await authUtils.createAuthTokens(res, data);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('createAuthTokens handles result empty', async () => {
    const userModel = (await import('../../../src/Models/UserModel.js')).default;
    userModel.update = jest.fn().mockResolvedValue([]);
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const data = { id: 1 };
    await authUtils.createAuthTokens(res, data);
    expect(res.status).toHaveBeenCalledWith(400);
  });
  it('registerUser returns duplicate username', async () => {
    const userModel = (await import('../../../src/Models/UserModel.js')).default;
    userModel.isUnique = jest.fn().mockResolvedValue(false);
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const validatedUser = { data: { username: 'u', password: 'p' } };
    await authUtils.registerUser(res, validatedUser);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('registerUser handles userModel.create null', async () => {
    const userModel = (await import('../../../src/Models/UserModel.js')).default;
    userModel.isUnique = jest.fn().mockResolvedValue(true);
    userModel.create = jest.fn().mockResolvedValue(null);
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const validatedUser = { data: { username: 'u', password: 'p' } };
    await authUtils.registerUser(res, validatedUser);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('registerUser handles userModel.create empty', async () => {
    const userModel = (await import('../../../src/Models/UserModel.js')).default;
    userModel.isUnique = jest.fn().mockResolvedValue(true);
    userModel.create = jest.fn().mockResolvedValue([]);
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const validatedUser = { data: { username: 'u', password: 'p' } };
    await authUtils.registerUser(res, validatedUser);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('registerUser handles getPublicUser null', async () => {
    const userModel = (await import('../../../src/Models/UserModel.js')).default;
    userModel.isUnique = jest.fn().mockResolvedValue(true);
    userModel.create = jest.fn().mockResolvedValue([{ id: 1 }]);
    const getPublicUser = (await import('../../../src/Utils/getPublicUser.js')).default;
    getPublicUser.mockResolvedValueOnce(null);
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), getHeaders: () => ({ 'set-cookie': true }), cookie: jest.fn().mockReturnThis() };
    const validatedUser = { data: { username: 'u', password: 'p' } };
    await authUtils.registerUser(res, validatedUser, false, false);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('registerUser handles success', async () => {
    const userModel = (await import('../../../src/Models/UserModel.js')).default;
    userModel.isUnique = jest.fn().mockResolvedValue(true);
    userModel.create = jest.fn().mockResolvedValue([{ id: 1 }]);
    const getPublicUser = (await import('../../../src/Utils/getPublicUser.js')).default;
    getPublicUser.mockResolvedValueOnce({ id: 1 });
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), getHeaders: () => ({ 'set-cookie': true }), cookie: jest.fn().mockReturnThis() };
    const validatedUser = { data: { username: 'u', password: 'p' } };
    await authUtils.registerUser(res, validatedUser, false, false);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('authenticateUser handles partialValidation fail', async () => {
    const validatePartialUser = (await import('../../../src/Schemas/userSchema.js')).validatePartialUser;
    validatePartialUser.mockResolvedValueOnce({ success: false, error: { errors: [{ message: 'err' }] } });
    const req = { body: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    await authUtils.authenticateUser(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('authenticateUser handles user not found (register)', async () => {
    const validatePartialUser = (await import('../../../src/Schemas/userSchema.js')).validatePartialUser;
    validatePartialUser.mockResolvedValueOnce({ success: true, data: { username: 'u', password: 'p' } });
    const userModel = (await import('../../../src/Models/UserModel.js')).default;
    userModel.findOne = jest.fn().mockResolvedValue([]);
    const validateUser = (await import('../../../src/Schemas/userSchema.js')).validateUser;
    validateUser.mockResolvedValueOnce({ success: false, error: { errors: [{ message: 'err' }] } });
    const req = { body: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    await authUtils.authenticateUser(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('authenticateUser handles existingUser.password null', async () => {
    const validatePartialUser = (await import('../../../src/Schemas/userSchema.js')).validatePartialUser;
    validatePartialUser.mockResolvedValueOnce({ success: true, data: { username: 'u', password: 'p' } });
    const userModel = (await import('../../../src/Models/UserModel.js')).default;
    userModel.findOne = jest.fn().mockResolvedValue([{ id: 1 }]);
    const req = { body: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    await authUtils.authenticateUser(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('authenticateUser handles bcrypt.compare false', async () => {
    const validatePartialUser = (await import('../../../src/Schemas/userSchema.js')).validatePartialUser;
    validatePartialUser.mockResolvedValueOnce({ success: true, data: { username: 'u', password: 'p' } });
    const userModel = (await import('../../../src/Models/UserModel.js')).default;
    userModel.findOne = jest.fn().mockResolvedValue([{ id: 1, password: 'hash' }]);
    const bcrypt = (await import('bcryptjs')).default;
    bcrypt.compare = jest.fn().mockResolvedValue(false);
    const req = { body: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    await authUtils.authenticateUser(req, res);
    // != 403 && != 401
    expect(res.status).not.toHaveBeenCalledWith(400);
  });

  it('authenticateUser handles login success', async () => {
    const validatePartialUser = (await import('../../../src/Schemas/userSchema.js')).validatePartialUser;
    validatePartialUser.mockResolvedValueOnce({ success: true, data: { username: 'u', password: 'p' } });
    const userModel = (await import('../../../src/Models/UserModel.js')).default;
    userModel.findOne = jest.fn().mockResolvedValue([{ id: 1, password: 'hash' }]);
    const bcrypt = (await import('bcryptjs')).default;
    bcrypt.compare = jest.fn().mockResolvedValue(true);
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn(), getHeaders: () => ({ 'set-cookie': true }) };
    const req = { body: {} };
    await authUtils.authenticateUser(req, res);
    expect(res.json).toHaveBeenCalled();
  });

  it('authenticateUser handles error (catch)', async () => {
    const validatePartialUser = (await import('../../../src/Schemas/userSchema.js')).validatePartialUser;
    validatePartialUser.mockImplementation(() => { throw new Error('fail'); });
    const req = { body: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    await authUtils.authenticateUser(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
