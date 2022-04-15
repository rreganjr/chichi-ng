import { Interval } from 'luxon';
import { AgendaItem } from './agenda-item.model';

describe('AgendaItem', () => {
  it('should create an instance', () => {
    const start: Date = new Date();
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() +  24 * 60 * 60 * 1000);
    expect(new AgendaItem('resource', 'channel', Interval.fromDateTimes(start, end), {label: 'new item'}, (data:any)=>data.label)).toBeTruthy();
  });
});
