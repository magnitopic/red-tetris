import { jest } from '@jest/globals';
const errorUtils = await import('../../../src/Utils/errorUtils.js');

describe('errorUtils', () => {
  it('returnErrorWithNext calls next and returns error', () => {
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    errorUtils.returnErrorWithNext(res, next, 400, 'err');
    expect(next).toHaveBeenCalledWith(new Error('err'));
  });

  it('returnErrorStatus returns false', () => {
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const result = errorUtils.returnErrorStatus(res, 400, 'err');
    expect(result).toBe(false);
  });

  it('emitErrorAndReturnNull emits error and returns null', () => {
    const socket = { emit: jest.fn() };
    const result = errorUtils.emitErrorAndReturnNull(socket, 'err');
    expect(socket.emit).toHaveBeenCalledWith('error-info', { msg: 'err' });
    expect(result).toBeNull();
  });
});
