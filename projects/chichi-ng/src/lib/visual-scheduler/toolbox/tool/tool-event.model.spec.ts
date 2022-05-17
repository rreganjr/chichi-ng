import { Interval } from 'luxon';
import { AgendaItem } from '../../resource/agenda-box/agenda-item.model';
import { ToolEvent } from './tool-event.model';

describe('ToolEvent', () => {
  it('should create an instance', () => {
    const start: Date = new Date();
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() +  24 * 60 * 60 * 1000);
    const agendaItem = new AgendaItem('resource', 'channel', Interval.fromDateTimes(start, end), {label: 'new item'}, (data:any)=>data.label);

    expect(ToolEvent.newEditEvent(agendaItem, new Event('test'))).toBeTruthy();
  });

  it('CLEAR ToolEvent isClear() should return true', () => {
    const start: Date = new Date();
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() +  24 * 60 * 60 * 1000);
    const agendaItem = new AgendaItem('resource', 'channel', Interval.fromDateTimes(start, end), {label: 'new item'}, (data:any)=>data.label);

    expect(ToolEvent.CLEAR.isClear()).toBeTrue();
  });
});
