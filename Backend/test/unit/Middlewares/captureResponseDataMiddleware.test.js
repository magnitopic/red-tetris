import { captureResponseDataMiddleware } from '../../../src/Middlewares/captureResponseDataMiddleware.js';
import { jest } from '@jest/globals';

describe('captureResponseDataMiddleware', () => {
  it('should capture response data and call next', () => {
    const req = {};
    const res = {
      json: jest.fn(function (data) { return data; })
    };
    const next = jest.fn();

    captureResponseDataMiddleware(req, res, next);
    // Simulate sending a response
    const data = { foo: 'bar' };
    res.json(data);
    expect(res.responseData).toEqual(data);
    expect(next).toHaveBeenCalled();
  });
});
