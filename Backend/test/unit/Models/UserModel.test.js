import { jest } from '@jest/globals';

let userModel;

beforeAll(async () => {
  await jest.unstable_mockModule('../../../src/Utils/dataBaseConnection.js', () => ({
    default: { query: jest.fn() }
  }));
  userModel = (await import('../../../src/Models/UserModel.js')).default;
});

describe('UserModel', () => {
  it('should be an instance of UserModel and Model', () => {
    expect(userModel).toBeDefined();
    expect(userModel.constructor.name).toBe('UserModel');
    expect(Object.getPrototypeOf(userModel).constructor.name).toBe('UserModel');
    expect(userModel.table).toBe('users');
  });

  it('should return true if isUnique returns true', async () => {
    userModel.findOne = jest.fn().mockResolvedValue([]);
    const result = await userModel.isUnique({ username: 'unique' });
    expect(result).toBe(true);
  });

  it('should return false if isUnique returns false', async () => {
    userModel.findOne = jest.fn().mockResolvedValue([ { id: 1 } ]);
    const result = await userModel.isUnique({ username: 'notunique' });
    expect(result).toBe(false);
  });
});
