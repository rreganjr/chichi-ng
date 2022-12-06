import { Duration, Interval } from 'luxon';
import { TimescaleInvalid } from './timescale-invalid.error';
import { TimescaleValidator, TimescaleValidatorErrorCode } from './timescale-validator.util';

describe('TimescaleValidator', () => {
  it('should throw TimescaleInvalid with TimescaleValidatorErrorCode.BoundsIntervalUndefined when boundsInterval is undefined', () => {
    expect(() => TimescaleValidator.checkBoundsInterval(undefined))
      .toThrowMatching((thrown: TimescaleInvalid) => thrown.validatorCode === TimescaleValidatorErrorCode.BoundsIntervalUndefined);
  });

  it('should throw TimescaleInvalid with TimescaleValidatorErrorCode.BoundsIntervalInvalid when boundsInterval is invalid', () => {
    const start: Date = new Date();
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() + 10 * 60 * 60 * 1000);
    const boundsInterval = Interval.fromDateTimes(end, start);
    expect(() => TimescaleValidator.checkBoundsInterval(boundsInterval))
      .toThrowMatching((thrown: TimescaleInvalid) => thrown.validatorCode === TimescaleValidatorErrorCode.BoundsIntervalInvalid);
  });

  it('should throw TimescaleInvalid with TimescaleValidatorErrorCode.BoundsIntervalZeroDuration when boundsInterval start equals end', () => {
    const start: Date = new Date();
    start.setSeconds(0);
    start.setMilliseconds(0);
    const boundsInterval = Interval.fromDateTimes(start, start);
    expect(() => TimescaleValidator.checkBoundsInterval(boundsInterval))
      .toThrowMatching((thrown: TimescaleInvalid) => thrown.validatorCode === TimescaleValidatorErrorCode.BoundsIntervalZeroDuration);
  });

  it('should throw TimescaleInvalid with TimescaleValidatorErrorCode.OffsetDurationUndefined when offsetDuration is undefined', () => {
    const boundsDurationHours: number = 10;
    const start: Date = new Date();
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() + boundsDurationHours * 60 * 60 * 1000);
    const boundsInterval = Interval.fromDateTimes(start, end);
   expect(() => TimescaleValidator.checkOffsetDuration(boundsInterval, undefined))
      .toThrowMatching((thrown: TimescaleInvalid) => thrown.validatorCode === TimescaleValidatorErrorCode.OffsetDurationUndefined);
  });

  it('should throw TimescaleInvalid with TimescaleValidatorErrorCode.OffsetDurationOutOfBounds when offset is out of bounds', () => {
    const boundsDurationHours: number = 10;
    const start: Date = new Date();
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() + boundsDurationHours * 60 * 60 * 1000);
    const boundsInterval = Interval.fromDateTimes(start, end);
    const offsetDuration = Duration.fromDurationLike({hours: boundsDurationHours}).plus({seconds: 1});
    expect(() => TimescaleValidator.checkOffsetDuration(boundsInterval, offsetDuration))
      .toThrowMatching((thrown: TimescaleInvalid) => thrown.validatorCode === TimescaleValidatorErrorCode.OffsetDurationOutOfBounds);
  });

  it('should throw TimescaleInvalid with TimescaleValidatorErrorCode.OffsetDurationInvalidDuration', () => {
    const start: Date = new Date();
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() + 10 * 60 * 60 * 1000);
    const boundsInterval = Interval.fromDateTimes(start, end);
    const offsetDuration = Duration.fromDurationLike(Interval.fromDateTimes(end, start).toDuration());
    expect(() => TimescaleValidator.checkOffsetDuration(boundsInterval, offsetDuration))
      .toThrowMatching((thrown: TimescaleInvalid) => thrown.validatorCode === TimescaleValidatorErrorCode.OffsetDurationInvalidDuration);
  });

  it('should throw TimescaleInvalid with TimescaleValidatorErrorCode.VisibleDurationUndefined when visibleDuration is undefined', () => {
    const boundsDurationHours: number = 10;
    const start: Date = new Date();
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() + boundsDurationHours * 60 * 60 * 1000);
    const boundsInterval = Interval.fromDateTimes(start, end);
   expect(() => TimescaleValidator.checkVisibleDuration(boundsInterval, undefined))
      .toThrowMatching((thrown: TimescaleInvalid) => thrown.validatorCode === TimescaleValidatorErrorCode.VisibleDurationUndefined);
  });

  it('should throw TimescaleInvalid with TimescaleValidatorErrorCode.VisibleDurationOutOfBounds', () => {
    const boundsDurationHours: number = 10;
    const start: Date = new Date();
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() + boundsDurationHours * 60 * 60 * 1000);
    const boundsInterval = Interval.fromDateTimes(start, end);
    const visibleDuration = Duration.fromDurationLike({hours: boundsDurationHours}).plus({seconds: 1});
    expect(() => TimescaleValidator.checkVisibleDuration(boundsInterval, visibleDuration))
      .toThrowMatching((thrown: TimescaleInvalid) => thrown.validatorCode === TimescaleValidatorErrorCode.VisibleDurationOutOfBounds);
  });

  it('should throw TimescaleInvalid with TimescaleValidatorErrorCode.VisibleDurationInvalidDuration', () => {
    const start: Date = new Date();
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() + 10 * 60 * 60 * 1000);
    const boundsInterval = Interval.fromDateTimes(start, end);
    const visibleDuration = Duration.fromDurationLike(Interval.fromDateTimes(end, start).toDuration());
    expect(() => TimescaleValidator.checkVisibleDuration(boundsInterval, visibleDuration))
      .toThrowMatching((thrown: TimescaleInvalid) => thrown.validatorCode === TimescaleValidatorErrorCode.VisibleDurationInvalidDuration);
  });


  it('should throw TimescaleInvalid with TimescaleValidatorErrorCode.OffsetDurationPlusVisibleDurationOutOfBounds', () => {
    const boundsDurationHours: number = 10;
    const start: Date = new Date();
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() + boundsDurationHours * 60 * 60 * 1000);
    const boundsInterval = Interval.fromDateTimes(start, end);
    const offsetDuration = Duration.fromDurationLike({hours: boundsDurationHours}).plus({seconds: -1});
    const visibleDuration = Duration.fromDurationLike({hours: boundsDurationHours}).plus({seconds: -1});
    expect(() => TimescaleValidator.checkVisibleDurationWithOffsetDurationToBounds(boundsInterval, visibleDuration, offsetDuration))
      .toThrowMatching((thrown: TimescaleInvalid) => thrown.validatorCode === TimescaleValidatorErrorCode.OffsetDurationPlusVisibleDurationOutOfBounds);
  });
});
