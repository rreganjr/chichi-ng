import { TimescaleInvalid } from './timescale-invalid.error';
import { TimescaleValidatorErrorCode } from './timescale-validator.util';

describe('TimescaleInvalid', () => {
  it('should create an instance', () => {
    expect(new TimescaleInvalid(TimescaleValidatorErrorCode.BoundsIntervalUndefined, '')).toBeTruthy();
  });
});
