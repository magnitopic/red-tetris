import { jest } from '@jest/globals';

await jest.unstable_mockModule('../../../src/Models/UserModel.js', () => ({
  default: {
    getById: jest.fn(),
    update: jest.fn(),
    findOne: jest.fn()
  }
}));
await jest.unstable_mockModule('../../../src/Utils/StatusMessage.js', () => ({
  default: {
    INTERNAL_SERVER_ERROR: 'err',
    USER_NOT_FOUND: 'notfound',
    ACC_CONFIRMATION_REQUIRED: 'confirm',
    SAME_PASSWORD: 'same',
    WRONG_PASSWORD: 'wrong',
    RESET_PASS_TOKEN_USED: 'used',
    CANNOT_LOGIN_WITH_PASS: 'nopass',
    WRONG_USERNAME: 'nouser',
    ACC_ALREADY_CONFIRMED: 'already'
  }
}));
await jest.unstable_mockModule('../../../src/Utils/errorUtils.js', () => ({
  returnErrorStatus: jest.fn(() => 'error')
}));
await jest.unstable_mockModule('bcryptjs', () => ({ default: { compare: jest.fn() } }));

const { passwordValidations } = await import('../../../src/Validations/authValidations.js');

describe('loginValidations', () => {
  let userModel, StatusMessage, bcrypt;
  beforeEach(async () => {
    userModel = (await import('../../../src/Models/UserModel.js')).default;
    StatusMessage = (await import('../../../src/Utils/StatusMessage.js')).default;
    bcrypt = (await import('bcryptjs')).default;
  });

  it('returns error if validation fails', async () => {
    await jest.unstable_mockModule('../../../src/Schemas/userSchema.js', () => ({
      validatePartialUser: jest.fn().mockResolvedValue({ success: false, error: { errors: [{ message: 'nouser' }] } })
    }));
    const { loginValidations } = await import('../../../src/Validations/authValidations.js');
    userModel.findOne.mockResolvedValue([]);
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const result = await loginValidations({}, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ msg: 'nouser' });
    expect(result).toBeUndefined();
  });

  it('returns error if user not found', async () => {
    await jest.unstable_mockModule('../../../src/Schemas/userSchema.js', () => ({
      validatePartialUser: jest.fn().mockResolvedValue({ success: true, data: { username: 'validuser', password: 'validpass' } })
    }));
    const { loginValidations } = await import('../../../src/Validations/authValidations.js');
    userModel.findOne.mockResolvedValue([]);
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const result = await loginValidations({ username: 'validuser', password: 'validpass' }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Invalid' });
    expect(result).toBeUndefined();
  });

  it('returns error if user has no password', async () => {
    await jest.unstable_mockModule('../../../src/Schemas/userSchema.js', () => ({
      validatePartialUser: jest.fn().mockResolvedValue({ success: true, data: { username: 'validuser', password: 'validpass' } })
    }));
    const { loginValidations } = await import('../../../src/Validations/authValidations.js');
    userModel.findOne.mockResolvedValue([{ password: undefined }]);
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const result = await loginValidations({ username: 'validuser', password: 'validpass' }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Invalid' });
    expect(result).toBeUndefined();
  });

  it('returns error if password is invalid', async () => {
    await jest.unstable_mockModule('../../../src/Schemas/userSchema.js', () => ({
      validatePartialUser: jest.fn().mockResolvedValue({ success: true, data: { username: 'validuser', password: 'validpass' } })
    }));
    const { loginValidations } = await import('../../../src/Validations/authValidations.js');
    userModel.findOne.mockResolvedValue([{ password: 'hash' }]);
    bcrypt.compare.mockResolvedValueOnce(false);
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const result = await loginValidations({ username: 'validuser', password: 'validpass' }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Invalid' });
    expect(result).toBeUndefined();
  });

  it('returns user if valid', async () => {
    await jest.unstable_mockModule('../../../src/Schemas/userSchema.js', () => ({
      validatePartialUser: jest.fn().mockResolvedValue({ success: true, data: { username: 'validuser', password: 'validpass' } })
    }));
    const { loginValidations } = await import('../../../src/Validations/authValidations.js');
    userModel.findOne.mockResolvedValue([{ password: 'hash' }]);
    bcrypt.compare.mockResolvedValueOnce(true);
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const result = await loginValidations({ username: 'validuser', password: 'validpass' }, res);
    expect(result).toBeUndefined();
  });
});

describe('confirmAccountValidations', () => {
  it('returns error if user not found', async () => {
    const { confirmAccountValidations } = await import('../../../src/Validations/authValidations.js');
    const userModel = (await import('../../../src/Models/UserModel.js')).default;
    userModel.getById.mockResolvedValue(null);
    const res = {};
    const result = await confirmAccountValidations(res, { id: 1 });
    expect(result).toBe('error');
  });

  it('returns error if user array empty', async () => {
    const { confirmAccountValidations } = await import('../../../src/Validations/authValidations.js');
    const userModel = (await import('../../../src/Models/UserModel.js')).default;
    userModel.getById.mockResolvedValue([]);
    const res = {};
    const result = await confirmAccountValidations(res, { id: 1 });
    expect(result).toBe('error');
  });

  it('returns error if already confirmed', async () => {
    const { confirmAccountValidations } = await import('../../../src/Validations/authValidations.js');
    const userModel = (await import('../../../src/Models/UserModel.js')).default;
    userModel.getById.mockResolvedValue({ active_account: true });
    const res = {};
    const result = await confirmAccountValidations(res, { id: 1 });
    expect(result).toBe('error');
  });

  it('returns true if not confirmed and user exists', async () => {
    const { confirmAccountValidations } = await import('../../../src/Validations/authValidations.js');
    const userModel = (await import('../../../src/Models/UserModel.js')).default;
    userModel.getById.mockResolvedValue({ active_account: false });
    const res = {};
    const result = await confirmAccountValidations(res, { id: 1 });
    expect(result).toBe(true);
  });
});

describe('passwordValidations', () => {
  it('returns error if user not found', async () => {
    const userModel = (await import('../../../src/Models/UserModel.js')).default;
    userModel.getById.mockResolvedValue(null);
    const res = {};
    const result = await passwordValidations({ res, id: 1 });
    expect(result).toBe('error');
  });

  it('returns error if user array empty', async () => {
    const userModel = (await import('../../../src/Models/UserModel.js')).default;
    userModel.getById.mockResolvedValue([]);
    const res = {};
    const result = await passwordValidations({ res, id: 1 });
    expect(result).toBe('error');
  });

  it('returns error if account not active', async () => {
    const userModel = (await import('../../../src/Models/UserModel.js')).default;
    userModel.getById.mockResolvedValue({ active_account: false });
    const res = {};
    const result = await passwordValidations({ res, id: 1 });
    expect(result).toBe('error');
  });

  it('returns error if same password', async () => {
    const userModel = (await import('../../../src/Models/UserModel.js')).default;
    userModel.getById.mockResolvedValue({ active_account: true, password: 'hash' });
    const bcrypt = (await import('bcryptjs')).default;
    bcrypt.compare.mockResolvedValueOnce(true);
    const res = {};
    const result = await passwordValidations({ res, id: 1, newPassword: 'p' });
    expect(result).toBe('error');
  });

  it('returns error if old password invalid', async () => {
    const userModel = (await import('../../../src/Models/UserModel.js')).default;
    userModel.getById.mockResolvedValue({ active_account: true, password: 'hash' });
    const bcrypt = (await import('bcryptjs')).default;
    bcrypt.compare.mockResolvedValueOnce(false).mockResolvedValueOnce(false);
    const res = {};
    const result = await passwordValidations({ res, id: 1, newPassword: 'p', oldPassword: 'old' });
    expect(result).toBe('error');
  });

  it('returns error if reset_pass_token used', async () => {
    const userModel = (await import('../../../src/Models/UserModel.js')).default;
    userModel.getById.mockResolvedValue({ active_account: true, password: 'hash', reset_pass_token: null });
    const bcrypt = (await import('bcryptjs')).default;
    bcrypt.compare.mockResolvedValueOnce(false);
    const res = {};
    const result = await passwordValidations({ res, id: 1, newPassword: 'p' });
    expect(result).toBe('error');
  });

  it('returns true if all valid', async () => {
    const userModel = (await import('../../../src/Models/UserModel.js')).default;
    userModel.getById.mockResolvedValue({ active_account: true, password: 'hash', reset_pass_token: 'token' });
    userModel.update.mockResolvedValue({ length: 1 });
    const bcrypt = (await import('bcryptjs')).default;
    bcrypt.compare.mockResolvedValueOnce(false);
    const errorUtils = await import('../../../src/Utils/errorUtils.js');
    errorUtils.returnErrorStatus.mockImplementationOnce(() => undefined);
    const res = {};
    const result = await passwordValidations({ res, id: 1, newPassword: 'p', token: 'token' });
    expect(result).toBe(true);
  });
});
