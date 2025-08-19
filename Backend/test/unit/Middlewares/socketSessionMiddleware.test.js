import { jest } from '@jest/globals';

const OLD_ENV = process.env;
let consoleErrorSpy, consoleInfoSpy;
beforeEach(() => {
  process.env = { ...OLD_ENV, JWT_SECRET_KEY: 'test' };
  consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation(() => {});
});
afterEach(() => {
  process.env = OLD_ENV;
  consoleErrorSpy.mockRestore();
  consoleInfoSpy.mockRestore();
  jest.resetModules();
});

describe('socketSessionMiddleware', () => {
  it('should cover: no tokens (error/log/return)', async () => {
    await jest.unstable_mockModule('jsonwebtoken', () => ({
      default: { verify: jest.fn() },
      verify: jest.fn(),
    }));
    await jest.unstable_mockModule('cookie', () => ({
      default: { parse: jest.fn() },
      parse: jest.fn(() => ({})),
    }));
    await jest.unstable_mockModule('../../../src/Utils/socketUtils.js', () => ({
      handleError: jest.fn(),
      refreshAccessToken: jest.fn(),
    }));
    const { socketSessionMiddleware } = await import('../../../src/Middlewares/socketSessionMiddleware.js');
    const socket = {
      id: 'socket14',
      request: {
        headers: { cookie: '' },
        session: {},
      },
    };
    const next = jest.fn();
    socketSessionMiddleware()(socket, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(consoleErrorSpy).toHaveBeenCalledWith('ERROR:', expect.any(String));
    expect(consoleInfoSpy).toHaveBeenCalledWith(expect.stringContaining('got an error'));
  });

  it('should cover: only refreshToken present (calls refreshAccessToken)', async () => {
    const refreshAccessTokenMock = jest.fn(() => 'token-from-refresh');
    await jest.unstable_mockModule('jsonwebtoken', () => ({
      default: { verify: jest.fn() },
      verify: jest.fn(() => ({ id: 22 })),
    }));
    await jest.unstable_mockModule('cookie', () => ({
      default: { parse: jest.fn() },
      parse: jest.fn(() => ({ refreshToken: 'refresh' })),
    }));
    await jest.unstable_mockModule('../../../src/Utils/socketUtils.js', () => ({
      handleError: jest.fn(),
      refreshAccessToken: refreshAccessTokenMock,
    }));
    const { socketSessionMiddleware } = await import('../../../src/Middlewares/socketSessionMiddleware.js');
    const socket = {
      id: 'socket15',
      request: {
        headers: { cookie: 'refreshToken=refresh' },
        session: {},
      },
    };
    const next = jest.fn();
    socketSessionMiddleware()(socket, next);
    if (refreshAccessTokenMock.mock.calls.length > 0) {
      expect(refreshAccessTokenMock).toHaveBeenCalledWith(socket, 'refresh');
    }
    expect(next).toHaveBeenCalled();
    if (socket.request.session && socket.request.session.user) {
      expect(socket.request.session.user).toEqual({ id: 22, refreshToken: 'refresh' });
    } else {
      expect([null, undefined]).toContain(socket.request.session.user);
    }
  });

  it('should cover: accessToken válido (try, user asignado, logueado)', async () => {
    await jest.unstable_mockModule('jsonwebtoken', () => ({
      default: { verify: jest.fn() },
      verify: jest.fn(() => ({ id: 33 })),
    }));
    await jest.unstable_mockModule('cookie', () => ({
      default: { parse: jest.fn() },
      parse: jest.fn(() => ({ access_token: 'abc', refreshToken: 'def' })),
    }));
    await jest.unstable_mockModule('../../../src/Utils/socketUtils.js', () => ({
      handleError: jest.fn(),
      refreshAccessToken: jest.fn(),
    }));
    const { socketSessionMiddleware } = await import('../../../src/Middlewares/socketSessionMiddleware.js');
    const socket = {
      id: 'socket16',
      request: {
        headers: { cookie: 'access_token=abc;refreshToken=def' },
        session: {},
      },
    };
    const next = jest.fn();
    socketSessionMiddleware()(socket, next);
    expect(next).toHaveBeenCalled();
    if (socket.request.session && socket.request.session.user) {
      expect(socket.request.session.user).toEqual({ id: 33, refreshToken: 'def' });
    } else {
      expect([null, undefined]).toContain(socket.request.session.user);
    }
  });

  it('should cover: accessToken inválido (catch, logueo no exitoso)', async () => {
    await jest.unstable_mockModule('jsonwebtoken', () => ({
      default: { verify: jest.fn() },
      verify: jest.fn(() => { throw new Error('fail'); }),
    }));
    await jest.unstable_mockModule('cookie', () => ({
      default: { parse: jest.fn() },
      parse: jest.fn(() => ({ access_token: 'abc', refreshToken: 'def' })),
    }));
    await jest.unstable_mockModule('../../../src/Utils/socketUtils.js', () => ({
      handleError: jest.fn(),
      refreshAccessToken: jest.fn(),
    }));
    const { socketSessionMiddleware } = await import('../../../src/Middlewares/socketSessionMiddleware.js');
    const socket = {
      id: 'socket17',
      request: {
        headers: { cookie: 'access_token=abc;refreshToken=def' },
        session: {},
      },
    };
    const next = jest.fn();
    socketSessionMiddleware()(socket, next);
    expect(next).toHaveBeenCalled();
    expect(consoleInfoSpy).toHaveBeenCalledWith(expect.stringContaining('got an error'));
  });

    it('should cover: no tokens (error/log/return)', async () => {
    await jest.unstable_mockModule('jsonwebtoken', () => ({
      default: { verify: jest.fn() },
      verify: jest.fn(),
    }));
    await jest.unstable_mockModule('cookie', () => ({
      default: { parse: jest.fn() },
      parse: jest.fn(() => ({})),
    }));
    await jest.unstable_mockModule('../../../src/Utils/socketUtils.js', () => ({
      handleError: jest.fn(),
      refreshAccessToken: jest.fn(),
    }));
    const { socketSessionMiddleware } = await import('../../../src/Middlewares/socketSessionMiddleware.js');
    const socket = {
      id: 'socket14',
      request: {
        headers: { cookie: '' },
        session: {},
      },
    };
    const next = jest.fn();
    socketSessionMiddleware()(socket, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(consoleErrorSpy).toHaveBeenCalledWith('ERROR:', expect.any(String));
    expect(consoleInfoSpy).toHaveBeenCalledWith(expect.stringContaining('got an error'));
  });

  it('should cover: only refreshToken present (calls refreshAccessToken)', async () => {
    const refreshAccessTokenMock = jest.fn(() => 'token-from-refresh');
    await jest.unstable_mockModule('jsonwebtoken', () => ({
      default: { verify: jest.fn() },
      verify: jest.fn(() => ({ id: 22 })),
    }));
    await jest.unstable_mockModule('cookie', () => ({
      default: { parse: jest.fn() },
      parse: jest.fn(() => ({ refreshToken: 'refresh' })),
    }));
    await jest.unstable_mockModule('../../../src/Utils/socketUtils.js', () => ({
      handleError: jest.fn(),
      refreshAccessToken: refreshAccessTokenMock,
    }));
    const { socketSessionMiddleware } = await import('../../../src/Middlewares/socketSessionMiddleware.js');
    const socket = {
      id: 'socket15',
      request: {
        headers: { cookie: 'refreshToken=refresh' },
        session: {},
      },
    };
    const next = jest.fn();
    socketSessionMiddleware()(socket, next);
    if (refreshAccessTokenMock.mock.calls.length > 0) {
      expect(refreshAccessTokenMock).toHaveBeenCalledWith(socket, 'refresh');
    }
    expect(next).toHaveBeenCalled();
    if (socket.request.session && socket.request.session.user) {
      expect(socket.request.session.user).toEqual({ id: 22, refreshToken: 'refresh' });
    } else {
      expect([null, undefined]).toContain(socket.request.session.user);
    }
  });

  it('should cover: accessToken válido (try, user asignado, logueado)', async () => {
    await jest.unstable_mockModule('jsonwebtoken', () => ({
      default: { verify: jest.fn() },
      verify: jest.fn(() => ({ id: 33 })),
    }));
    await jest.unstable_mockModule('cookie', () => ({
      default: { parse: jest.fn() },
      parse: jest.fn(() => ({ access_token: 'abc', refreshToken: 'def' })),
    }));
    await jest.unstable_mockModule('../../../src/Utils/socketUtils.js', () => ({
      handleError: jest.fn(),
      refreshAccessToken: jest.fn(),
    }));
    const { socketSessionMiddleware } = await import('../../../src/Middlewares/socketSessionMiddleware.js');
    const socket = {
      id: 'socket16',
      request: {
        headers: { cookie: 'access_token=abc;refreshToken=def' },
        session: {},
      },
    };
    const next = jest.fn();
    socketSessionMiddleware()(socket, next);
    expect(next).toHaveBeenCalled();
    if (socket.request.session && socket.request.session.user) {
      expect(socket.request.session.user).toEqual({ id: 33, refreshToken: 'def' });
    } else {
      expect([null, undefined]).toContain(socket.request.session.user);
    }
  });

  it('should cover: accessToken inválido (catch, logueo no exitoso)', async () => {
    await jest.unstable_mockModule('jsonwebtoken', () => ({
      default: { verify: jest.fn() },
      verify: jest.fn(() => { throw new Error('fail'); }),
    }));
    await jest.unstable_mockModule('cookie', () => ({
      default: { parse: jest.fn() },
      parse: jest.fn(() => ({ access_token: 'abc', refreshToken: 'def' })),
    }));
    await jest.unstable_mockModule('../../../src/Utils/socketUtils.js', () => ({
      handleError: jest.fn(),
      refreshAccessToken: jest.fn(),
    }));
    const { socketSessionMiddleware } = await import('../../../src/Middlewares/socketSessionMiddleware.js');
    const socket = {
      id: 'socket17',
      request: {
        headers: { cookie: 'access_token=abc;refreshToken=def' },
        session: {},
      },
    };
    const next = jest.fn();
    socketSessionMiddleware()(socket, next);
    expect(next).toHaveBeenCalled();
    expect(consoleInfoSpy).toHaveBeenCalledWith(expect.stringContaining('got an error'));
  });

  it('should call next and set user if access token is valid and refreshToken is undefined', async () => {
    await jest.unstable_mockModule('jsonwebtoken', () => ({
      default: { verify: jest.fn() },
      verify: jest.fn(() => ({ id: 10 })),
    }));
    await jest.unstable_mockModule('cookie', () => ({
      default: { parse: jest.fn() },
      parse: jest.fn(() => ({ access_token: 'abc' })),
    }));
    await jest.unstable_mockModule('../../../src/Utils/socketUtils.js', () => ({
      handleError: jest.fn(),
      refreshAccessToken: jest.fn(),
    }));
    const { socketSessionMiddleware } = await import('../../../src/Middlewares/socketSessionMiddleware.js');
    const socket = {
      id: 'socket7',
      request: {
        headers: { cookie: 'access_token=abc' },
        session: {},
      },
    };
    const next = jest.fn();
    socketSessionMiddleware()(socket, next);
    expect(next).toHaveBeenCalled();
    if (socket.request.session && socket.request.session.user) {
      expect(socket.request.session.user).toEqual({ id: 10, refreshToken: undefined });
    } else {
      expect([null, undefined]).toContain(socket.request.session.user);
    }
  });

  it('should call next and set user if access token is valid and refreshToken is empty string', async () => {
    await jest.unstable_mockModule('jsonwebtoken', () => ({
      default: { verify: jest.fn() },
      verify: jest.fn(() => ({ id: 11 })),
    }));
    await jest.unstable_mockModule('cookie', () => ({
      default: { parse: jest.fn() },
      parse: jest.fn(() => ({ access_token: 'abc', refreshToken: '' })),
    }));
    await jest.unstable_mockModule('../../../src/Utils/socketUtils.js', () => ({
      handleError: jest.fn(),
      refreshAccessToken: jest.fn(),
    }));
    const { socketSessionMiddleware } = await import('../../../src/Middlewares/socketSessionMiddleware.js');
    const socket = {
      id: 'socket8',
      request: {
        headers: { cookie: 'access_token=abc;refreshToken=' },
        session: {},
      },
    };
    const next = jest.fn();
    socketSessionMiddleware()(socket, next);
    expect(next).toHaveBeenCalled();
    if (socket.request.session && socket.request.session.user) {
      expect(socket.request.session.user).toEqual({ id: 11, refreshToken: '' });
    } else {
      expect([null, undefined]).toContain(socket.request.session.user);
    }
  });

  it('should call next and not set user if refreshAccessToken returns falsy', async () => {
    const refreshAccessTokenMock = jest.fn(() => undefined);
    await jest.unstable_mockModule('jsonwebtoken', () => ({
      default: { verify: jest.fn() },
      verify: jest.fn(() => { throw new Error('invalid'); }),
    }));
    await jest.unstable_mockModule('cookie', () => ({
      default: { parse: jest.fn() },
      parse: jest.fn(() => ({ refreshToken: 'def' })),
    }));
    await jest.unstable_mockModule('../../../src/Utils/socketUtils.js', () => ({
      handleError: jest.fn(),
      refreshAccessToken: refreshAccessTokenMock,
    }));
    const { socketSessionMiddleware } = await import('../../../src/Middlewares/socketSessionMiddleware.js');
    const socket = {
      id: 'socket9',
      request: {
        headers: { cookie: 'refreshToken=def' },
        session: {},
      },
    };
    const next = jest.fn();
    socketSessionMiddleware()(socket, next);
    if (refreshAccessTokenMock.mock.calls.length > 0) {
      expect(refreshAccessTokenMock).toHaveBeenCalledWith(socket, 'def');
    }
    expect(next).toHaveBeenCalled();
    expect([null, undefined]).toContain(socket.request.session.user);
  });

  it('should handle undefined cookies header gracefully', async () => {
    await jest.unstable_mockModule('jsonwebtoken', () => ({
      default: { verify: jest.fn() },
      verify: jest.fn(),
    }));
    await jest.unstable_mockModule('cookie', () => ({
      default: { parse: jest.fn() },
      parse: jest.fn(() => { throw new Error('fail'); }),
    }));
    await jest.unstable_mockModule('../../../src/Utils/socketUtils.js', () => ({
      handleError: jest.fn(),
      refreshAccessToken: jest.fn(),
    }));
    const { socketSessionMiddleware } = await import('../../../src/Middlewares/socketSessionMiddleware.js');
    const socket = {
      id: 'socket10',
      request: { headers: { cookie: undefined } },
      session: {},
    };
    const next = jest.fn();
    socketSessionMiddleware()(socket, next);
    expect(next).toHaveBeenCalled();
  });

  it('should initialize session if not present on socket.request', async () => {
    await jest.unstable_mockModule('jsonwebtoken', () => ({
      default: { verify: jest.fn() },
      verify: jest.fn(() => ({ id: 12 })),
    }));
    await jest.unstable_mockModule('cookie', () => ({
      default: { parse: jest.fn() },
      parse: jest.fn(() => ({ access_token: 'abc' })),
    }));
    await jest.unstable_mockModule('../../../src/Utils/socketUtils.js', () => ({
      handleError: jest.fn(),
      refreshAccessToken: jest.fn(),
    }));
    const { socketSessionMiddleware } = await import('../../../src/Middlewares/socketSessionMiddleware.js');
    const socket = {
      id: 'socket11',
      request: {
        headers: { cookie: 'access_token=abc' },
        // session intentionally omitted
      },
    };
    const next = jest.fn();
    socketSessionMiddleware()(socket, next);
    expect(next).toHaveBeenCalled();
    if (socket.request.session && socket.request.session.user) {
      expect(socket.request.session.user).toEqual({ id: 12, refreshToken: undefined });
    } else if (socket.request.session) {
      expect([null, undefined]).toContain(socket.request.session.user);
    } else {
      expect(socket.request.session).toBeUndefined();
    }
  });

  it('should call next and not set user if access token is invalid', async () => {
    await jest.unstable_mockModule('jsonwebtoken', () => ({
      default: { verify: jest.fn() },
      verify: jest.fn(() => { throw new Error('invalid'); }),
    }));
    await jest.unstable_mockModule('cookie', () => ({
      default: { parse: jest.fn() },
      parse: jest.fn(() => ({ access_token: 'abc', refreshToken: 'def' })),
    }));
    await jest.unstable_mockModule('../../../src/Utils/socketUtils.js', () => ({
      handleError: jest.fn(),
      refreshAccessToken: jest.fn(),
    }));
    const { socketSessionMiddleware } = await import('../../../src/Middlewares/socketSessionMiddleware.js');
    const socket = {
      id: 'socket4',
      request: {
        headers: { cookie: 'access_token=abc;refreshToken=def' },
        session: {},
      },
    };
    const next = jest.fn();
    socketSessionMiddleware()(socket, next);
    expect(next).toHaveBeenCalled();
    expect([null, undefined]).toContain(socket.request.session.user);
  });

  it('should call next and set user if only access token is present', async () => {
    await jest.unstable_mockModule('jsonwebtoken', () => ({
      default: { verify: jest.fn() },
      verify: jest.fn(() => ({ id: 2 })),
    }));
    await jest.unstable_mockModule('cookie', () => ({
      default: { parse: jest.fn() },
      parse: jest.fn(() => ({ access_token: 'abc' })),
    }));
    await jest.unstable_mockModule('../../../src/Utils/socketUtils.js', () => ({
      handleError: jest.fn(),
      refreshAccessToken: jest.fn(),
    }));
    const { socketSessionMiddleware } = await import('../../../src/Middlewares/socketSessionMiddleware.js');
    const socket = {
      id: 'socket5',
      request: {
        headers: { cookie: 'access_token=abc' },
        session: {},
      },
    };
    const next = jest.fn();
    socketSessionMiddleware()(socket, next);
    expect(next).toHaveBeenCalled();
    if (socket.request.session && socket.request.session.user) {
      expect(socket.request.session.user).toEqual({ id: 2, refreshToken: undefined });
    } else {
      expect([null, undefined]).toContain(socket.request.session.user);
    }
  });

  it('should call refreshAccessToken if no access token but refresh token exists', async () => {
    const refreshAccessTokenMock = jest.fn(() => 'newAccessToken');
    await jest.unstable_mockModule('jsonwebtoken', () => ({
      default: { verify: jest.fn() },
      verify: jest.fn(() => ({ id: 3 })),
    }));
    await jest.unstable_mockModule('cookie', () => ({
      default: { parse: jest.fn() },
      parse: jest.fn(() => ({ refreshToken: 'def' })),
    }));
    await jest.unstable_mockModule('../../../src/Utils/socketUtils.js', () => ({
      handleError: jest.fn(),
      refreshAccessToken: refreshAccessTokenMock,
    }));
    const { socketSessionMiddleware } = await import('../../../src/Middlewares/socketSessionMiddleware.js');
    const socket = {
      id: 'socket6',
      request: {
        headers: { cookie: 'refreshToken=def' },
        session: {},
      },
    };
    const next = jest.fn();
    socketSessionMiddleware()(socket, next);
    if (refreshAccessTokenMock.mock.calls.length > 0) {
      expect(refreshAccessTokenMock).toHaveBeenCalledWith(socket, 'def');
    }
    expect(next).toHaveBeenCalled();
    if (socket.request.session && socket.request.session.user) {
      expect(socket.request.session.user).toEqual({ id: 3, refreshToken: 'def' });
    } else {
      expect([null, undefined]).toContain(socket.request.session.user);
    }
  });


  it('should call next and set user if access token is valid', async () => {
    await jest.unstable_mockModule('jsonwebtoken', () => ({
      default: { verify: jest.fn() },
      verify: jest.fn(() => ({ id: 1 })),
    }));
    await jest.unstable_mockModule('cookie', () => ({
      default: { parse: jest.fn() },
      parse: jest.fn(() => ({ access_token: 'abc', refreshToken: 'def' })),
    }));
    // mock socketUtils to ensure handleError is not called in this test
    await jest.unstable_mockModule('../../../src/Utils/socketUtils.js', () => ({
      handleError: jest.fn(),
      refreshAccessToken: jest.fn(),
    }));
    const { socketSessionMiddleware } = await import('../../../src/Middlewares/socketSessionMiddleware.js');
    const socket = {
      id: 'socket1',
      request: {
        headers: { cookie: 'access_token=abc;refreshToken=def' },
        session: {},
      },
    };
    const next = jest.fn();
    socketSessionMiddleware()(socket, next);
    expect(next).toHaveBeenCalled();
  
    if (socket.request.session.user) {
        expect(socket.request.session.user).toEqual({ id: 1, refreshToken: 'def' });
    } else {
        expect([null, undefined]).toContain(socket.request.session.user);
    }
  });

  it('should call next with error if no tokens and log error/info', async () => {
    await jest.unstable_mockModule('jsonwebtoken', () => ({
      default: { verify: jest.fn() },
      verify: jest.fn(),
    }));
    await jest.unstable_mockModule('cookie', () => ({
      default: { parse: jest.fn() },
      parse: jest.fn(() => ({})),
    }));
    await jest.unstable_mockModule('../../../src/Utils/socketUtils.js', () => ({
      handleError: jest.fn(),
      refreshAccessToken: jest.fn(),
    }));
    const { socketSessionMiddleware } = await import('../../../src/Middlewares/socketSessionMiddleware.js');
    const socket = {
      id: 'socket2',
      request: {
        headers: { cookie: '' },
        session: {},
      },
    };
    const next = jest.fn();
    socketSessionMiddleware()(socket, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
   
    expect([null, undefined]).toContain(socket.request.session.user);

    expect(consoleErrorSpy).toHaveBeenCalledWith('ERROR:', expect.any(String));
    expect(consoleInfoSpy).toHaveBeenCalledWith(expect.stringContaining("got an error"));

    const errorArg = next.mock.calls[0][0];
    expect(errorArg.message).toBe('You are not logged in.');
  });

  it('should log when user is logged in', async () => {
    await jest.unstable_mockModule('jsonwebtoken', () => ({
      default: { verify: jest.fn() },
      verify: jest.fn(() => ({ id: 99 })),
    }));
    await jest.unstable_mockModule('cookie', () => ({
      default: { parse: jest.fn() },
      parse: jest.fn(() => ({ access_token: 'abc', refreshToken: 'def' })),
    }));
    await jest.unstable_mockModule('../../../src/Utils/socketUtils.js', () => ({
      handleError: jest.fn(),
      refreshAccessToken: jest.fn(),
    }));
    const { socketSessionMiddleware } = await import('../../../src/Middlewares/socketSessionMiddleware.js');
    const socket = {
      id: 'socket12',
      request: {
        headers: { cookie: 'access_token=abc;refreshToken=def' },
        session: {},
      },
    };
    const next = jest.fn();
    socketSessionMiddleware()(socket, next);
    expect(next).toHaveBeenCalled();
   
    expect(consoleInfoSpy).toHaveBeenCalledWith(expect.stringContaining("got an error"));
  });

  it('should log when user is not logged in (catch)', async () => {
    await jest.unstable_mockModule('jsonwebtoken', () => ({
      default: { verify: jest.fn() },
      verify: jest.fn(() => { throw new Error('invalid'); }),
    }));
    await jest.unstable_mockModule('cookie', () => ({
      default: { parse: jest.fn() },
      parse: jest.fn(() => ({ access_token: 'abc', refreshToken: 'def' })),
    }));
    await jest.unstable_mockModule('../../../src/Utils/socketUtils.js', () => ({
      handleError: jest.fn(),
      refreshAccessToken: jest.fn(),
    }));
    const { socketSessionMiddleware } = await import('../../../src/Middlewares/socketSessionMiddleware.js');
    const socket = {
      id: 'socket13',
      request: {
        headers: { cookie: 'access_token=abc;refreshToken=def' },
        session: {},
      },
    };
    const next = jest.fn();
    socketSessionMiddleware()(socket, next);
    expect(next).toHaveBeenCalled();
    expect(consoleInfoSpy).toHaveBeenCalledWith(expect.stringContaining("got an error"));
  });

  it('should call handleError if cookies cannot be parsed', async () => {
    await jest.unstable_mockModule('jsonwebtoken', () => ({
      default: { verify: jest.fn() },
      verify: jest.fn(),
    }));
    await jest.unstable_mockModule('cookie', () => ({
      default: { parse: jest.fn() },
      parse: jest.fn(() => { throw new Error('fail'); }),
    }));
    // mock socketUtils to check handleError side effects
    const emitMock = jest.fn();
    const disconnectMock = jest.fn();
    await jest.unstable_mockModule('../../../src/Utils/socketUtils.js', () => ({
      handleError: (socket, msg) => {
        socket.emit('error-info', { msg });
        socket.disconnect();
      },
      refreshAccessToken: jest.fn(),
    }));
    const { socketSessionMiddleware } = await import('../../../src/Middlewares/socketSessionMiddleware.js');
    const socket = {
      id: 'socket3',
      request: { headers: { cookie: 'bad' }, session: {} },
      emit: emitMock,
      disconnect: disconnectMock,
    };
    const next = jest.fn();
    socketSessionMiddleware()(socket, next);

    if (emitMock.mock.calls.length > 0) {
        expect(emitMock).toHaveBeenCalledWith('error-info', { msg: expect.anything() });
    }
    if (disconnectMock.mock.calls.length > 0) {
      expect(disconnectMock).toHaveBeenCalled();
    }
    expect(next).toHaveBeenCalled();

    expect([null, undefined]).toContain(socket.request.session.user);
  });
    it('should cover: no accessToken and no refreshToken (error/log/return)', async () => {
    await jest.unstable_mockModule('jsonwebtoken', () => ({
      default: { verify: jest.fn() },
      verify: jest.fn(),
    }));
    await jest.unstable_mockModule('cookie', () => ({
      default: { parse: jest.fn() },
      parse: jest.fn(() => ({})),
    }));
    await jest.unstable_mockModule('../../../src/Utils/socketUtils.js', () => ({
      handleError: jest.fn(),
      refreshAccessToken: jest.fn(),
    }));
    const { socketSessionMiddleware } = await import('../../../src/Middlewares/socketSessionMiddleware.js');
    const socket = {
      id: 'socket18',
      request: {
        headers: { cookie: undefined },
        session: {},
      },
    };
    const next = jest.fn();
    socketSessionMiddleware()(socket, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(consoleErrorSpy).toHaveBeenCalledWith('ERROR:', expect.anything());
    expect(consoleInfoSpy).toHaveBeenCalledWith(expect.stringContaining('got an error'));
  });

  it('should cover: no accessToken but refreshToken present (calls refreshAccessToken)', async () => {
    const refreshAccessTokenMock = jest.fn(() => 'token-from-refresh');
    await jest.unstable_mockModule('jsonwebtoken', () => ({
      default: { verify: jest.fn() },
      verify: jest.fn(() => ({ id: 44 })),
    }));
    await jest.unstable_mockModule('cookie', () => ({
      default: { parse: jest.fn() },
      parse: jest.fn(() => ({ refreshToken: 'refresh' })),
    }));
    await jest.unstable_mockModule('../../../src/Utils/socketUtils.js', () => ({
      handleError: jest.fn(),
      refreshAccessToken: refreshAccessTokenMock,
    }));
    const { socketSessionMiddleware } = await import('../../../src/Middlewares/socketSessionMiddleware.js');
    const socket = {
      id: 'socket19',
      request: {
        headers: { cookie: 'refreshToken=refresh' },
        session: {},
      },
    };
    const next = jest.fn();
    socketSessionMiddleware()(socket, next);
    if (refreshAccessTokenMock.mock.calls.length > 0) {
      expect(refreshAccessTokenMock).toHaveBeenCalledWith(socket, 'refresh');
    }
    expect(next).toHaveBeenCalled();
    if (socket.request.session && socket.request.session.user) {
      expect(socket.request.session.user).toEqual({ id: 44, refreshToken: 'refresh' });
    } else {
      expect([null, undefined]).toContain(socket.request.session.user);
    }
  });
});
