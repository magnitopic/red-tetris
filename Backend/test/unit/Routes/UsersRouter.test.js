import { jest } from '@jest/globals';

const mockGetAllUsers = jest.fn();
const mockGetMe = jest.fn();
const mockGetUserProfile = jest.fn();
const mockUpdateUser = jest.fn();
const mockGetProfilePicture = jest.fn();
const mockChangeProfilePicture = jest.fn();
await jest.unstable_mockModule('../../../src/Controllers/UsersController.js', () => ({
  default: {
    getAllUsers: mockGetAllUsers,
    getMe: mockGetMe,
    getUserProfile: mockGetUserProfile,
    updateUser: mockUpdateUser,
  },
}));
await jest.unstable_mockModule('../../../src/Controllers/ProfilePictureController.js', () => ({
  default: {
    getProfilePicture: mockGetProfilePicture,
    changeProfilePicture: mockChangeProfilePicture,
  },
}));
await jest.unstable_mockModule('../../../src/Middlewares/checkValidUserIdMiddleware.js', () => ({
  checkValidUserIdMiddleware: () => jest.fn(),
}));
await jest.unstable_mockModule('../../../src/Middlewares/imageUploadMiddleware.js', () => ({
  imageUploadMiddleware: () => jest.fn(),
}));
await jest.unstable_mockModule('../../../src/Middlewares/imagesValidationMiddleware.js', () => ({
  imagesValidationMiddleware: () => jest.fn(),
}));
await jest.unstable_mockModule('../../../src/Middlewares/removeImageOnFailureMiddleware.js', () => ({
  removeImageOnFailureMiddleware: jest.fn(),
}));

const UsersRouterModule = await import('../../../src/Routes/UsersRouter.js');
const UsersRouter = UsersRouterModule.default;

describe('UsersRouter', () => {
  it('should create router with correct routes', () => {
    const router = UsersRouter.createRouter();
    const stack = router.stack.map(l => l.route && l.route.path);
    expect(stack).toContain('/');
    expect(stack).toContain('/me');
    expect(stack).toContain('/:username');
    expect(stack).toContain('/:id/profile-picture');
    expect(stack).toContain('/:id');
  });
});
