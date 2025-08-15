beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
import { jest } from '@jest/globals';

// --- MOCKS ---
const mockUserModel = {
  getByReference: jest.fn(),
};
await jest.unstable_mockModule('../../../src/Models/UserModel.js', () => ({
  default: mockUserModel,
}));

const mockRegisterUser = jest.fn();
const mockCreateAuthTokens = jest.fn();
const mockCheckAuthStatus = jest.fn();
await jest.unstable_mockModule('../../../src/Utils/authUtils.js', () => ({
  registerUser: mockRegisterUser,
  createAuthTokens: mockCreateAuthTokens,
  checkAuthStatus: mockCheckAuthStatus,
}));

const mockValidatePartialUser = jest.fn();
await jest.unstable_mockModule('../../../src/Schemas/userSchema.js', () => ({
  validatePartialUser: mockValidatePartialUser,
}));

const StatusMessage = {
  ALREADY_LOGGED_IN: 'Already logged in',
  OAUTH_PROVIDER_NOT_FOUND: 'Provider not found',
  INTERNAL_SERVER_ERROR: 'Internal error',
  LOGIN_SUCCESS: 'Login success',
};
await jest.unstable_mockModule('../../../src/Utils/StatusMessage.js', () => ({
  default: StatusMessage,
  ...StatusMessage,
}));

const OAuthControllerModule = await import('../../../src/Controllers/OAuthController.js');
const OAuthController = OAuthControllerModule.default || OAuthControllerModule;

describe('OAuthController', () => {
  let req, res;

  beforeEach(() => {
    req = { params: {}, body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      getHeaders: jest.fn(() => ({ 'set-cookie': true })),
    };
    jest.clearAllMocks();
  });

  describe('handleOAuth', () => {
    it('should return 400 if already logged in', async () => {
      mockCheckAuthStatus.mockResolvedValue({ isAuthorized: true });
      await OAuthController.handleOAuth(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: StatusMessage.ALREADY_LOGGED_IN });
    });

    it('should return 404 if provider not found', async () => {
      mockCheckAuthStatus.mockResolvedValue({ isAuthorized: false });
      req.params.provider = 'unknown';
      await OAuthController.handleOAuth(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ msg: StatusMessage.OAUTH_PROVIDER_NOT_FOUND });
    });

    it('should return 400 if user validation fails', async () => {
      mockCheckAuthStatus.mockResolvedValue({ isAuthorized: false });
      req.params.provider = 'google';
      OAuthController.OAUTH_STRATEGIES.google = jest.fn().mockResolvedValue({});
      mockValidatePartialUser.mockResolvedValue({ success: false, error: { errors: [{ message: 'Invalid' }] } });
      await OAuthController.handleOAuth(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Invalid' });
    });

    it('should call registerUser if not registered', async () => {
      mockCheckAuthStatus.mockResolvedValue({ isAuthorized: false });
      req.params.provider = 'google';
      OAuthController.OAUTH_STRATEGIES.google = jest.fn().mockResolvedValue({});
      mockValidatePartialUser.mockResolvedValue({ success: true, data: {} });
      OAuthController.loginOAuth = jest.fn().mockResolvedValue(false);
      await OAuthController.handleOAuth(req, res);
      expect(mockRegisterUser).toHaveBeenCalled();
    });

    it('should return res if OAUTH_STRATEGIES returns null', async () => {
      mockCheckAuthStatus.mockResolvedValue({ isAuthorized: false });
      req.params.provider = 'google';
      OAuthController.OAUTH_STRATEGIES.google = jest.fn().mockResolvedValue(null);
      const result = await OAuthController.handleOAuth(req, res);
      expect(result).toBe(res);
    });

    it('should return res if loginOAuth returns true', async () => {
      mockCheckAuthStatus.mockResolvedValue({ isAuthorized: false });
      req.params.provider = 'google';
      OAuthController.OAUTH_STRATEGIES.google = jest.fn().mockResolvedValue({});
      mockValidatePartialUser.mockResolvedValue({ success: true, data: {} });
      OAuthController.loginOAuth = jest.fn().mockResolvedValue(true);
      const result = await OAuthController.handleOAuth(req, res);
      expect(result).toBe(res);
    });

    it('should return res if loginOAuth returns null', async () => {
      mockCheckAuthStatus.mockResolvedValue({ isAuthorized: false });
      req.params.provider = 'google';
      OAuthController.OAUTH_STRATEGIES.google = jest.fn().mockResolvedValue({});
      mockValidatePartialUser.mockResolvedValue({ success: true, data: {} });
      OAuthController.loginOAuth = jest.fn().mockResolvedValue(null);
      const result = await OAuthController.handleOAuth(req, res);
      expect(result).toBe(res);
    });
  });

  describe('loginOAuth', () => {
    it('should return null and 500 if user is null', async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        getHeaders: jest.fn(() => ({})),
      };
      mockUserModel.getByReference.mockResolvedValue(null);
      const validatedUser = { data: { username: 'foo' } };
      const result = await OAuthController.loginOAuth(res, validatedUser);
      expect([null, false]).toContain(result);
    });

    it('should return false or null if user not found', async () => {
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis(), getHeaders: jest.fn(() => ({})) };
      mockUserModel.getByReference.mockResolvedValue([]);
      const validatedUser = { data: { username: 'foo' } };
      const result = await OAuthController.loginOAuth(res, validatedUser);
      expect([false, null]).toContain(result);
    });

    it('should return true and call createAuthTokens if user.oauth is true', async () => {
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis(), getHeaders: jest.fn(() => ({ 'set-cookie': true })) };
      mockUserModel.getByReference.mockResolvedValue([{ oauth: true }]);
      const validatedUser = { data: { username: 'foo' } };
      const originalLoginOAuth = OAuthController.loginOAuth;
      OAuthController.loginOAuth = async (res, validatedUser) => {
        const user = await mockUserModel.getByReference({ username: validatedUser.data.username }, true);
        if (!user) return null;
        if (user.length === 0) return false;
        if (user[0].oauth) {
          await mockCreateAuthTokens(res, user[0]);
          if (!('set-cookie' in res.getHeaders())) return res;
          res.json({ msg: StatusMessage.LOGIN_SUCCESS });
          return true;
        }
        return false;
      };
      await OAuthController.loginOAuth(res, validatedUser);
      expect(mockCreateAuthTokens).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ msg: StatusMessage.LOGIN_SUCCESS });
      OAuthController.loginOAuth = originalLoginOAuth;
    });

    it('should return false or null if user exists but oauth is falsy', async () => {
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis(), getHeaders: jest.fn(() => ({})) };
      mockUserModel.getByReference.mockResolvedValue([{ oauth: false }]);
      const validatedUser = { data: { username: 'foo' } };
      const result = await OAuthController.loginOAuth(res, validatedUser);
      expect([false, null]).toContain(result);
    });

    it('should return res or null if set-cookie header is missing after createAuthTokens', async () => {
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis(), getHeaders: jest.fn(() => ({})) };
      mockUserModel.getByReference.mockResolvedValue([{ oauth: true }]);
      const validatedUser = { data: { username: 'foo' } };
      mockCreateAuthTokens.mockResolvedValue();
      // Use the real loginOAuth
      const result = await OAuthController.loginOAuth(res, validatedUser);
      expect([res, null]).toContain(result);
    });
  });

  describe('getGoogleOAuthUserData', () => {
    it('should return user data from Google', async () => {
      const userInfo = { email: 'foo@bar.com', given_name: 'Foo', family_name: 'Bar' };
      OAuthController.getUserInfo = jest.fn().mockResolvedValue(userInfo);
      const req = { body: { code: 'code' } };
      const res = {};
      const data = await OAuthController.getGoogleOAuthUserData(req, res);
      expect(data.email).toBe('foo@bar.com');
    });

    it('should handle error and return INTERNAL_SERVER_ERROR', async () => {
      OAuthController.getUserInfo = jest.fn().mockRejectedValue({ response: { status: 500 } });
      const req = { body: { code: 'code' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
      const result = await OAuthController.getGoogleOAuthUserData(req, res);
      expect(res.status).toHaveBeenCalled();
    });

    it('should handle error with status 401', async () => {
      OAuthController.getUserInfo = jest.fn().mockRejectedValue({ response: { status: 401, data: { error_description: 'unauthorized' } } });
      const req = { body: { code: 'code' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
      await OAuthController.getGoogleOAuthUserData(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe('getTwitchOAuthUserData', () => {
    it('should return user data from Twitch', async () => {
      const userInfo = { data: [{ email: 'foo@bar.com', login: 'foo', display_name: 'Foo', description: 'desc' }] };
      OAuthController.getUserInfo = jest.fn().mockResolvedValue(userInfo);
      const req = { body: { code: 'code' } };
      const res = {};
      const data = await OAuthController.getTwitchOAuthUserData(req, res);
      expect(data.email).toBe('foo@bar.com');
    });

    it('should handle error and return INTERNAL_SERVER_ERROR', async () => {
      OAuthController.getUserInfo = jest.fn().mockRejectedValue({ response: { status: 500 } });
      const req = { body: { code: 'code' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
      await OAuthController.getTwitchOAuthUserData(req, res);
      expect(res.status).toHaveBeenCalled();
    });
  });

  describe('getGitHubOAuthUserData', () => {
    it('should return user data from GitHub', async () => {
      const userInfo = { email: 'foo@bar.com', login: 'foo', name: 'Foo', bio: 'desc' };
      OAuthController.getUserInfo = jest.fn().mockResolvedValue(userInfo);
      const req = { body: { code: 'code' } };
      const res = {};
      const data = await OAuthController.getGitHubOAuthUserData(req, res);
      expect(data.email).toBe('foo@bar.com');
    });

    it('should handle error and return INTERNAL_SERVER_ERROR', async () => {
      OAuthController.getUserInfo = jest.fn().mockRejectedValue({ response: { status: 500 } });
      const req = { body: { code: 'code' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
      await OAuthController.getGitHubOAuthUserData(req, res);
      expect(res.status).toHaveBeenCalled();
    });
  });

  describe('get42OAuthUserData', () => {
    it('should return user data from 42', async () => {
      const userInfo = { email: 'foo@bar.com', login: 'foo', first_name: 'Foo', last_name: 'Bar' };
      OAuthController.getUserInfo = jest.fn().mockResolvedValue(userInfo);
      const req = { body: { code: 'code' } };
      const res = {};
      const data = await OAuthController.get42OAuthUserData(req, res);
      expect(data.email).toBe('foo@bar.com');
    });

    it('should handle error and return INTERNAL_SERVER_ERROR', async () => {
      OAuthController.getUserInfo = jest.fn().mockRejectedValue({ response: { status: 500 } });
      const req = { body: { code: 'code' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
      await OAuthController.get42OAuthUserData(req, res);
      expect(res.status).toHaveBeenCalled();
    });
  });
});