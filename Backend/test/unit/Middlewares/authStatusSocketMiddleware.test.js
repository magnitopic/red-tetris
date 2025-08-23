import { jest } from '@jest/globals';
import { authStatusSocketMiddleware } from '../../../src/Middlewares/authStatusSocketMiddleware.js';
import StatusMessage from '../../../src/Utils/StatusMessage.js';

describe('authStatusSocketMiddleware', () => {
  beforeAll(() => {
    jest.spyOn(console, 'info').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  it('should emit error-info if event is protected and user not in session', () => {
    const socket = {
      request: { session: { user: null } },
      emit: jest.fn(),
    };
    const protectedEvents = ['protected'];
    const packet = ['protected'];
    const next = jest.fn();
    authStatusSocketMiddleware(socket, protectedEvents)(packet, next);
    expect(socket.emit).toHaveBeenCalledWith('error-info', { msg: StatusMessage.FORBIDDEN_ACCESS_EVENT });
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next if event is not protected', () => {
    const socket = { request: { session: { user: null } }, emit: jest.fn() };
    const protectedEvents = ['protected'];
    const packet = ['not-protected'];
    const next = jest.fn();
    authStatusSocketMiddleware(socket, protectedEvents)(packet, next);
    expect(next).toHaveBeenCalled();
  });

  it('should call next if user is in session', () => {
    const socket = { request: { session: { user: { id: 1 } } }, emit: jest.fn() };
    const protectedEvents = ['protected'];
    const packet = ['protected'];
    const next = jest.fn();
    authStatusSocketMiddleware(socket, protectedEvents)(packet, next);
    expect(next).toHaveBeenCalled();
  });
});
