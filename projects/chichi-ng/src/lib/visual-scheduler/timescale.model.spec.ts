import { Duration, Interval } from 'luxon';
import { Timescale } from './timescale.model';

describe('Timescale', () => {
  it('should create an instance', () => {
    const start: Date = new Date();
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() +  24 * 60 * 60 * 1000);
    const boundsInterval = Interval.fromDateTimes(start, end);

    expect(new Timescale(boundsInterval, boundsInterval.toDuration(), Duration.fromDurationLike({hours: 0}))).toBeTruthy();
  });
});
