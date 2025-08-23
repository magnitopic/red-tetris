import { jest } from '@jest/globals';
const OLD_ENV = process.env;

describe('getPublicUser', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV, API_HOST: 'host', API_PORT: '123', API_VERSION: '1' };
  });
  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('returns user with url profile picture', async () => {
    const getPublicUser = (await import('../../../src/Utils/getPublicUser.js')).default;
    const user = { id: 1, username: 'u', profile_picture_is_url: true, profile_picture: 'url' };
    const result = await getPublicUser(user);
    expect(result.profile_picture).toBe('url');
  });

  it('returns user with API profile picture', async () => {
    const getPublicUser = (await import('../../../src/Utils/getPublicUser.js')).default;
    const user = { id: 1, username: 'u', profile_picture_is_url: false };
    const result = await getPublicUser(user);
    expect(result.profile_picture).toContain('/users/1/profile-picture');
  });
});
