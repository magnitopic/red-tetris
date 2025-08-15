import { jest } from '@jest/globals';

jest.spyOn(console, 'error').mockImplementation(() => {});

// --- MOCKS ---
await jest.unstable_mockModule('pg', () => ({
  Client: jest.fn(() => ({
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn(),
  })),
}));

const mockUserModel = {
  findOne: jest.fn(),
  update: jest.fn(),
};

await jest.unstable_mockModule('../../../src/Models/UserModel.js', () => ({
  default: mockUserModel,
}));

const mockAuthUtils = {
  authenticateUser: jest.fn(),
  checkAuthStatus: jest.fn().mockResolvedValue({ isAuthorized: false }),
  createAuthTokens: jest.fn(),
};
await jest.unstable_mockModule('../../../src/Utils/authUtils.js', () => mockAuthUtils);

const mockConfirmAccountValidations = jest.fn().mockResolvedValue(true);
await jest.unstable_mockModule('../../../src/Validations/authValidations.js', () => ({
  validateAuth: jest.fn((req, res, next) => next()),
  validateConfirmation: jest.fn((req, res, next) => next()),
  confirmAccountValidations: mockConfirmAccountValidations,
  loginValidations: jest.fn(),
}));

const mockJwt = {
  verify: jest.fn(),
  decode: jest.fn(),
};
await jest.unstable_mockModule('jsonwebtoken', () => mockJwt);

// --- IMPORTS AFTER MOCKS ---
const AuthControllerModule = await import('../../../src/Controllers/AuthController.js');
const AuthController = AuthControllerModule.AuthController || AuthControllerModule.default || AuthControllerModule;

const StatusMessageModule = await import('../../../src/Utils/StatusMessage.js');
const StatusMessage = StatusMessageModule.StatusMessage || StatusMessageModule.default || StatusMessageModule;

const userModel = mockUserModel;
const authUtils = mockAuthUtils;
const jwt = mockJwt;

// --- TESTS ---
describe('AuthController', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, query: {}, cookies: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis(),
      getHeaders: jest.fn(() => ({ 'set-cookie': true })),
    };
    jest.clearAllMocks();
    authUtils.checkAuthStatus.mockResolvedValue({ isAuthorized: false });
    mockConfirmAccountValidations.mockResolvedValue(true);
  });

  describe('authenticate', () => {
    it('should return 400 if already logged in', async () => {
      authUtils.checkAuthStatus.mockResolvedValue({ isAuthorized: true });
      await AuthController.authenticate(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: StatusMessage.ALREADY_LOGGED_IN });
    });

    it('should call authenticateUser if not logged in', async () => {
      await AuthController.authenticate(req, res);
      expect(authUtils.authenticateUser).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should clear cookies and return success', async () => {
      await AuthController.logout(req, res);
      expect(res.clearCookie).toHaveBeenCalledWith('access_token');
      expect(res.clearCookie).toHaveBeenCalledWith('refresh_token');
      expect(res.json).toHaveBeenCalledWith({ msg: StatusMessage.LOGOUT_SUCCESS });
    });
  });

  describe('confirm', () => {
    it('should return 400 if already logged in', async () => {
      authUtils.checkAuthStatus.mockResolvedValue({ isAuthorized: true });
      await AuthController.confirm(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: StatusMessage.ALREADY_LOGGED_IN });
    });

    it('should confirm account successfully', async () => {
      req.query.token = 'validToken';
      jwt.verify.mockReturnValue({ id: 1 });
      userModel.findOne.mockResolvedValue({ id: 1 });
      userModel.update.mockResolvedValue([{}]);

      await AuthController.confirm(req, res);

      expect(userModel.update).toHaveBeenCalledWith({
        input: { active_account: true },
        id: 1,
      });
      expect(res.json).toHaveBeenCalledWith({ msg: StatusMessage.ACC_SUCCESSFULLY_CONFIRMED });
    });

    it('should handle TokenExpiredError', async () => {
      req.query.token = 'expiredToken';
      jwt.verify.mockImplementation(() => { throw { name: 'TokenExpiredError' }; });
      jwt.decode.mockReturnValue({ id: 1 });
      userModel.findOne.mockResolvedValue({ id: 1 });

      await AuthController.confirm(req, res);

      expect(userModel.findOne).toHaveBeenCalledWith({ id: 1 });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: StatusMessage.BAD_REQUEST });
    });
  });
});
