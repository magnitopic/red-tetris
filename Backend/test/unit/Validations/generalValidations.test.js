import { isValidUUID } from '../../../src/Validations/generalValidations.js';

describe('isValidUUID', () => {
  it('returns true for valid uuid', () => {
    expect(isValidUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
  });
  it('returns false for invalid uuid', () => {
    expect(isValidUUID('not-a-uuid')).toBe(false);
    expect(isValidUUID('123e4567e89b12d3a456426614174000')).toBe(false);
  });
});
