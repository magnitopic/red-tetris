import { jest } from '@jest/globals';

// --- MOCKS ---
const mockUserModel = {
  getById: jest.fn(),
  update: jest.fn(),
};
await jest.unstable_mockModule('../../../src/Models/UserModel.js', () => ({
  default: mockUserModel,
}));

const mockFsExtra = { remove: jest.fn() };
await jest.unstable_mockModule('fs-extra', () => ({
  default: mockFsExtra,
}));

const StatusMessage = {
  QUERY_ERROR: 'Query error',
  USER_NOT_FOUND: 'User not found',
  IMAGE_NOT_FOUND: 'Image not found',
  INTERNAL_SERVER_ERROR: 'Internal server error',
  BAD_REQUEST: 'Bad request',
  ERROR_UPLOADING_IMAGE: 'Error uploading image',
};
await jest.unstable_mockModule('../../../src/Utils/StatusMessage.js', () => ({
  default: StatusMessage,
  ...StatusMessage,
}));


beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

const ProfilePictureControllerModule = await import('../../../src/Controllers/ProfilePictureController.js');
const ProfilePictureController = ProfilePictureControllerModule.default || ProfilePictureControllerModule;

describe('ProfilePictureController', () => {
  let req, res, next;

  beforeEach(() => {
    req = { params: { id: 1 }, files: [{ path: '/tmp/file.png' }] };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      sendFile: jest.fn((path, cb) => cb && cb()),
      responseData: { body: 'Error' },
      statusCode: 400,
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('getProfilePicture', () => {
    it('should send file if user and picture exist', async () => {
      mockUserModel.getById.mockResolvedValue({ profile_picture: '/img.png' });
      await ProfilePictureController.getProfilePicture(req, res);
      expect(res.sendFile).toHaveBeenCalled();
    });

    it('should return 404 if user not found', async () => {
      mockUserModel.getById.mockResolvedValue({ length: 0 });
      await ProfilePictureController.getProfilePicture(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ msg: StatusMessage.USER_NOT_FOUND });
    });

    it('should return 500 if user is null', async () => {
      mockUserModel.getById.mockResolvedValue(null);
      await ProfilePictureController.getProfilePicture(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ msg: StatusMessage.QUERY_ERROR });
    });

    it('should return 404 if user has no profile_picture', async () => {
      mockUserModel.getById.mockResolvedValue({});
      res.sendFile = jest.fn((path, cb) => cb && cb(new Error('fail')));
      await ProfilePictureController.getProfilePicture(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ msg: StatusMessage.IMAGE_NOT_FOUND });
    });
  });

  describe('changeProfilePicture', () => {
    it('should return BAD_REQUEST if files length is not 1', async () => {
      req.files = [];
      await ProfilePictureController.changeProfilePicture(req, res, next);
      expect(res.status).not.toHaveBeenCalledWith(200);
    });

    it('should call next if error is thrown', async () => {
      req.files = [{ path: '/tmp/file.png' }];
      mockUserModel.update.mockImplementation(() => { throw new Error('fail'); });
      await ProfilePictureController.changeProfilePicture(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should return INTERNAL_SERVER_ERROR if update fails', async () => {
      mockUserModel.update.mockResolvedValueOnce(null);
      await ProfilePictureController.changeProfilePicture(req, res, next);
      expect(res.status).not.toHaveBeenCalledWith(200);
      expect(res.json).not.toHaveBeenCalledWith({
        msg: expect.stringContaining('profile-picture'),
      });
    });

    it('should return USER_NOT_FOUND if update returns empty array', async () => {
      mockUserModel.update.mockResolvedValueOnce([]);
      await ProfilePictureController.changeProfilePicture(req, res, next);
      expect(res.status).not.toHaveBeenCalledWith(200);
      expect(res.json).not.toHaveBeenCalledWith({
        msg: expect.stringContaining('profile-picture'),
      });
    });
  }); 

  describe('deletePreviousProfilePicture', () => {
    it('should return QUERY_ERROR if user is null', async () => {
      mockUserModel.getById.mockResolvedValue(null);
      const result = await ProfilePictureController.deletePreviousProfilePicture(res, 1);
      expect(result).not.toBe(true);
    });

    it('should return USER_NOT_FOUND if user.length === 0', async () => {
      mockUserModel.getById.mockResolvedValue({ length: 0 });
      const result = await ProfilePictureController.deletePreviousProfilePicture(res, 1);
      expect(result).not.toBe(true);
    });

    it('should return true if no profile_picture', async () => {
      mockUserModel.getById.mockResolvedValue({ length: 1 });
      const result = await ProfilePictureController.deletePreviousProfilePicture(res, 1);
      expect(result).toBe(true);
    });

    it('should return true if profile_picture_is_url', async () => {
      mockUserModel.getById.mockResolvedValue({ length: 1, profile_picture: 'url', profile_picture_is_url: true });
      const result = await ProfilePictureController.deletePreviousProfilePicture(res, 1);
      expect(result).toBe(true);
    });

    it('should return true if file is deleted successfully', async () => {
      mockUserModel.getById.mockResolvedValue({ length: 1, profile_picture: '/img.png' });
      mockFsExtra.remove.mockResolvedValue(true);
      const result = await ProfilePictureController.deletePreviousProfilePicture(res, 1);
      expect(result).toBe(true);
    });

    it('should return false if file deletion fails', async () => {
      mockUserModel.getById.mockResolvedValue({ length: 1, profile_picture: '/img.png' });
      mockFsExtra.remove.mockRejectedValue(new Error('fail'));
      const result = await ProfilePictureController.deletePreviousProfilePicture(res, 1);
      expect(result).toBe(false);
    });

    it('should return true if profile_picture is empty string', async () => {
      mockUserModel.getById.mockResolvedValue({ length: 1, profile_picture: '' });
      const result = await ProfilePictureController.deletePreviousProfilePicture(res, 1);
      expect(result).toBe(true);
    });
  });

});