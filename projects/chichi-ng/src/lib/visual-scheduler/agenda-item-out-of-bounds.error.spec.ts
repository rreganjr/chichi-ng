import { Interval } from 'luxon';
import { AgendaItemOutOfBounds } from './agenda-item-out-of-bounds.error';

describe('AgendaItemOutOfBounds', () => {
  it('should create an instance', () => {
    const start: Date = new Date();
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() +  24 * 60 * 60 * 1000);
    const pastEnd: Date = new Date(end.getTime() +  1 * 60 * 60 * 1000);
    const boundsInterval: Interval = Interval.fromDateTimes(start, end);
    const outOfBoundsInterval: Interval = Interval.fromDateTimes(start, pastEnd);
    expect(new AgendaItemOutOfBounds(outOfBoundsInterval, boundsInterval)).toBeTruthy();
  });
});
