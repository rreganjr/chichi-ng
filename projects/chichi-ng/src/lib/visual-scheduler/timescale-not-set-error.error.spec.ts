import { TimescaleNotSetError } from './timescale-not-set-error.error';

describe('TimescaleNotSetError', () => {
  it('should create an instance', () => {
    expect(new TimescaleNotSetError()).toBeTruthy();
  });
});
