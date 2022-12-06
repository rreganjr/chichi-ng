import { DateTime, Duration, Interval } from 'luxon';
import { TimescaleInvalid } from './timescale-invalid.error';
import { Timescale } from './timescale.model';
import { TimescaleValidatorErrorCode } from './timescale-validator.util';

describe('Timescale', () => {
  it('should create an instance using default visibleDuration and offsetDuration', () => {
    const start: Date = new Date();
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() +  24 * 60 * 60 * 1000);
    const boundsInterval = Interval.fromDateTimes(start, end);

    const timescale = new Timescale(boundsInterval);
    expect(timescale).toBeTruthy();
    expect(timescale.boundsInterval).toEqual(boundsInterval);
    expect(timescale.visibleDuration).toEqual(Timescale.DEFAULT_VISIBLE_DURATION);
    expect(timescale.offsetDuration).toEqual(Timescale.DEFAULT_OFFSET_DURATION);
  });

  it('should create an instance with specific visibleDuration and offsetDuration', () => {
    const start: Date = new Date();
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() +  24 * 60 * 60 * 1000);
    const boundsInterval = Interval.fromDateTimes(start, end);

    const timescale = new Timescale(boundsInterval, boundsInterval.toDuration(), Duration.fromDurationLike({hours: 0}));
    expect(timescale).toBeTruthy();
    expect(timescale.boundsInterval).toEqual(boundsInterval);
    expect(timescale.visibleDuration).toEqual(boundsInterval.toDuration());
    expect(timescale.offsetDuration).toEqual(Duration.fromDurationLike({hours: 0}));
  });

  it('should throw TimescaleInvalid with TimescaleValidatorErrorCode.BoundsIntervalUndefined', () => {
    // cast is to bypass Typescript static checking to make boundsInterval invalid
    expect(() => new Timescale(((undefined as unknown) as Interval)))
      .toThrowMatching((thrown: TimescaleInvalid) => thrown.validatorCode === TimescaleValidatorErrorCode.BoundsIntervalUndefined);
  });

  it('should throw TimescaleInvalid with TimescaleValidatorErrorCode.BoundsIntervalZeroDuration', () => {
    const start: Date = new Date();
    expect(() => new Timescale(Interval.fromDateTimes(start, start)))
      .toThrowMatching((thrown: TimescaleInvalid) => thrown.validatorCode === TimescaleValidatorErrorCode.BoundsIntervalZeroDuration);
  });

  it('should throw TimescaleInvalid with TimescaleValidatorErrorCode.BoundsIntervalInvalid', () => {
    const start: Date = new Date();
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() + 10 * 60 * 60 * 1000);
    const boundsInterval = Interval.fromDateTimes(end, start);
    expect(() => new Timescale(boundsInterval))
      .toThrowMatching((thrown: TimescaleInvalid) => thrown.validatorCode === TimescaleValidatorErrorCode.BoundsIntervalInvalid);
  });

  it('should throw TimescaleInvalid with TimescaleValidatorErrorCode.OffsetDurationOutOfBounds', () => {
    const boundsDurationHours: number = 10;
    const start: Date = new Date();
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() + boundsDurationHours * 60 * 60 * 1000);
    const boundsInterval = Interval.fromDateTimes(start, end);
    const visibleDuration = Duration.fromDurationLike({hours: 1});
    const offsetDuration = Duration.fromDurationLike({hours: boundsDurationHours}).plus({seconds: 1});
    expect(() => new Timescale(boundsInterval, visibleDuration, offsetDuration))
      .toThrowMatching((thrown: TimescaleInvalid) => thrown.validatorCode === TimescaleValidatorErrorCode.OffsetDurationOutOfBounds);
  });

  it('should throw TimescaleInvalid with TimescaleValidatorErrorCode.OffsetDurationInvalidDuration', () => {
    const boundsDurationHours: number = 10;
    const start: Date = new Date();
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() + 10 * 60 * 60 * 1000);
    const boundsInterval = Interval.fromDateTimes(start, end);
    const visibleDuration = Duration.fromDurationLike({hours: boundsDurationHours}).plus({seconds: -1});
    const offsetDuration = Duration.fromDurationLike(Interval.fromDateTimes(end, start).toDuration());
    expect(() => new Timescale(boundsInterval, visibleDuration, offsetDuration))
      .toThrowMatching((thrown: TimescaleInvalid) => thrown.validatorCode === TimescaleValidatorErrorCode.OffsetDurationInvalidDuration);
  });

  it('should throw TimescaleInvalid with TimescaleValidatorErrorCode.VisibleDurationOutOfBounds', () => {
    const boundsDurationHours: number = 10;
    const start: Date = new Date();
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() + boundsDurationHours * 60 * 60 * 1000);
    const boundsInterval = Interval.fromDateTimes(start, end);
    const visibleDuration = Duration.fromDurationLike({hours: boundsDurationHours}).plus({seconds: 1});
    const offsetDuration = Duration.fromDurationLike({hours: 1});
    expect(() => new Timescale(boundsInterval, visibleDuration, offsetDuration))
      .toThrowMatching((thrown: TimescaleInvalid) => thrown.validatorCode === TimescaleValidatorErrorCode.VisibleDurationOutOfBounds);
  });

  it('should throw TimescaleInvalid with TimescaleValidatorErrorCode.VisibleDurationInvalidDuration', () => {
    const start: Date = new Date();
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() + 10 * 60 * 60 * 1000);
    const boundsInterval = Interval.fromDateTimes(start, end);
    const offsetDuration = Duration.fromDurationLike({hours: 1});
    const visibleDuration = Duration.fromDurationLike(Interval.fromDateTimes(end, start).toDuration());
    expect(() => new Timescale(boundsInterval, visibleDuration, offsetDuration))
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
    expect(() => new Timescale(boundsInterval, visibleDuration, offsetDuration))
      .toThrowMatching((thrown: TimescaleInvalid) => thrown.validatorCode === TimescaleValidatorErrorCode.OffsetDurationPlusVisibleDurationOutOfBounds);
  });

  it('should be out of bounds when the supplied date is less than the boundsInterval start', () => {
    const start: Date = new Date();
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() +  24 * 60 * 60 * 1000);
    const boundsInterval = Interval.fromDateTimes(start, end);

    const timescale = new Timescale(boundsInterval);
    expect(timescale.isOutOfBounds(DateTime.fromJSDate(new Date(start.getTime() - 1)))).toBeTrue();
  });

  it('should not be out of bounds when the supplied date equals the boundsInterval start ', () => {
    const start: Date = new Date();
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() +  24 * 60 * 60 * 1000);
    const boundsInterval = Interval.fromDateTimes(start, end);

    const timescale = new Timescale(boundsInterval);
    expect(timescale.isOutOfBounds(boundsInterval.start)).toBeFalse();
  });

  it('should not be out of bounds when the supplied date is less than the boundsInterval end', () => {
    const start: Date = new Date();
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() +  24 * 60 * 60 * 1000);
    const boundsInterval = Interval.fromDateTimes(start, end);

    const timescale = new Timescale(boundsInterval);
    expect(timescale.isOutOfBounds(DateTime.fromJSDate(new Date(end.getTime() - 1)))).toBeFalse();
  });

  it('should be out of bounds when the supplied date is equal to the boundsInterval end', () => {
    const start: Date = new Date();
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() +  24 * 60 * 60 * 1000);
    const boundsInterval = Interval.fromDateTimes(start, end);

    const timescale = new Timescale(boundsInterval);
    expect(timescale.isOutOfBounds(boundsInterval.end)).toBeTrue();
  });

  it('the primary date time unit should be Timescale.HOUR_DATETIME_UNIT when the visible duration is less than or equal to Timescale.MAX_VISIBLE_HOURS_FOR_HOUR_BASED_PRIMARY_DATE_TIME_UNIT ', () => {
    const start: Date = new Date();
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() + 10 * 24 * 60 * 60 * 1000);
    const boundsInterval = Interval.fromDateTimes(start, end);
    let timescale: Timescale;

    timescale = new Timescale(boundsInterval, Duration.fromDurationLike({seconds: 1}));
    expect(Timescale.HOUR_DATETIME_UNIT === timescale.primaryDateTimeUnit).toBeTrue();

    timescale = new Timescale(boundsInterval, Timescale.MAX_VISIBLE_DURATION_FOR_HOUR_BASED_PRIMARY_DATE_TIME_UNIT);
    expect(Timescale.HOUR_DATETIME_UNIT === timescale.primaryDateTimeUnit).toBeTrue();
  });

  it('the primary date time unit should be Timescale.DAY_DATETIME_UNIT when the visible duration is greater than Timescale.MAX_VISIBLE_HOURS_FOR_HOUR_BASED_PRIMARY_DATE_TIME_UNIT', () => {
    const start: Date = new Date();
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() + 10 * 24 * 60 * 60 * 1000);
    const boundsInterval = Interval.fromDateTimes(start, end);
    const moreThanMax: Duration = Timescale.MAX_VISIBLE_DURATION_FOR_HOUR_BASED_PRIMARY_DATE_TIME_UNIT.plus(Duration.fromDurationLike({seconds: 1}));
    let timescale: Timescale = new Timescale(boundsInterval, moreThanMax);
    expect(Timescale.DAY_DATETIME_UNIT === timescale.primaryDateTimeUnit).toBeTrue();
  });

  it('the start of the visible Time line should be the start of the Timescale.HOUR_DATETIME_UNIT of the start of the visibleBounds when the visible duration is less than or equal to Timescale.MAX_VISIBLE_HOURS_FOR_HOUR_BASED_PRIMARY_DATE_TIME_UNIT', () => {
    const start: Date = new Date();
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() + 10 * 24 * 60 * 60 * 1000);
    const boundsInterval = Interval.fromDateTimes(start, end);
    let timescale: Timescale;

    timescale = new Timescale(boundsInterval, Duration.fromDurationLike({seconds: 1}));
    expect(Timescale.HOUR_DATETIME_UNIT === timescale.primaryDateTimeUnit).toBeTrue();
    expect(timescale.startOfVisibleTimeline).toEqual(boundsInterval.start.startOf(Timescale.HOUR_DATETIME_UNIT));

    timescale = new Timescale(boundsInterval, Timescale.MAX_VISIBLE_DURATION_FOR_HOUR_BASED_PRIMARY_DATE_TIME_UNIT);
    expect(timescale.startOfVisibleTimeline).toEqual(boundsInterval.start.startOf(Timescale.HOUR_DATETIME_UNIT));
  });

  it('the start of the visible Time line should be the start of the Timescale.DAY_DATETIME_UNIT when the visible duration is greater than Timescale.MAX_VISIBLE_HOURS_FOR_HOUR_BASED_PRIMARY_DATE_TIME_UNIT', () => {
    const start: Date = new Date();
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() + 10 * 24 * 60 * 60 * 1000);
    const boundsInterval = Interval.fromDateTimes(start, end);
    const moreThanMax: Duration = Timescale.MAX_VISIBLE_DURATION_FOR_HOUR_BASED_PRIMARY_DATE_TIME_UNIT.plus(Duration.fromDurationLike({seconds: 1}));
    let timescale: Timescale = new Timescale(boundsInterval, moreThanMax);
    expect(timescale.startOfVisibleTimeline).toEqual(boundsInterval.start.startOf(Timescale.DAY_DATETIME_UNIT));
  });

  it('the end of the visible Time line should be the start of the next Timescale.HOUR_DATETIME_UNIT of the end of the visibleBounds when the visible duration is less than or equal to Timescale.MAX_VISIBLE_HOURS_FOR_HOUR_BASED_PRIMARY_DATE_TIME_UNIT', () => {
    const start: Date = new Date();
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() + 10 * 24 * 60 * 60 * 1000);
    const boundsInterval = Interval.fromDateTimes(start, end);
    let timescale: Timescale;

    timescale = new Timescale(boundsInterval, Duration.fromDurationLike({seconds: 1}));
    expect(timescale.endOfVisibleTimeline).toEqual(boundsInterval.start.plus(timescale.offsetDuration).plus(timescale.visibleDuration).plus({hours: 1}).startOf(Timescale.HOUR_DATETIME_UNIT));

    timescale = new Timescale(boundsInterval, Timescale.MAX_VISIBLE_DURATION_FOR_HOUR_BASED_PRIMARY_DATE_TIME_UNIT);
    expect(timescale.endOfVisibleTimeline).toEqual(boundsInterval.start.plus(timescale.offsetDuration).plus(timescale.visibleDuration).plus({hours: 1}).startOf(Timescale.HOUR_DATETIME_UNIT));
  });

  it('the end of the visible Time line should be the start of the Timescale.DAY_DATETIME_UNIT when the visible duration is greater than Timescale.MAX_VISIBLE_HOURS_FOR_HOUR_BASED_PRIMARY_DATE_TIME_UNIT', () => {
    const start: Date = new Date();
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() + 10 * 24 * 60 * 60 * 1000);
    const boundsInterval = Interval.fromDateTimes(start, end);
    const moreThanMax: Duration = Timescale.MAX_VISIBLE_DURATION_FOR_HOUR_BASED_PRIMARY_DATE_TIME_UNIT.plus(Duration.fromDurationLike({seconds: 1}));
    let timescale: Timescale = new Timescale(boundsInterval, moreThanMax);
    expect(timescale.endOfVisibleTimeline).toEqual(boundsInterval.start.plus(timescale.offsetDuration).plus(timescale.visibleDuration).plus({days: 1}).startOf(Timescale.DAY_DATETIME_UNIT));
  });

  it('the bounds of the visibly schedulable time starts at the bounds start plus the offset duration and ends at the bounds start plus the offset duration plus the visible duration', () => {
    const start: Date = new Date();
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() + 10 * 24 * 60 * 60 * 1000);
    const boundsInterval = Interval.fromDateTimes(start, end);
    const visibleDuration = Duration.fromDurationLike({hours: 3});
    const offsetDuration = Duration.fromDurationLike({hours: 9});
    let timescale: Timescale = new Timescale(boundsInterval, visibleDuration, offsetDuration);
    expect(timescale.visibleBounds).toEqual(Interval.fromDateTimes(boundsInterval.start.plus(offsetDuration), boundsInterval.start.plus(offsetDuration).plus(visibleDuration)));
  });

  it('the timeline should start on the hour for visibleDuration of 1 second', () => {
    const start: Date = new Date();
    start.setMinutes(15);
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() + 10 * 24 * 60 * 60 * 1000);
    const boundsInterval = Interval.fromDateTimes(start, end);
    const visibleDuration = Duration.fromDurationLike({seconds: 1});
    const offsetDuration = Duration.fromDurationLike({hours: 0});
    let timescale: Timescale = new Timescale(boundsInterval, visibleDuration, offsetDuration);

    expect(timescale.startOfVisibleTimeline).toEqual(DateTime.fromJSDate(start).startOf(Timescale.HOUR_DATETIME_UNIT));
  });

  it('the timeline should start on the hour for visibleDuration of Timescale.MAX_VISIBLE_DURATION_FOR_HOUR_BASED_PRIMARY_DATE_TIME_UNIT', () => {
    const start: Date = new Date();
    start.setMinutes(15);
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() + 10 * 24 * 60 * 60 * 1000);
    const boundsInterval = Interval.fromDateTimes(start, end);
    const visibleDuration = Duration.fromDurationLike({seconds: 1});
    const offsetDuration = Duration.fromDurationLike({hours: 0});
    let timescale: Timescale = new Timescale(boundsInterval, visibleDuration, offsetDuration);

    expect(timescale.startOfVisibleTimeline).toEqual(DateTime.fromJSDate(start).startOf(Timescale.HOUR_DATETIME_UNIT));
  });

  it('the timeline should start on the day for visibleDuration of Timescale.MAX_VISIBLE_DURATION_FOR_HOUR_BASED_PRIMARY_DATE_TIME_UNIT + 1 second', () => {
    const start: Date = new Date();
    start.setMinutes(15);
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() + 10 * 24 * 60 * 60 * 1000);
    const boundsInterval = Interval.fromDateTimes(start, end);
    const visibleDuration = Timescale.MAX_VISIBLE_DURATION_FOR_HOUR_BASED_PRIMARY_DATE_TIME_UNIT.plus({seconds: 1});
    const offsetDuration = Duration.fromDurationLike({hours: 0});
    let timescale: Timescale = new Timescale(boundsInterval, visibleDuration, offsetDuration);

    expect(timescale.startOfVisibleTimeline).toEqual(DateTime.fromJSDate(start).startOf(Timescale.DAY_DATETIME_UNIT));
  });

  it('the timeline should end on the next hour for visibleDuration of 1 second', () => {
    const start: Date = new Date();
    start.setMinutes(15);
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() + 10 * 24 * 60 * 60 * 1000);
    const boundsInterval = Interval.fromDateTimes(start, end);
    const visibleDuration = Duration.fromDurationLike({seconds: 1});
    const offsetDuration = boundsInterval.toDuration().minus({seconds: 1});
    let timescale: Timescale = new Timescale(boundsInterval, visibleDuration, offsetDuration);

    expect(timescale.endOfVisibleTimeline).toEqual(DateTime.fromJSDate(end).plus({hours: 1}).startOf(Timescale.HOUR_DATETIME_UNIT));
  });

  it('the timeline should end on the hour for visibleDuration of Timescale.MAX_VISIBLE_DURATION_FOR_HOUR_BASED_PRIMARY_DATE_TIME_UNIT', () => {
    const start: Date = new Date();
    start.setMinutes(15);
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() + 10 * 24 * 60 * 60 * 1000);
    const boundsInterval = Interval.fromDateTimes(start, end);
    const visibleDuration = Timescale.MAX_VISIBLE_DURATION_FOR_HOUR_BASED_PRIMARY_DATE_TIME_UNIT;
    const offsetDuration = boundsInterval.toDuration().minus(visibleDuration);
    let timescale: Timescale = new Timescale(boundsInterval, visibleDuration, offsetDuration);

    expect(timescale.endOfVisibleTimeline).toEqual(DateTime.fromJSDate(end).plus({hours: 1}).startOf(Timescale.HOUR_DATETIME_UNIT));
  });

  it('the timeline should end on the day for visibleDuration of Timescale.MAX_VISIBLE_DURATION_FOR_HOUR_BASED_PRIMARY_DATE_TIME_UNIT + 1 second', () => {
    const start: Date = new Date();
    start.setMinutes(15);
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() + 10 * 24 * 60 * 60 * 1000);
    const boundsInterval = Interval.fromDateTimes(start, end);
    const visibleDuration = Timescale.MAX_VISIBLE_DURATION_FOR_HOUR_BASED_PRIMARY_DATE_TIME_UNIT.plus({seconds: 1});
    const offsetDuration = boundsInterval.toDuration().minus(visibleDuration);
    let timescale: Timescale = new Timescale(boundsInterval, visibleDuration, offsetDuration);

    expect(timescale.endOfVisibleTimeline).toEqual(DateTime.fromJSDate(end).plus({days: 1}).startOf(Timescale.DAY_DATETIME_UNIT));
  });

  it('the outOfBoundsStartInterval should start on the hour for visibleDuration of 1 second and end at the boundsInterval start', () => {
    const start: Date = new Date();
    start.setMinutes(15);
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() + 10 * 24 * 60 * 60 * 1000);
    const boundsInterval = Interval.fromDateTimes(start, end);
    const visibleDuration = Duration.fromDurationLike({seconds: 1});
    const offsetDuration = Duration.fromDurationLike({hours: 0});
    let timescale: Timescale = new Timescale(boundsInterval, visibleDuration, offsetDuration);

    expect(timescale.outOfBoundsStartInterval).toEqual(Interval.fromDateTimes(DateTime.fromJSDate(start).startOf(Timescale.HOUR_DATETIME_UNIT), boundsInterval.start));
  });

  it('the outOfBoundsStartInterval should start on the hour for visibleDuration of Timescale.MAX_VISIBLE_DURATION_FOR_HOUR_BASED_PRIMARY_DATE_TIME_UNIT and end at the boundsInterval start', () => {
    const start: Date = new Date();
    start.setMinutes(15);
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() + 10 * 24 * 60 * 60 * 1000);
    const boundsInterval = Interval.fromDateTimes(start, end);
    const visibleDuration = Timescale.MAX_VISIBLE_DURATION_FOR_HOUR_BASED_PRIMARY_DATE_TIME_UNIT;
    const offsetDuration = Duration.fromDurationLike({hours: 0});
    let timescale: Timescale = new Timescale(boundsInterval, visibleDuration, offsetDuration);

    expect(timescale.outOfBoundsStartInterval).toEqual(Interval.fromDateTimes(DateTime.fromJSDate(start).startOf(Timescale.HOUR_DATETIME_UNIT), boundsInterval.start));
  });

  it('the outOfBoundsStartInterval should start on the day for visibleDuration of Timescale.MAX_VISIBLE_DURATION_FOR_HOUR_BASED_PRIMARY_DATE_TIME_UNIT + 1 second and end at the boundsInterval start', () => {
    const start: Date = new Date();
    start.setMinutes(15);
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() + 10 * 24 * 60 * 60 * 1000);
    const boundsInterval = Interval.fromDateTimes(start, end);
    const visibleDuration = Timescale.MAX_VISIBLE_DURATION_FOR_HOUR_BASED_PRIMARY_DATE_TIME_UNIT.plus({seconds: 1});
    const offsetDuration = Duration.fromDurationLike({hours: 0});
    let timescale: Timescale = new Timescale(boundsInterval, visibleDuration, offsetDuration);

    expect(timescale.outOfBoundsStartInterval).toEqual(Interval.fromDateTimes(DateTime.fromJSDate(start).startOf(Timescale.DAY_DATETIME_UNIT), boundsInterval.start));
  });
  it('the outOfBoundsStartDuration should be the duration of the outOfBoundsStartInterval for visibleDuration of 1 second it should start at the hour before the bounds start.', () => {
    const testDurationMinutes: number = 15;
    const start: Date = new Date();
    start.setMinutes(testDurationMinutes);
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() + 10 * 24 * 60 * 60 * 1000);
    const boundsInterval = Interval.fromDateTimes(start, end);
    const visibleDuration = Duration.fromDurationLike({seconds: 1});
    const offsetDuration = Duration.fromDurationLike({hours: 0});
    let timescale: Timescale = new Timescale(boundsInterval, visibleDuration, offsetDuration);

    // important!! compare as seconds because a Duration of 60 seconds <> a Duration of 1 minute
    expect(timescale.outOfBoundsStartDurationSeconds.as('seconds')).toEqual(Duration.fromDurationLike({minutes: testDurationMinutes}).as('seconds'));
  });

  it('the outOfBoundsStartDuration should be the duration of the outOfBoundsStartInterval for visibleDuration of Timescale.MAX_VISIBLE_DURATION_FOR_HOUR_BASED_PRIMARY_DATE_TIME_UNIT it should start at the hour before the bounds start.', () => {
    const testDurationMinutes: number = 15;
    const start: Date = new Date();
    start.setMinutes(testDurationMinutes);
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() + 10 * 24 * 60 * 60 * 1000);
    const boundsInterval = Interval.fromDateTimes(start, end);
    const visibleDuration = Timescale.MAX_VISIBLE_DURATION_FOR_HOUR_BASED_PRIMARY_DATE_TIME_UNIT;
    const offsetDuration = Duration.fromDurationLike({hours: 0});
    let timescale: Timescale = new Timescale(boundsInterval, visibleDuration, offsetDuration);

    // important!! compare as seconds because a Duration of 60 seconds <> a Duration of 1 minute
    expect(timescale.outOfBoundsStartDurationSeconds.as('seconds')).toEqual(Duration.fromDurationLike({minutes: testDurationMinutes}).as('seconds'));
  });

  it('the outOfBoundsStartDuration should be the duration of the outOfBoundsStartInterval for visibleDuration of Timescale.MAX_VISIBLE_DURATION_FOR_HOUR_BASED_PRIMARY_DATE_TIME_UNIT + 1 second it should start at the start of the day before the bounds start.', () => {
    const testHours: number = 2;
    const testMinutes: number = 15;
    const start: Date = new Date();
    start.setHours(testHours);
    start.setMinutes(testMinutes);
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() + 10 * 24 * 60 * 60 * 1000);
    const boundsInterval = Interval.fromDateTimes(start, end);
    const visibleDuration = Timescale.MAX_VISIBLE_DURATION_FOR_HOUR_BASED_PRIMARY_DATE_TIME_UNIT.plus(Duration.fromDurationLike({seconds: 1}));
    const offsetDuration = Duration.fromDurationLike({hours: 0});
    let timescale: Timescale = new Timescale(boundsInterval, visibleDuration, offsetDuration);

    // important!! compare as seconds because a Duration of 60 seconds <> a Duration of 1 minute
    expect(timescale.outOfBoundsStartDurationSeconds.as('seconds')).toEqual(Duration.fromDurationLike({hours: testHours, minutes: testMinutes}).as('seconds'));
  });

  it('the outOfBoundsEndInterval should start at the end of the boundsInterval for visibleDuration of 1 second and end at the start of the next hour', () => {
    const start: Date = new Date();
    start.setMinutes(15);
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() + 10 * 24 * 60 * 60 * 1000);
    const boundsInterval = Interval.fromDateTimes(start, end);
    const visibleDuration = Duration.fromDurationLike({seconds: 1});
    const offsetDuration = boundsInterval.toDuration().minus({seconds: 1});
    let timescale: Timescale = new Timescale(boundsInterval, visibleDuration, offsetDuration);

    expect(timescale.outOfBoundsEndInterval).toEqual(Interval.fromDateTimes(boundsInterval.end, DateTime.fromJSDate(end).plus({hours: 1}).startOf(Timescale.HOUR_DATETIME_UNIT)));
  });

  it('the outOfBoundsEndInterval should start at the end of the boundsInterval for visibleDuration of Timescale.MAX_VISIBLE_DURATION_FOR_HOUR_BASED_PRIMARY_DATE_TIME_UNIT and end at the start of the next hour', () => {
    const start: Date = new Date();
    start.setMinutes(15);
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() + 10 * 24 * 60 * 60 * 1000);
    const boundsInterval = Interval.fromDateTimes(start, end);
    const visibleDuration = Timescale.MAX_VISIBLE_DURATION_FOR_HOUR_BASED_PRIMARY_DATE_TIME_UNIT;
    const offsetDuration = boundsInterval.toDuration().minus(visibleDuration);
    let timescale: Timescale = new Timescale(boundsInterval, visibleDuration, offsetDuration);

    expect(timescale.outOfBoundsEndInterval).toEqual(Interval.fromDateTimes(boundsInterval.end, DateTime.fromJSDate(end).plus({hours: 1}).startOf(Timescale.HOUR_DATETIME_UNIT)));
  });

  it('the outOfBoundsEndInterval should start at the end of the boundsInterval for visibleDuration of Timescale.MAX_VISIBLE_DURATION_FOR_HOUR_BASED_PRIMARY_DATE_TIME_UNIT plus 1 second and end at the start of the next day', () => {
    const start: Date = new Date();
    start.setMinutes(15);
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() + 10 * 24 * 60 * 60 * 1000);
    const boundsInterval = Interval.fromDateTimes(start, end);
    const visibleDuration = Timescale.MAX_VISIBLE_DURATION_FOR_HOUR_BASED_PRIMARY_DATE_TIME_UNIT.plus(Duration.fromDurationLike({seconds: 1}));
    const offsetDuration = boundsInterval.toDuration().minus(visibleDuration);
    let timescale: Timescale = new Timescale(boundsInterval, visibleDuration, offsetDuration);

    expect(timescale.outOfBoundsEndInterval).toEqual(Interval.fromDateTimes(boundsInterval.end, DateTime.fromJSDate(end).plus({days: 1}).startOf(Timescale.DAY_DATETIME_UNIT)));
  });

  it('the outOfBoundsEndDuration should be the duration of the outOfBoundsEndInterval for visibleDuration of 1 second and end at the start of the next hour', () => {
    const testMinutes: number = 15;
    const start: Date = new Date();
    start.setMinutes(testMinutes);
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() + 10 * 24 * 60 * 60 * 1000);
    const boundsInterval = Interval.fromDateTimes(start, end);
    const visibleDuration = Duration.fromDurationLike({seconds: 1});
    const offsetDuration = Duration.fromDurationLike({hours: 0});
    let timescale: Timescale = new Timescale(boundsInterval, visibleDuration, offsetDuration);

    // note: when testing the end subtract the absolute start time from the expected end
    // important!! compare as seconds because a Duration of 60 seconds <> a Duration of 1 minute
    expect(timescale.outOfBoundsEndDurationSeconds.as('seconds')).toEqual(Duration.fromDurationLike({minutes: (60 - testMinutes)}).as('seconds'));
  });

  it('the outOfBoundsEndDuration should be the duration of the outOfBoundsEndInterval for visibleDuration of Timescale.MAX_VISIBLE_DURATION_FOR_HOUR_BASED_PRIMARY_DATE_TIME_UNIT and end at the start of the next hour', () => {
    const testMinutes: number = 15;
    const start: Date = new Date();
    start.setMinutes(testMinutes);
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() + 10 * 24 * 60 * 60 * 1000);
    const boundsInterval = Interval.fromDateTimes(start, end);
    const visibleDuration = Timescale.MAX_VISIBLE_DURATION_FOR_HOUR_BASED_PRIMARY_DATE_TIME_UNIT;
    const offsetDuration = boundsInterval.toDuration().minus(visibleDuration);
    let timescale: Timescale = new Timescale(boundsInterval, visibleDuration, offsetDuration);

    // note: when testing the end subtract the absolute start time from the expected end
    // important!! compare as seconds because a Duration of 60 seconds <> a Duration of 1 minute
    expect(timescale.outOfBoundsEndDurationSeconds.as('seconds')).toEqual(Duration.fromDurationLike({minutes: (60 - testMinutes)}).as('seconds'));
  });

  it('the outOfBoundsEndDuration should be the duration of the outOfBoundsEndInterval for visibleDuration of Timescale.MAX_VISIBLE_DURATION_FOR_HOUR_BASED_PRIMARY_DATE_TIME_UNIT plus 1 second and end at the start of the next day', () => {
    const testHours: number = 2;
    const testMinutes: number = 15;
    const start: Date = new Date();
    start.setHours(testHours);
    start.setMinutes(testMinutes);
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() + 10 * 24 * 60 * 60 * 1000);
    const boundsInterval = Interval.fromDateTimes(start, end);
    const visibleDuration = Timescale.MAX_VISIBLE_DURATION_FOR_HOUR_BASED_PRIMARY_DATE_TIME_UNIT.plus(Duration.fromDurationLike({seconds: 1}));
    const offsetDuration = boundsInterval.toDuration().minus(visibleDuration);
    let timescale: Timescale = new Timescale(boundsInterval, visibleDuration, offsetDuration);

    // note: when testing the end subtract the absolute start time from the expected end
    // important!! compare as seconds because a Duration of 60 seconds <> a Duration of 1 minute
    expect(timescale.outOfBoundsEndDurationSeconds.as('seconds')).toEqual(Duration.fromDurationLike({hours: (23 - testHours), minutes: (60 - testMinutes)}).as('seconds'));
  });

  it('the visibleTimelineBounds should exist', () => {
    const start: Date = new Date();
    start.setMinutes(15);
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() + 10 * 24 * 60 * 60 * 1000);
    const boundsInterval = Interval.fromDateTimes(start, end);
    const visibleDuration = Duration.fromDurationLike({seconds: 1});
    const offsetDuration = Duration.fromDurationLike({seconds: 0});
    let timescale: Timescale = new Timescale(boundsInterval, visibleDuration, offsetDuration);

    expect(timescale.visibleTimelineBounds).toBeTruthy();
  });

  it('the visibleTimelineBounds should start at the hour before the start of the boundsInterval.start plus the offsetDuration of 0 seconds for visibleDuration and end at the start of the next hour after the end of the boundsInterval.start plus the visibleDuration of 1 second', () => {
    const start: Date = new Date();
    start.setMinutes(15);
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() + 10 * 24 * 60 * 60 * 1000);
    const boundsInterval = Interval.fromDateTimes(start, end);
    const visibleDuration = Duration.fromDurationLike({seconds: 1});
    const offsetDuration = Duration.fromDurationLike({seconds: 0});
    let timescale: Timescale = new Timescale(boundsInterval, visibleDuration, offsetDuration);

    expect(timescale.visibleTimelineBounds).toEqual(Interval.fromDateTimes(boundsInterval.start.startOf(Timescale.HOUR_DATETIME_UNIT), boundsInterval.start.plus(offsetDuration).plus(visibleDuration).plus({hours: 1}).startOf(Timescale.HOUR_DATETIME_UNIT)));
  });

  it('the visibleTimelineBounds should start at the hour before the start of the boundsInterval.start plus the offsetDuration of 1 seconds for visibleDuration and end at the start of the next hour after the end of the boundsInterval.start plus the visibleDuration of 1 second', () => {
    const start: Date = new Date();
    start.setMinutes(59);
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() + 10 * 24 * 60 * 60 * 1000);
    const boundsInterval = Interval.fromDateTimes(start, end);
    const visibleDuration = Duration.fromDurationLike({seconds: 1});
    const offsetDuration = Duration.fromDurationLike({seconds: 1});
    let timescale: Timescale = new Timescale(boundsInterval, visibleDuration, offsetDuration);

    expect(timescale.visibleTimelineBounds).toEqual(Interval.fromDateTimes(boundsInterval.start.startOf(Timescale.HOUR_DATETIME_UNIT), boundsInterval.start.plus(offsetDuration).plus(visibleDuration).plus({hours: 1}).startOf(Timescale.HOUR_DATETIME_UNIT)));
  })

  it('the visibleTimelineBounds should start at the hour before the start of the boundsInterval.start plus the offsetDuration of 0 seconds for visibleDuration and end at the start of the next hour after the end of the boundsInterval.start plus the visibleDuration of Timescale.MAX_VISIBLE_DURATION_FOR_HOUR_BASED_PRIMARY_DATE_TIME_UNIT', () => {
    const start: Date = new Date();
    start.setMinutes(15);
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() + 10 * 24 * 60 * 60 * 1000);
    const boundsInterval = Interval.fromDateTimes(start, end);
    const visibleDuration = Timescale.MAX_VISIBLE_DURATION_FOR_HOUR_BASED_PRIMARY_DATE_TIME_UNIT;
    const offsetDuration = Duration.fromDurationLike({seconds: 0})
    let timescale: Timescale = new Timescale(boundsInterval, visibleDuration, offsetDuration);

    expect(timescale.visibleTimelineBounds).toEqual(Interval.fromDateTimes(boundsInterval.start.startOf(Timescale.HOUR_DATETIME_UNIT), boundsInterval.start.plus(offsetDuration).plus(visibleDuration).plus({hours: 1}).startOf(Timescale.HOUR_DATETIME_UNIT)));
  });

  it('the visibleTimelineBounds should start at the day before the start of the boundsInterval.start plus the offsetDuration of boundsInterval.toDuration().minus(visibleDuration) for visibleDuration and end at the start of the next day after the end of the boundsInterval.start plus the visibleDuration of Timescale.MAX_VISIBLE_DURATION_FOR_HOUR_BASED_PRIMARY_DATE_TIME_UNIT plus 1 second', () => {
    const start: Date = new Date();
    start.setMinutes(15);
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() + 10 * 24 * 60 * 60 * 1000);
    const boundsInterval = Interval.fromDateTimes(start, end);
    const visibleDuration = Timescale.MAX_VISIBLE_DURATION_FOR_HOUR_BASED_PRIMARY_DATE_TIME_UNIT.plus(Duration.fromDurationLike({seconds: 1}));
    const offsetDuration = boundsInterval.toDuration().minus(visibleDuration);
    let timescale: Timescale = new Timescale(boundsInterval, visibleDuration, offsetDuration);

    expect(timescale.visibleTimelineBounds).toEqual(Interval.fromDateTimes(boundsInterval.start.plus(offsetDuration).startOf(Timescale.DAY_DATETIME_UNIT), boundsInterval.start.plus(offsetDuration).plus(visibleDuration).plus({days: 1}).startOf(Timescale.DAY_DATETIME_UNIT)));
  });

  it('the onePrimaryDateTimeUnitDuration should be 1 hour when the visibleDuration is equal to or less than Timescale.MAX_VISIBLE_DURATION_FOR_HOUR_BASED_PRIMARY_DATE_TIME_UNIT', () => {
    const start: Date = new Date();
    start.setMinutes(15);
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() + 10 * 24 * 60 * 60 * 1000);
    const boundsInterval = Interval.fromDateTimes(start, end);
    let timescale: Timescale = new Timescale(boundsInterval, Timescale.MAX_VISIBLE_DURATION_FOR_HOUR_BASED_PRIMARY_DATE_TIME_UNIT);
    expect(timescale.onePrimaryDateTimeUnitDuration).toEqual(Duration.fromDurationLike({hours: 1}));
    timescale = new Timescale(boundsInterval, Duration.fromDurationLike({seconds: 1}));
    expect(timescale.onePrimaryDateTimeUnitDuration).toEqual(Duration.fromDurationLike({hours: 1}));
  });

  it('the onePrimaryDateTimeUnitDuration should be 1 day when the visibleDuration is greater than Timescale.MAX_VISIBLE_DURATION_FOR_HOUR_BASED_PRIMARY_DATE_TIME_UNIT', () => {
    const start: Date = new Date();
    start.setMinutes(15);
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() + 10 * 24 * 60 * 60 * 1000);
    const boundsInterval = Interval.fromDateTimes(start, end);
    const visibleDuration = Timescale.MAX_VISIBLE_DURATION_FOR_HOUR_BASED_PRIMARY_DATE_TIME_UNIT.plus(Duration.fromDurationLike({seconds: 1}));
    const offsetDuration = boundsInterval.toDuration().minus(visibleDuration);
    let timescale: Timescale = new Timescale(boundsInterval, visibleDuration, offsetDuration);

    expect(timescale.onePrimaryDateTimeUnitDuration).toEqual(Duration.fromDurationLike({days: 1}));
  });
});
