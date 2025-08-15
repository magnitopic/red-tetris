import { jest } from '@jest/globals';

// --- MOCKS ---
const mockUserModel = {
  getAll: jest.fn(),
  getById: jest.fn(),
  getByReference: jest.fn(),
  update: jest.fn(),
  isUnique: jest.fn(),
};
await jest.unstable_mockModule('../../../src/Models/UserModel.js', () => ({
  default: mockUserModel,
}));

const mockGetPublicUser = jest.fn();
await jest.unstable_mockModule('../../../src/Utils/getPublicUser.js', () => ({
  default: mockGetPublicUser,
}));

const mockGetSimpleUser = jest.fn();
await jest.unstable_mockModule('../../../src/Utils/getSimpleUser.js', () => ({
  default: mockGetSimpleUser,
}));

const mockValidatePartialUser = jest.fn();
await jest.unstable_mockModule('../../../src/Schemas/userSchema.js', () => ({
  validatePartialUser: mockValidatePartialUser,
}));

const mockReturnErrorStatus = jest.fn();
await jest.unstable_mockModule('../../../src/Utils/errorUtils.js', () => ({
  returnErrorStatus: mockReturnErrorStatus,
}));

const mockHashPassword = jest.fn();
await jest.unstable_mockModule('../../../src/Utils/authUtils.js', () => ({
  hashPassword: mockHashPassword,
}));

const StatusMessage = {
  INTERNAL_SERVER_ERROR: 'Internal error',
  QUERY_ERROR: 'Query error',
  USER_NOT_FOUND: 'User not found',
  NOT_FOUND_BY_ID: 'Not found by id',
  NO_PROFILE_INFO_TO_EDIT: 'No profile info',
  CANNOT_CHANGE_EMAIL: 'Cannot change email',
  DUPLICATE_USERNAME: 'Duplicate username',
};
await jest.unstable_mockModule('../../../src/Utils/StatusMessage.js', () => ({
  default: StatusMessage,
  ...StatusMessage,
}));

const UsersControllerModule = await import('../../../src/Controllers/UsersController.js');
const UsersController = UsersControllerModule.default || UsersControllerModule;

// --- TESTS ---
describe('UsersController', () => {
  let req, res;

  beforeEach(() => {
    req = { params: {}, body: {}, session: { user: { id: 1, oauth: false } } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('should return public users', async () => {
      mockUserModel.getAll.mockResolvedValue([{ id: 1 }]);
      mockGetPublicUser.mockResolvedValue({ id: 1, username: 'test' });
      await UsersController.getAllUsers(req, res);
      expect(res.json).toHaveBeenCalledWith({ msg: [{ id: 1, username: 'test' }] });
    });

    it('should return 500 if getAll fails', async () => {
      mockUserModel.getAll.mockResolvedValue(null);
      await UsersController.getAllUsers(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ msg: StatusMessage.QUERY_ERROR });
    });
  });

  describe('getMe', () => {
    it('should return private user', async () => {
      mockUserModel.getById.mockResolvedValue([{ id: 1 }]);
      mockGetPublicUser.mockResolvedValue({ id: 1, username: 'me' });
      await UsersController.getMe(req, res);
      expect(res.json).toHaveBeenCalledWith({ msg: { id: 1, username: 'me' } });
    });

    it('should return 404 if user not found', async () => {
      mockUserModel.getById.mockResolvedValue({ length: 0 });
      await UsersController.getMe(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ msg: StatusMessage.USER_NOT_FOUND });
    });
  });

  describe('getUserById', () => {
    it('should return simple user', async () => {
      req.params.id = 2;
      mockUserModel.getById.mockResolvedValue([{ id: 2 }]);
      mockGetSimpleUser.mockResolvedValue({ id: 2, username: 'other' });
      await UsersController.getUserById(req, res);
      expect(res.json).toHaveBeenCalledWith({ msg: { id: 2, username: 'other' } });
    });

    it('should return 404 if not found', async () => {
      req.params.id = 2;
      mockUserModel.getById.mockResolvedValue({ length: 0 });
      await UsersController.getUserById(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ msg: StatusMessage.NOT_FOUND_BY_ID });
    });
  });

  describe('getUserProfile', () => {
    it('should return public user', async () => {
      req.params.username = 'test';
      mockUserModel.getByReference.mockResolvedValue([{ id: 1 }]);
      mockGetPublicUser.mockResolvedValue({ id: 1, username: 'test' });
      await UsersController.getUserProfile(req, res);
      expect(res.json).toHaveBeenCalledWith({ msg: { id: 1, username: 'test' } });
    });

    it('should return 404 if not found', async () => {
      req.params.username = 'test';
      mockUserModel.getByReference.mockResolvedValue({ length: 0 });
      await UsersController.getUserProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ msg: StatusMessage.USER_NOT_FOUND });
    });

    it('should return 500 if getByReference fails', async () => {
      req.params.username = 'test';
      mockUserModel.getByReference.mockResolvedValue(null);
      await UsersController.getUserProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ msg: StatusMessage.QUERY_ERROR });
    });
  });

  describe('updateUser', () => {
    it('should return 500 if userModel.update returns null', async () => {
      req.params.id = 1;
      req.body = { username: 'newuser' };
      mockValidatePartialUser.mockResolvedValue({ success: true, data: { username: 'newuser' } });
      mockUserModel.isUnique.mockResolvedValue(true);
      mockUserModel.update.mockResolvedValue(null);
      await UsersController.updateUser(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ msg: StatusMessage.QUERY_ERROR });
    });

    it('should return 404 if userModel.update returns empty array', async () => {
      req.params.id = 1;
      req.body = { username: 'newuser' };
      mockValidatePartialUser.mockResolvedValue({ success: true, data: { username: 'newuser' } });
      mockUserModel.isUnique.mockResolvedValue(true);
      mockUserModel.update.mockResolvedValue([]);
      await UsersController.updateUser(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ msg: StatusMessage.USER_NOT_FOUND });
    });
  });
});