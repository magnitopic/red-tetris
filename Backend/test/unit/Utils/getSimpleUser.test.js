import { jest } from '@jest/globals';
const OLD_ENV = process.env;

describe('getSimpleUser', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV, API_HOST: 'host', API_PORT: '123', API_VERSION: '1' };
  });
  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('returns simple user with API profile picture', async () => {
    const getSimpleUser = (await import('../../../src/Utils/getSimpleUser.js')).default;
    const user = { id: 1, username: 'u' };
    const result = await getSimpleUser(user);
    expect(result.profile_picture).toContain('/users/1/profile-picture');
  });
});
