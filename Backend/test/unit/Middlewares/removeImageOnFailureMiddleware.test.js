import { jest } from '@jest/globals';
import StatusMessage from '../../../src/Utils/StatusMessage.js';

let removeImageOnFailureMiddleware, fsExtra;
beforeAll(async () => {
  await jest.unstable_mockModule('fs-extra', () => ({
    default: { remove: jest.fn() },
    remove: jest.fn(),
  }));
  fsExtra = (await import('fs-extra')).default;
  ({ removeImageOnFailureMiddleware } = await import('../../../src/Middlewares/removeImageOnFailureMiddleware.js'));
});

describe('removeImageOnFailureMiddleware', () => {
  beforeAll(() => {
    jest.spyOn(console, 'info').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  it('should remove all images and call next with error', async () => {
    const req = { files: [{ path: '/tmp/a.jpg' }, { path: '/tmp/b.jpg' }] };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    await removeImageOnFailureMiddleware(new Error('fail'), req, res, next);
  expect(fsExtra.remove).toHaveBeenCalledWith('/tmp/a.jpg');
  expect(fsExtra.remove).toHaveBeenCalledWith('/tmp/b.jpg');
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should return 400 if LIMIT_UNEXPECTED_FILE', async () => {
    const req = { files: [{ path: '/tmp/a.jpg' }] };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    const err = { code: 'LIMIT_UNEXPECTED_FILE' };
    await removeImageOnFailureMiddleware(err, req, res, next);
  expect(res.status).toHaveBeenCalledWith(400);
  expect(res.json).toHaveBeenCalledWith({ msg: StatusMessage.EXCEEDS_IMAGE_LIMIT });
  expect(next).toHaveBeenCalled();
  });
});
