import { jest } from '@jest/globals';

await jest.unstable_mockModule('../../../src/Models/UserModel.js', () => ({
  default: { getById: jest.fn(() => ({ id: 1, length: 1 })) }
}));
await jest.unstable_mockModule('../../../src/Utils/StatusMessage.js', () => ({
  default: { ERROR_REFRESHING_ACCESS_TOKEN: 'err', USER_NOT_FOUND: 'notfound' }
}));
await jest.unstable_mockModule('../../../src/Utils/jsonWebTokenUtils.js', () => ({
  createAccessToken: jest.fn(() => 'access')
}));
await jest.unstable_mockModule('jsonwebtoken', () => ({ default: { verify: jest.fn(() => ({ id: 1 })) } }));

const socketUtils = await import('../../../src/Utils/socketUtils.js');

describe('socketUtils', () => {
  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('handleError emits and disconnects', () => {
    const socket = { emit: jest.fn(), disconnect: jest.fn() };
    socketUtils.handleError(socket, 'err');
    expect(socket.emit).toHaveBeenCalledWith('error-info', { msg: 'err' });
    expect(socket.disconnect).toHaveBeenCalled();
  });

  it('refreshAccessToken returns accessToken (success)', async () => {
    const socket = { emit: jest.fn(), disconnect: jest.fn() };
    const result = await socketUtils.refreshAccessToken(socket, 'token');
    expect(result).toBe('access');
  });

  it('refreshAccessToken handles user null', async () => {
    // mock getById to return null
    const userModel = (await import('../../../src/Models/UserModel.js')).default;
    userModel.getById = jest.fn().mockResolvedValue(null);
    const socket = { emit: jest.fn(), disconnect: jest.fn() };
    const result = await socketUtils.refreshAccessToken(socket, 'token');
    expect(socket.emit).toHaveBeenCalledWith('error-info', { msg: 'err' });
    expect(result).toBeUndefined();
  });

  it('refreshAccessToken handles user empty array', async () => {
    // mock getById to return []
    const userModel = (await import('../../../src/Models/UserModel.js')).default;
    userModel.getById = jest.fn().mockResolvedValue([]);
    const socket = { emit: jest.fn(), disconnect: jest.fn() };
    const result = await socketUtils.refreshAccessToken(socket, 'token');
    expect(socket.emit).toHaveBeenCalledWith('error-info', { msg: 'notfound' });
    expect(result).toBeUndefined();
  });

  it('refreshAccessToken handles error (catch)', async () => {
    // mock jwt.verify to throw
    const jwt = (await import('jsonwebtoken')).default;
    jwt.verify = jest.fn(() => { throw new Error('fail'); });
    const socket = { emit: jest.fn(), disconnect: jest.fn() };
    const result = await socketUtils.refreshAccessToken(socket, 'token');
    expect(socket.emit).toHaveBeenCalledWith('error-info', { msg: 'err' });
    expect(result).toBeUndefined();
  });
});
