import { invalidJSONMiddleware } from '../../../src/Middlewares/invalidJSONMiddleware.js';
import StatusMessage from '../../../src/Utils/StatusMessage.js';
import { jest } from '@jest/globals';

describe('invalidJSONMiddleware', () => {
  beforeAll(() => {
    jest.spyOn(console, 'info').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  it('should return 400 if error is invalid JSON', () => {
    const error = new SyntaxError('Unexpected token');
    error.status = 400;
    error.body = true;
    const req = {};
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    invalidJSONMiddleware()(error, req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ msg: StatusMessage.INVALID_JSON });
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next if error is not invalid JSON', () => {
    const error = new Error('Other error');
    const req = {};
    const res = { status: jest.fn(), json: jest.fn() };
    const next = jest.fn();

    invalidJSONMiddleware()(error, req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
