import StatusMessage from '../../../src/Utils/StatusMessage.js';

describe('StatusMessage', () => {
  it('should have static properties', () => {
    expect(StatusMessage.INTERNAL_SERVER_ERROR).toBeDefined();
    expect(StatusMessage.INVALID_PASSWORD).toBeDefined();
    expect(StatusMessage.USER_NOT_FOUND).toBeDefined();
  });
});
