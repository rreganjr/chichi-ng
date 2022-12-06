import { Interval } from 'luxon';
import { AgendaItem } from './resource/agenda-box/agenda-item.model';
import { AgendaItemConflicts } from './agenda-item-conflicts.error';

describe('AgendaItemConflicts', () => {
  it('should create an instance', () => {
    const start: Date = new Date();
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() +  24 * 60 * 60 * 1000);
    const conflictingItem = new AgendaItem('resource', 'channel', Interval.fromDateTimes(start, end), {label: 'new item'}, (data:any)=>data.label);

    expect(new AgendaItemConflicts(Interval.fromDateTimes(start, end), [conflictingItem])).toBeTruthy();
  });
});
