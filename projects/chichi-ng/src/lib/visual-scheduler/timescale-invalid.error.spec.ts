import { TimescaleInvalid } from './timescale-invalid.error';

describe('TimescaleInvalid', () => {
  it('should create an instance', () => {
    expect(new TimescaleInvalid("")).toBeTruthy();
  });
});
