import { TestBed } from '@angular/core/testing';
import { DateTime } from 'luxon';
import { Utils } from './utils';


describe('Utils', () => {

  it('should format date time appropriate for an html datetime-local input type.', () => {
    const testDate: Date = new Date('2022-05-01 01:01:01.123');
    expect(Utils.toHtmlDateTimeLocalString(testDate)).toEqual('2022-05-01T01:01:01');
  });

  it('bad value should return an empty string.', () => {
    expect(Utils.toHtmlDateTimeLocalString((null as unknown) as Date)).toEqual('');
  });

  it('should return start of next year', () => {
    const testDate: DateTime = DateTime.fromJSDate(new Date('2022-05-01 01:01:01.123'));
    expect(Utils.getStartOfNext(testDate, 'year')).toEqual(DateTime.fromJSDate(new Date('2023-01-01T00:00:00.000')));
  });

  it('should return start of next quarter', () => {
    const testDate: DateTime = DateTime.fromJSDate(new Date('2022-05-01 01:01:01.123'));
    expect(Utils.getStartOfNext(testDate, 'quarter')).toEqual(DateTime.fromJSDate(new Date('2022-07-01T00:00:00.000')));
  });

  it('should return start of next month', () => {
    const testDate: DateTime = DateTime.fromJSDate(new Date('2022-05-01 01:01:01.123'));
    expect(Utils.getStartOfNext(testDate, 'month')).toEqual(DateTime.fromJSDate(new Date('2022-06-01T00:00:00.000')));
  });

  it('should return start of next week', () => {
    const testDate: DateTime = DateTime.fromJSDate(new Date('2022-05-02 01:01:01.123'));
    expect(Utils.getStartOfNext(testDate, 'week')).toEqual(DateTime.fromJSDate(new Date('2022-05-09T00:00:00.000')));
  });

  it('should return start of next day', () => {
    const testDate: DateTime = DateTime.fromJSDate(new Date('2022-05-01 01:01:01.123'));
    expect(Utils.getStartOfNext(testDate, 'day')).toEqual(DateTime.fromJSDate(new Date('2022-05-02T00:00:00.000')));
  });

  it('should return start of next hour', () => {
    const testDate: DateTime = DateTime.fromJSDate(new Date('2022-05-01 01:01:01.123'));
    expect(Utils.getStartOfNext(testDate, 'hour')).toEqual(DateTime.fromJSDate(new Date('2022-05-01T02:00:00.000')));
  });

  it('should return start of next minute', () => {
    const testDate: DateTime = DateTime.fromJSDate(new Date('2022-05-01 01:01:01.123'));
    expect(Utils.getStartOfNext(testDate, 'minute')).toEqual(DateTime.fromJSDate(new Date('2022-05-01T01:02:00.000')));
  });

  it('should return start of next second', () => {
    const testDate: DateTime = DateTime.fromJSDate(new Date('2022-05-01 01:01:01.123'));
    expect(Utils.getStartOfNext(testDate, 'second')).toEqual(DateTime.fromJSDate(new Date('2022-05-01T01:01:02.000')));
  });

  it('should return start of next millisecond', () => {
    const testDate: DateTime = DateTime.fromJSDate(new Date('2022-05-01 01:01:01.123'));
    expect(Utils.getStartOfNext(testDate, 'millisecond')).toEqual(DateTime.fromJSDate(new Date('2022-05-01T01:01:01.124')));
  });
});
