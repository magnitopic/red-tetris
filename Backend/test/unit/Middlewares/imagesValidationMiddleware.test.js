import { imagesValidationMiddleware } from '../../../src/Middlewares/imagesValidationMiddleware.js';
import StatusMessage from '../../../src/Utils/StatusMessage.js';
import { jest } from '@jest/globals';

describe('imagesValidationMiddleware', () => {
  const next = jest.fn();
  let req, res;
  beforeEach(() => {
    req = { files: [{ originalname: 'test.jpg', mimetype: 'image/jpeg', size: 1000 }] };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next.mockClear();
  });

  it('should call next if all images are valid', () => {
    imagesValidationMiddleware()(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('should return 400 if no files', () => {
    req.files = [];
    imagesValidationMiddleware()(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ msg: StatusMessage.NO_IMAGE_UPLOADED });
  });

  it('should return 400 if invalid extension', () => {
    req.files = [{ originalname: 'test.txt', mimetype: 'image/jpeg', size: 1000 }];
    imagesValidationMiddleware()(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ msg: StatusMessage.INVALID_IMAGE_EXTENSION });
  });

  it('should return 400 if invalid mimetype', () => {
    req.files = [{ originalname: 'test.jpg', mimetype: 'text/plain', size: 1000 }];
    imagesValidationMiddleware()(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ msg: StatusMessage.INVALID_MIME_TYPE });
  });

  it('should return 400 if image size > 5MB', () => {
    req.files = [{ originalname: 'test.jpg', mimetype: 'image/jpeg', size: 6000000 }];
    imagesValidationMiddleware()(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ msg: StatusMessage.INVALID_IMAGE_SIZE });
  });

  it('should return 400 if image size is 0', () => {
    req.files = [{ originalname: 'test.jpg', mimetype: 'image/jpeg', size: 0 }];
    imagesValidationMiddleware()(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ msg: StatusMessage.IMAGE_IS_EMPTY });
  });
});
