import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Interval } from 'luxon';
import { first, skip } from 'rxjs';
import { AgendaItem, ToolEvent } from '../../public-api';
import { TimescaleNotSet } from './timescale-not-set.error';

import { VisualSchedulerService } from './visual-scheduler.service';

describe('VisualSchedulerService', () => {
  let visualSchedulerService: VisualSchedulerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    visualSchedulerService = new VisualSchedulerService();
  });

  it('should be created', () => {
    expect(visualSchedulerService).toBeTruthy();
  });

  it(`should initialize with the CLEAR event`, (done: DoneFn) => {
    visualSchedulerService.getToolEvents$().pipe(first()).subscribe(
      (toolEvent:ToolEvent) => {
        expect(toolEvent).toEqual(ToolEvent.CLEAR);
        done();
      }
    );

  });

  // getToolEvents

  it(' VisualSchedulerService dragStart should generate a START ToolEvent', (done: DoneFn) => {
    const eventType = 'dragstart';
    const toolType = 'chat';
    // skip the first event which is always a ToolEvent.CLEAR
    visualSchedulerService.getToolEvents$().pipe(skip(1), first()).subscribe(
      (toolEvent:ToolEvent) => {
        expect(toolEvent.isStart()).toBeTrue();
        expect(toolEvent.toolType).toEqual(toolType);
        expect(toolEvent.event?.type).toEqual(eventType);
        done();
      }
    );
    visualSchedulerService.dragStart(
      new DragEvent(eventType),
      toolType
    );
  });

  it(' VisualSchedulerService dragEnd should generate an END ToolEvent', (done: DoneFn) => {
    const eventType = 'dragend';
    const toolType = 'video';
    // skip the first event which is always a ToolEvent.CLEAR
    visualSchedulerService.getToolEvents$().pipe(skip(1), first()).subscribe(
      (toolEvent:ToolEvent) => {
        expect(toolEvent.isEnd()).toBeTrue();
        expect(toolEvent.toolType).toEqual(toolType);
        expect(toolEvent.event?.type).toEqual(eventType);
        done();
      }
    );
    visualSchedulerService.dragEnd(
      new DragEvent(eventType),
      toolType
    );
  });

  it(' VisualSchedulerService openAgendaItemDetail should return true and generate an EDIT ToolEvent if a AgendaItem is supplied', (done: DoneFn) => {
    const eventType = 'click';
    const resource = 'room';
    const toolType = 'video';
    const agendaItem:AgendaItem = new AgendaItem(resource, toolType, Interval.fromDateTimes(new Date(), new Date()), {}, (data)=>'label');

    // skip the first event which is always a ToolEvent.CLEAR
    visualSchedulerService.getToolEvents$().pipe(skip(1), first()).subscribe(
      (toolEvent:ToolEvent) => {
        expect(toolEvent.isEdit()).toBeTrue();
        expect(toolEvent.toolType).toEqual(toolType);
        expect(toolEvent.agendaItem).toEqual(agendaItem);
        expect(toolEvent.event?.type).toEqual(eventType);
        done();
      }
    );
    expect(visualSchedulerService.openAgendaItemDetail(
      agendaItem,
      new Event(eventType)
    )).toBeTrue();
  });

  it(' VisualSchedulerService openAgendaItemDetail should return false if an invalid AgendaItem id is supplied and not generate an EDIT ToolEvent', fakeAsync(() => {
    let dataEmitted: boolean = false;
    visualSchedulerService.getToolEvents$().pipe(skip(1), first()).subscribe(() => dataEmitted = true);
    expect(visualSchedulerService.openAgendaItemDetail(-1, new Event('click'))).toBeFalse();
    tick(100);
    expect(dataEmitted).toBeFalse();
  }));

  it('getIntersectingAgendaItems() should return an empty list when no AgendaItems exist', () => {
    expect(visualSchedulerService.getIntersectingAgendaItems('', '', new Date(), new Date)).toEqual([]);
  });

  it('isIntervalAvailable() should throw TimescaleNotSet() Error', () => {
    expect(() => visualSchedulerService.isIntervalAvailable('', '', new Date(), new Date()))
    .toThrowMatching((thrown: TimescaleNotSet) => thrown.whoYouGonnaCall !== undefined);
  });

  it('isIntervalAvailable() should return false if the start or end is out of bounds', () => {
    const boundsStartDate = new Date('2022-01-01 00:00:00');
    const boundsEndDate = new Date('2022-01-02 00:00:00');
    const desiredIntervalStartDate = boundsStartDate;
    const desiredIntervalEndDate = new Date(boundsEndDate.getTime() + 1);

    visualSchedulerService.setBounds(boundsStartDate, boundsEndDate)
    expect(visualSchedulerService.isIntervalAvailable('', '', desiredIntervalStartDate, desiredIntervalEndDate)).toBeFalse();
  });

  it('isIntervalAvailable() should return false if the resource does not exist', () => {
    const boundsStartDate = new Date('2022-01-01 00:00:00');
    const boundsEndDate = new Date('2022-01-02 00:00:00');
    const desiredIntervalStartDate = new Date(boundsStartDate.getTime() + 1);
    const desiredIntervalEndDate = new Date(boundsEndDate.getTime() - 1);
    const resource = 'resource';
    const channel = 'channel';

    visualSchedulerService.setBounds(boundsStartDate, boundsEndDate)
    expect(visualSchedulerService.isIntervalAvailable(resource, channel, desiredIntervalStartDate, desiredIntervalEndDate)).toBeFalse();
  });

});
