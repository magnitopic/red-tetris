import { getTimestampWithTZ } from '../../../src/Utils/timeUtils.js';

describe('timeUtils', () => {
  it('getTimestampWithTZ returns a Date', () => {
    const ts = getTimestampWithTZ();
    expect(ts).toBeInstanceOf(Date);
  });
});
