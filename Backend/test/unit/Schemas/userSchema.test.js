import { jest } from '@jest/globals';

// Mock StatusMessage before import
await jest.unstable_mockModule('../../../src/Utils/StatusMessage.js', () => ({
  default: {
    INVALID_PASSWORD: 'Invalid password format.'
  }
}));


const userSchemaModule = await import('../../../src/Schemas/userSchema.js');
const { validateUser, validatePartialUser } = userSchemaModule;

describe('userSchema', () => {
  it('should validate a correct user', async () => {
    const valid = await validateUser({
      username: 'validUser',
      password: 'Valid123!',
      profile_picture_url: 'https://example.com/pic.png',
    });
    expect(valid.success).toBe(true);
  });

  it('should fail for disallowed username', async () => {
    const result = await validateUser({
      username: 'admin',
      password: 'Valid123!',
      profile_picture_url: 'https://example.com/pic.png',
    });
    expect(result.success).toBe(false);
  });

  it('should fail for invalid password', async () => {
    const result = await validateUser({
      username: 'validUser',
      password: 'short',
      profile_picture_url: 'https://example.com/pic.png',
    });
    expect(result.success).toBe(false);
  });

  it('should allow missing profile_picture_url', async () => {
    const result = await validateUser({
      username: 'validUser',
      password: 'Valid123!'
    });
    expect(result.success).toBe(true);
  });

  it('should allow partial validation', async () => {
    const result = await validatePartialUser({
      username: 'validUser'
    });
    expect(result.success).toBe(true);
  });
});
