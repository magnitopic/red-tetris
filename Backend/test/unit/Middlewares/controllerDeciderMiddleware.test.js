
import { jest } from '@jest/globals';
let controllerDeciderMiddleware, mockAuthController;
beforeAll(async () => {
  mockAuthController = {
    resetPassword: jest.fn((req, res, next) => 'reset'),
    sendResetPasswordLink: jest.fn((req, res, next) => 'sendLink'),
  };
  await jest.unstable_mockModule('../../../src/Controllers/AuthController.js', () => ({
    __esModule: true,
    default: mockAuthController,
  }));
  ({ controllerDeciderMiddleware } = await import('../../../src/Middlewares/controllerDeciderMiddleware.js'));
});

describe('controllerDeciderMiddleware', () => {
  it('should call resetPassword if query exists', () => {
    const req = { query: { foo: 'bar' } };
    const res = {};
    const next = jest.fn();
    const result = controllerDeciderMiddleware()(req, res, next);
    expect(mockAuthController.resetPassword).toHaveBeenCalledWith(req, res, next);
    expect(result).toBe('reset');
  });

  it('should call sendResetPasswordLink if no query', () => {
    const req = { query: {} };
    const res = {};
    const next = jest.fn();
    const result = controllerDeciderMiddleware()(req, res, next);
    expect(mockAuthController.sendResetPasswordLink).toHaveBeenCalledWith(req, res, next);
    expect(result).toBe('sendLink');
  });
});
