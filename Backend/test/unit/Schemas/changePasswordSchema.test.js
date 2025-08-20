import { jest } from '@jest/globals';

// Mock StatusMessage before import
await jest.unstable_mockModule('../../../src/Utils/StatusMessage.js', () => ({
  default: {
    INVALID_PASSWORD: 'Invalid password format.'
  }
}));

const schemaModule = await import('../../../src/Schemas/changePasswordSchema.js');
const { validatePasswords, validatePartialPasswords } = schemaModule;

describe('changePasswordSchema', () => {
  it('should validate correct passwords', async () => {
    const result = await validatePasswords({
      old_password: 'OldPass123!',
      new_password: 'NewPass123!'
    });
    expect(result.success).toBe(true);
  });

  it('should fail for missing old_password', async () => {
    const result = await validatePasswords({
      new_password: 'NewPass123!'
    });
    expect(result.success).toBe(false);
  });

  it('should fail for invalid new_password', async () => {
    const result = await validatePasswords({
      old_password: 'OldPass123!',
      new_password: 'short'
    });
    expect(result.success).toBe(false);
  });

  it('should allow partial validation', async () => {
    const result = await validatePartialPasswords({
      new_password: 'NewPass123!'
    });
    expect(result.success).toBe(true);
  });
});
