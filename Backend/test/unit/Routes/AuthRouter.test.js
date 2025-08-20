import { jest } from '@jest/globals';

// Mock dependencies before import
const mockStatus = jest.fn();
const mockConfirm = jest.fn();
const mockAuthenticate = jest.fn();
const mockLogout = jest.fn();
const mockHandleOAuth = jest.fn();

await jest.unstable_mockModule('../../../src/Controllers/AuthController.js', () => ({
  default: {
    status: mockStatus,
    confirm: mockConfirm,
    authenticate: mockAuthenticate,
    logout: mockLogout,
  },
}));
await jest.unstable_mockModule('../../../src/Controllers/OAuthController.js', () => ({
  default: { handleOAuth: mockHandleOAuth },
}));
await jest.unstable_mockModule('../../../src/Middlewares/controllerDeciderMiddleware.js', () => ({
  controllerDeciderMiddleware: jest.fn(),
}));

const AuthRouterModule = await import('../../../src/Routes/AuthRouter.js');
const AuthRouter = AuthRouterModule.default;

describe('AuthRouter', () => {
  it('should create router with correct routes', () => {
    const router = AuthRouter.createRouter();
    const stack = router.stack.map(l => l.route && l.route.path);
    expect(stack).toContain('/status');
    expect(stack).toContain('/confirm');
    expect(stack).toContain('/authenticate');
    expect(stack).toContain('/logout');
    expect(stack).toContain('/oauth/:provider');
  });
});
