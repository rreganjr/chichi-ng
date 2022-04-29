import { TimescaleInvalid } from './timescale-invalid.error';
import { TimescaleValidatorErrorCode } from './timescale.model';

describe('TimescaleInvalid', () => {
  it('should create an instance', () => {
    expect(new TimescaleInvalid(TimescaleValidatorErrorCode.BoundsIntervalUndefined, '')).toBeTruthy();
  });
});
