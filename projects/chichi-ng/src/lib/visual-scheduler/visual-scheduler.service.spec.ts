import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Timescale } from 'chichi-ng';
import { DateTime, Duration, Interval } from 'luxon';
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

  it('VisualSchedulerService isResourceChannelExist() should return false if the resource or channel doesnt exist', () => {
    expect(visualSchedulerService.isResourceChannelExist('', '')).toBeFalse();
  });

  it('VisualSchedulerService isResourceChannelExist() should return true if the resource and channel exist', () => {
    const resourceName: string = 'resource';
    const channelName: string = 'channel';
    const boundsStartDate = new Date('2022-01-01 00:00:00');
    const boundsEndDate = new Date('2022-01-02 00:00:00');
    visualSchedulerService.setBounds(boundsStartDate, boundsEndDate);

    // TODO: the service doesn't actually know if a resource and channel exist, checking for an intersection initializes data behind
    // the scenes for the service to assume they exist.
    expect(visualSchedulerService.isResourceChannelExist(resourceName, channelName)).toBeFalse(); // service doesn't think it exists
    visualSchedulerService.getIntersectingAgendaItems(resourceName, channelName, boundsStartDate, boundsEndDate); // makes the service assume it exists
    expect(visualSchedulerService.isResourceChannelExist(resourceName, channelName)).toBeTrue();
  });

  it('VisualSchedulerService isIntervalInBounds() should throw TimescaleNotSet() Error if the Timescale has not been set', () => {
    expect(() => visualSchedulerService.isIntervalInBounds(new Date(), new Date()))
    .toThrowMatching((thrown: TimescaleNotSet) => thrown.whoYouGonnaCall !== undefined);
  });

  it('VisualSchedulerService isIntervalInBounds() should return false if the start is out of bounds', () => {
    const boundsStartDate = new Date('2022-01-01 00:00:00');
    const boundsEndDate = new Date('2022-01-02 00:00:00');
    const desiredIntervalStartDate = new Date(boundsStartDate.getTime() - 1);
    const desiredIntervalEndDate = boundsEndDate;

    visualSchedulerService.setBounds(boundsStartDate, boundsEndDate);
    expect(visualSchedulerService.isIntervalInBounds(desiredIntervalStartDate, desiredIntervalEndDate)).toBeFalse();
  });

  it('VisualSchedulerService isIntervalInBounds() should return false if the end is out of bounds', () => {
    const boundsStartDate = new Date('2022-01-01 00:00:00');
    const boundsEndDate = new Date('2022-01-02 00:00:00');
    const desiredIntervalStartDate = boundsStartDate;
    const desiredIntervalEndDate = new Date(boundsEndDate.getTime() + 1);

    visualSchedulerService.setBounds(boundsStartDate, boundsEndDate);
    expect(visualSchedulerService.isIntervalAvailable('', '', desiredIntervalStartDate, desiredIntervalEndDate)).toBeFalse();
  });

  it('VisualSchedulerService isIntervalInBounds() should return true if the interval equals the bounds', () => {
    const boundsStartDate = new Date('2022-01-01 00:00:00');
    const boundsEndDate = new Date('2022-01-02 00:00:00');
    const desiredIntervalStartDate = boundsStartDate;
    const desiredIntervalEndDate = boundsEndDate;

    visualSchedulerService.setBounds(boundsStartDate, boundsEndDate);
    expect(visualSchedulerService.isIntervalInBounds(desiredIntervalStartDate, desiredIntervalEndDate)).toBeTrue();
  });

  it('VisualSchedulerService isIntervalInBounds() should return true if the interval is inside the bounds', () => {
    const boundsStartDate = new Date('2022-01-01 00:00:00');
    const boundsEndDate = new Date('2022-01-02 00:00:00');
    const desiredIntervalStartDate = new Date(boundsStartDate.getTime() + 1);
    const desiredIntervalEndDate = new Date(boundsEndDate.getTime() - 1);

    visualSchedulerService.setBounds(boundsStartDate, boundsEndDate);
    expect(visualSchedulerService.isIntervalInBounds(desiredIntervalStartDate, desiredIntervalEndDate)).toBeTrue();
  });

  it('VisualSchedulerService isIntervalAvailable() should throw TimescaleNotSet() Error if the Timescale has not been set', () => {
    expect(() => visualSchedulerService.isIntervalAvailable('', '', new Date(), new Date()))
    .toThrowMatching((thrown: TimescaleNotSet) => thrown.whoYouGonnaCall !== undefined);
  });

  it('VisualSchedulerService isIntervalAvailable() should return false if the start is out of bounds', () => {
    const boundsStartDate = new Date('2022-01-01 00:00:00');
    const boundsEndDate = new Date('2022-01-02 00:00:00');
    const desiredIntervalStartDate = new Date(boundsEndDate.getTime() - 1);
    const desiredIntervalEndDate = boundsEndDate;

    visualSchedulerService.setBounds(boundsStartDate, boundsEndDate);
    expect(visualSchedulerService.isIntervalAvailable('', '', desiredIntervalStartDate, desiredIntervalEndDate)).toBeFalse();
  });

  it('VisualSchedulerService isIntervalAvailable() should return false if the end is out of bounds', () => {
    const boundsStartDate = new Date('2022-01-01 00:00:00');
    const boundsEndDate = new Date('2022-01-02 00:00:00');
    const desiredIntervalStartDate = boundsStartDate;
    const desiredIntervalEndDate = new Date(boundsEndDate.getTime() + 1);
    const resourceName = 'resource';
    const channelName = 'channel';

    visualSchedulerService.setBounds(boundsStartDate, boundsEndDate);

    // TODO: the service doesn't actually know if a resource and channel exist, checking for an intersection initializes data behind
    // the scenes for the service to assume they exist.
    expect(visualSchedulerService.isIntervalAvailable(resourceName, channelName, desiredIntervalStartDate, desiredIntervalEndDate)).toBeFalse();
    visualSchedulerService.getIntersectingAgendaItems(resourceName, channelName, boundsStartDate, boundsEndDate); // makes the service assume it exists
    expect(visualSchedulerService.isIntervalAvailable(resourceName, channelName, desiredIntervalStartDate, desiredIntervalEndDate)).toBeFalse();
  });

  it('VisualSchedulerService isIntervalAvailable() should return true if the interval equals the bounds', () => {
    const boundsStartDate = new Date('2022-01-01 00:00:00');
    const boundsEndDate = new Date('2022-01-02 00:00:00');
    const desiredIntervalStartDate = boundsStartDate;
    const desiredIntervalEndDate = boundsEndDate;
    const resourceName = 'resource';
    const channelName = 'channel';

    visualSchedulerService.setBounds(boundsStartDate, boundsEndDate);

    // TODO: the service doesn't actually know if a resource and channel exist, checking for an intersection initializes data behind
    // the scenes for the service to assume they exist.
    expect(visualSchedulerService.isIntervalAvailable(resourceName, channelName, desiredIntervalStartDate, desiredIntervalEndDate)).toBeFalse();
    visualSchedulerService.getIntersectingAgendaItems(resourceName, channelName, boundsStartDate, boundsEndDate); // makes the service assume it exists
    expect(visualSchedulerService.isIntervalAvailable(resourceName, channelName, desiredIntervalStartDate, desiredIntervalEndDate)).toBeTrue(); // this resource/channel exist
  });

  it('VisualSchedulerService isIntervalAvailable() should return true if the interval is inside the bounds', () => {
    const boundsStartDate = new Date('2022-01-01 00:00:00');
    const boundsEndDate = new Date('2022-01-02 00:00:00');
    const desiredIntervalStartDate = new Date(boundsStartDate.getTime() + 1);
    const desiredIntervalEndDate = new Date(boundsEndDate.getTime() - 1);
    const resourceName = 'resource';
    const channelName = 'channel';

    visualSchedulerService.setBounds(boundsStartDate, boundsEndDate);

    // TODO: the service doesn't actually know if a resource and channel exist, checking for an intersection initializes data behind
    // the scenes for the service to assume they exist.
    expect(visualSchedulerService.isIntervalAvailable(resourceName, channelName, desiredIntervalStartDate, desiredIntervalEndDate)).toBeFalse();
    visualSchedulerService.getIntersectingAgendaItems(resourceName, channelName, boundsStartDate, boundsEndDate); // makes the service assume it exists
    expect(visualSchedulerService.isIntervalAvailable(resourceName, channelName, desiredIntervalStartDate, desiredIntervalEndDate)).toBeTrue(); // this resource/channel exist
  });

  it('VisualSchedulerService isIntervalAvailable() should return false if the channel does not exist', () => {
    const boundsStartDate = new Date('2022-01-01 00:00:00');
    const boundsEndDate = new Date('2022-01-02 00:00:00');
    const desiredIntervalStartDate = new Date(boundsStartDate.getTime() + 1);
    const desiredIntervalEndDate = new Date(boundsEndDate.getTime() - 1);
    const resourceName = 'resource';
    const channelName = 'channel';
    const channelNameDoesntExist = 'no-channel-exists';

    visualSchedulerService.setBounds(boundsStartDate, boundsEndDate);

    // TODO: the service doesn't actually know if a resource and channel exist, checking for an intersection initializes data behind
    // the scenes for the service to assume they exist.
    expect(visualSchedulerService.isIntervalAvailable(resourceName, channelName, desiredIntervalStartDate, desiredIntervalEndDate)).toBeFalse();
    visualSchedulerService.getIntersectingAgendaItems(resourceName, channelName, boundsStartDate, boundsEndDate); // makes the service assume it exists
    expect(visualSchedulerService.isIntervalAvailable(resourceName, channelName, desiredIntervalStartDate, desiredIntervalEndDate)).toBeTrue(); // this resource/channel exist
    expect(visualSchedulerService.isIntervalAvailable(resourceName, channelNameDoesntExist, desiredIntervalStartDate, desiredIntervalEndDate)).toBeFalse(); // the resource exists but not the channel
  });

  it('VisualSchedulerService setViewportOffsetDuration() should throw TimescaleNotSet() Error if the Timescale has not been set', () => {
    expect(() => visualSchedulerService.isIntervalInBounds(new Date(), new Date()))
    .toThrowMatching((thrown: TimescaleNotSet) => thrown.whoYouGonnaCall !== undefined);
  });

  // TODO: the subscribe isn't working, even though it works where I copied it from?
  // it('VisualSchedulerService setViewportOffsetDuration()', (done: DoneFn) => {
  //   const boundsStartDate = new Date('2022-01-01 00:00:00');
  //   const boundsEndDate = new Date('2022-01-02 00:00:00');
  //   const offsetDuration = Interval.fromDateTimes(boundsStartDate, boundsEndDate).toDuration().minus({hours: 12});

  //   visualSchedulerService.getTimescale$().pipe(first()).subscribe(
  //     (timescale:Timescale) => {
  //       expect(DateTime.fromJSDate(boundsStartDate)).toEqual(timescale.boundsInterval.start);
  //       expect(DateTime.fromJSDate(boundsEndDate)).toEqual(timescale.boundsInterval.end);
  //       expect(offsetDuration).toEqual(timescale.offsetDuration);
  //       done();
  //     }
  //   );

  //   visualSchedulerService.setBounds(boundsStartDate, boundsEndDate);
  //   visualSchedulerService.setViewportOffsetDuration(offsetDuration);
  // });
});
