import { jest } from '@jest/globals';

// --- MOCKS ---
const mockExpress = jest.fn(() => ({
  disable: jest.fn(),
  use: jest.fn(),
}));
mockExpress.urlencoded = jest.fn(() => 'urlencoded-mock');
const mockJson = jest.fn();
const mockCreateServer = jest.fn(() => ({ listen: jest.fn() }));
const mockCors = jest.fn();
const mockCookieParser = jest.fn();
const mockSession = jest.fn();
const mockRefreshToken = jest.fn();
const mockInvalidJSON = jest.fn();
const mockCaptureResponse = jest.fn();
const mockCheckAuthStatus = jest.fn();
const mockCreateSocketServer = jest.fn();
const mockAuthRouter = { createRouter: jest.fn(() => 'auth-router') };
const mockUsersRouter = { createRouter: jest.fn(() => 'users-router') };
const mockGameRouter = { createRouter: jest.fn(() => 'game-router') };
const mockGamePlayersRouter = { createRouter: jest.fn(() => 'game-players-router') };

jest.unstable_mockModule('express', () => ({
  default: mockExpress,
  json: mockJson,
}));
jest.unstable_mockModule('cookie-parser', () => ({ default: () => mockCookieParser }));
jest.unstable_mockModule('http', () => ({ createServer: mockCreateServer }));
jest.unstable_mockModule('../../../src/Middlewares/corsMiddleware.js', () => ({ corsMiddleware: () => mockCors }));
jest.unstable_mockModule('../../../src/Middlewares/sessionMiddleware.js', () => ({ sessionMiddleware: () => mockSession }));
jest.unstable_mockModule('../../../src/Middlewares/refreshTokenMiddleware.js', () => ({ refreshTokenMiddleware: () => mockRefreshToken }));
jest.unstable_mockModule('../../../src/Middlewares/invalidJSONMiddleware.js', () => ({ invalidJSONMiddleware: () => mockInvalidJSON }));
jest.unstable_mockModule('../../../src/Middlewares/captureResponseDataMiddleware.js', () => ({ captureResponseDataMiddleware: mockCaptureResponse }));
jest.unstable_mockModule('../../../src/Middlewares/checkAuthStatusMiddleware.js', () => ({ checkAuthStatusMiddleware: () => mockCheckAuthStatus }));
jest.unstable_mockModule('../../../src/Core/GameServer.js', () => ({ default: mockCreateSocketServer }));
jest.unstable_mockModule('../../../src/Routes/AuthRouter.js', () => ({ default: mockAuthRouter }));
jest.unstable_mockModule('../../../src/Routes/UsersRouter.js', () => ({ default: mockUsersRouter }));
jest.unstable_mockModule('../../../src/Routes/GameRouter.js', () => ({ default: mockGameRouter }));
jest.unstable_mockModule('../../../src/Routes/GamePlayersRouter.js', () => ({ default: mockGamePlayersRouter }));

const AppModule = await import('../../../src/Core/App.js');
const App = AppModule.default || AppModule;

describe('App', () => {
  it('should log when server starts in startApp', () => {
    const app = new App();
    const logSpy = jest.spyOn(console, 'info').mockImplementation(() => {});
    let listenCallback;
    app.server.listen = jest.fn((port, cb) => { listenCallback = cb; });
    app.startApp();
 
    listenCallback();
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('Server listening on http://'),
    );
    logSpy.mockRestore();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.API_VERSION = '1';
  });

  it('should initialize express, http server, and socket server', () => {
    const app = new App();
    expect(mockExpress).toHaveBeenCalled();
    expect(mockCreateServer).toHaveBeenCalled();
    expect(mockCreateSocketServer).toHaveBeenCalled();
    expect(app.API_PREFIX).toBe('/api/v1');
  });

  it('should call listen on startApp', () => {
    const app = new App();
    app.server.listen = jest.fn();
    app.startApp();
    expect(app.server.listen).toHaveBeenCalled();
  });

  it('should set up middleware and routes', () => {
    const app = new App();
    expect(app.app.use).toHaveBeenCalled();
    expect(app.app.disable).toHaveBeenCalledWith('x-powered-by');
  });

  it('should set IGNORED_ROUTES with correct API_PREFIX', () => {
    process.env.API_VERSION = '2';
    const app = new App();
    expect(app.IGNORED_ROUTES).toContain('/api/v2/auth/oauth/*');
  });
});
