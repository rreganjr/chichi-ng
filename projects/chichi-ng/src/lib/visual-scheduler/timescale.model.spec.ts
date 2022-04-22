import { DateTime, Duration, Interval } from 'luxon';
import { Timescale } from './timescale.model';

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

  it('out of bounds should be accurate', () => {
    const start: Date = new Date();
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() +  24 * 60 * 60 * 1000);
    const boundsInterval = Interval.fromDateTimes(start, end);

    const timescale = new Timescale(boundsInterval);
    expect(timescale.isOutOfBounds(DateTime.fromJSDate(new Date(start.getTime() - 1)))).toBeTrue();
    expect(timescale.isOutOfBounds(boundsInterval.start)).toBeFalse();
    expect(timescale.isOutOfBounds(DateTime.fromJSDate(new Date(end.getTime() - 1)))).toBeFalse();
    expect(timescale.isOutOfBounds(boundsInterval.end)).toBeTrue();
  });

  it('the primary date time unit should be based on ', () => {
    const start: Date = new Date();
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() +  24 * 60 * 60 * 1000);
    const boundsInterval = Interval.fromDateTimes(start, end);

    const timescale = new Timescale(boundsInterval);
    expect(timescale.isOutOfBounds(DateTime.fromJSDate(new Date(start.getTime() - 1)))).toBeTrue();
    expect(timescale.isOutOfBounds(boundsInterval.start)).toBeFalse();
    expect(timescale.isOutOfBounds(DateTime.fromJSDate(new Date(end.getTime() - 1)))).toBeFalse();
    expect(timescale.isOutOfBounds(boundsInterval.end)).toBeTrue();
  });
});
