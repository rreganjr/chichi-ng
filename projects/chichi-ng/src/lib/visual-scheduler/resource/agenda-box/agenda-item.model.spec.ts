import { DateTime, Interval } from 'luxon';
import { Utils } from '../../utils';
import { AgendaItem, AgendaItemLabeler } from './agenda-item.model';

describe('AgendaItem', () => {
  it('should create an instance', () => {
    const start: Date = new Date();
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() +  24 * 60 * 60 * 1000);
    expect(new AgendaItem('resource', 'channel', Interval.fromDateTimes(start, end), {label: 'new item'}, (data:any)=>data.label)).toBeTruthy();
  });

  it('resourceName should return resource name', () => {
    const resourceName:string = 'resource';
    const channelName:string = 'channel';
    const start: Date = new Date();
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() +  24 * 60 * 60 * 1000);
    const agendaItem:AgendaItem = new AgendaItem(resourceName, channelName, Interval.fromDateTimes(start, end), {label: 'new item'}, (data:any)=>data.label);
    expect(agendaItem.resourceName).toEqual(resourceName);
  });

  it('channelName should return channel name', () => {
    const resourceName:string = 'resource';
    const channelName:string = 'channel';
    const start: Date = new Date();
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() +  24 * 60 * 60 * 1000);
    const agendaItem:AgendaItem = new AgendaItem(resourceName, channelName, Interval.fromDateTimes(start, end), {label: 'new item'}, (data:any)=>data.label);
    expect(agendaItem.channelName).toEqual(channelName);
  });

  it('startDate should return datetime of bounds start', () => {
    const start: Date = new Date();
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() +  24 * 60 * 60 * 1000);
    const agendaItem:AgendaItem = new AgendaItem('resource', 'channel', Interval.fromDateTimes(start, end), {label: 'new item'}, (data:any)=>data.label);
    expect(agendaItem.startDate).toEqual(DateTime.fromJSDate(start));
  });

  it('startDateAsHtmlDateTimeLocalString should return localized datetime string', () => {
    const start: Date = new Date();
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() +  24 * 60 * 60 * 1000);
    const agendaItem:AgendaItem = new AgendaItem('resource', 'channel', Interval.fromDateTimes(start, end), {label: 'new item'}, (data:any)=>data.label);
    expect(agendaItem.startDateAsHtmlDateTimeLocalString).toEqual(Utils.toHtmlDateTimeLocalString(start));
  });

  it('endDate should return datetime of bounds end', () => {
    const start: Date = new Date();
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() +  24 * 60 * 60 * 1000);
    const agendaItem:AgendaItem = new AgendaItem('resource', 'channel', Interval.fromDateTimes(start, end), {label: 'new item'}, (data:any)=>data.label);
    expect(agendaItem.endDate).toEqual(DateTime.fromJSDate(end));
  });

  it('endDateAsHtmlDateTimeLocalString should return localized datetime string', () => {
    const start: Date = new Date();
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() +  24 * 60 * 60 * 1000);
    const agendaItem:AgendaItem = new AgendaItem('resource', 'channel', Interval.fromDateTimes(start, end), {label: 'new item'}, (data:any)=>data.label);
    expect(agendaItem.endDateAsHtmlDateTimeLocalString).toEqual(Utils.toHtmlDateTimeLocalString(end));
  });

  it('label should return the label', () => {
    const start: Date = new Date();
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() +  24 * 60 * 60 * 1000);
    const data:{label: string} = {label: 'new item'};
    const labeler:AgendaItemLabeler<any> = (data:any)=>data.label;

    const agendaItem:AgendaItem = new AgendaItem('resource', 'channel', Interval.fromDateTimes(start, end), data, labeler);
    expect(agendaItem.label).toEqual(labeler(data));
  });

  it('durationAs should return the duration of the bounds interval in the specified time unit', () => {
    const start: Date = new Date();
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() +  24 * 60 * 60 * 1000);
    const data:{label: string} = {label: 'new item'};
    const labeler:AgendaItemLabeler<any> = (data:any)=>data.label;

    const agendaItem:AgendaItem = new AgendaItem('resource', 'channel', Interval.fromDateTimes(start, end), data, labeler);
    expect(agendaItem.durationAs('seconds')).toEqual(Interval.fromDateTimes(start, end).toDuration('seconds'));
  });

  it('bounds should return the bounds interval', () => {
    const start: Date = new Date();
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() +  24 * 60 * 60 * 1000);
    const data:{label: string} = {label: 'new item'};
    const labeler:AgendaItemLabeler<any> = (data:any)=>data.label;

    const agendaItem:AgendaItem = new AgendaItem('resource', 'channel', Interval.fromDateTimes(start, end), data, labeler);
    expect(agendaItem.bounds).toEqual(Interval.fromDateTimes(start, end));
  });
});
