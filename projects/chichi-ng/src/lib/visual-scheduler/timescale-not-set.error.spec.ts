import { TimescaleNotSet } from './timescale-not-set.error';

describe('TimescaleNotSet', () => {
  it('should create an instance', () => {
    expect(new TimescaleNotSet('some-text')).toBeTruthy();
  });
});
