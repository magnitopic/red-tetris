import { checkValidUserIdMiddleware } from '../../../src/Middlewares/checkValidUserIdMiddleware.js';
import StatusMessage from '../../../src/Utils/StatusMessage.js';
import { jest } from '@jest/globals';

describe('checkValidUserIdMiddleware', () => {
  it('should return 403 if user id does not match', () => {
    const req = { params: { id: '2' }, session: { user: { id: '1' } } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    checkValidUserIdMiddleware()(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ msg: StatusMessage.CANNOT_EDIT_OTHER_PROFILE });
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next if user id matches', () => {
    const req = { params: { id: '1' }, session: { user: { id: '1' } } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    checkValidUserIdMiddleware()(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
