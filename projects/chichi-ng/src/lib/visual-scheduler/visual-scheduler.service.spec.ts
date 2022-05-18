import { animate } from '@angular/animations';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { DateTime, Duration, Interval } from 'luxon';
import { first, skip } from 'rxjs';
import { AgendaItem, ToolEvent } from '../../public-api';
import { TimescaleInvalid } from './timescale-invalid.error';
import { TimescaleNotSet } from './timescale-not-set.error';
import { TimescaleValidatorErrorCode } from './timescale-validator.util';
import { Timescale } from './timescale.model';

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
    expect(() => visualSchedulerService.setViewportOffsetDuration(Duration.fromDurationLike({hours: 1})))
    .toThrowMatching((thrown: TimescaleNotSet) => thrown.whoYouGonnaCall !== undefined);
  });

  it('VisualSchedulerService setViewportOffsetDuration() should change the offsetDuration in the service', (done: DoneFn) => {
    const boundsStartDate = new Date('2022-01-01 00:00:00');
    const boundsEndDate = new Date('2022-01-02 00:00:00');
    const offsetDuration = Interval.fromDateTimes(boundsStartDate, boundsEndDate).toDuration().minus({hours: 12});

    // skip the event for the setBounds
    visualSchedulerService.getTimescale$().pipe(skip(1), first()).subscribe(
      (timescale:Timescale) => {
        expect(timescale.boundsInterval.start).toEqual(DateTime.fromJSDate(boundsStartDate));
        expect(timescale.boundsInterval.end).toEqual(DateTime.fromJSDate(boundsEndDate));
        expect(timescale.offsetDuration.as('milliseconds')).toEqual(offsetDuration.as('milliseconds'));
        done();
      }
    );

    visualSchedulerService.setBounds(boundsStartDate, boundsEndDate);
    visualSchedulerService.setViewportOffsetDuration(offsetDuration);
  });

  it('VisualSchedulerService addAgendaItem() should return the id of the added item', () => {
    const boundsStartDate = new Date('2022-01-01 00:00:00');
    const boundsEndDate = new Date('2022-01-02 00:00:00');
    const resourceName = 'resource';
    const channelName = 'channel';
    const label = 'label'
    const data = {label: label};

    visualSchedulerService.setBounds(boundsStartDate, boundsEndDate);

    // TODO: the service doesn't actually know if a resource and channel exist, checking for an intersection initializes data behind
    // the scenes for the service to assume they exist.
    visualSchedulerService.getIntersectingAgendaItems(resourceName, channelName, boundsStartDate, boundsEndDate); // makes the service assume it exists

    const itemId = visualSchedulerService.addAgendaItem(resourceName, channelName, boundsStartDate, boundsEndDate, data, (data)=> data.label);
    const agendaItem = visualSchedulerService.getAgendaItemById(itemId);
    expect(agendaItem).toBeTruthy();
    expect(agendaItem?.resourceName).toEqual(resourceName);
    expect(agendaItem?.channelName).toEqual(channelName);
    expect(agendaItem?.startDate.toJSDate()).toEqual(boundsStartDate);
    expect(agendaItem?.endDate.toJSDate()).toEqual(boundsEndDate);
    expect(agendaItem?.label).toEqual(label);
    expect(agendaItem?.data).toEqual(data);
  });

  it('VisualSchedulerService getIntersectingAgendaItems() should return a list of agenda items that intersect with the specified interval', () => {
    const boundsStartDate = new Date('2022-01-01 00:00:00');
    const boundsEndDate = new Date('2022-01-02 00:00:00');
    const desiredIntervalStartDate = new Date(boundsStartDate.getTime() + 1);
    const desiredIntervalEndDate = new Date(boundsEndDate.getTime() - 1);
    const resourceName = 'resource';
    const channelName = 'channel';
    const label = 'label'
    const data = {label: label};

    visualSchedulerService.setBounds(boundsStartDate, boundsEndDate);

    // TODO: the service doesn't actually know if a resource and channel exist, checking for an intersection initializes data behind
    // the scenes for the service to assume they exist.
    expect(visualSchedulerService.getIntersectingAgendaItems(resourceName, channelName, boundsStartDate, boundsEndDate)).toEqual([]);

    visualSchedulerService.addAgendaItem(resourceName, channelName, boundsStartDate, boundsEndDate, data, (data)=> data.label);
    const items:AgendaItem[] = visualSchedulerService.getIntersectingAgendaItems(resourceName, channelName, desiredIntervalStartDate, desiredIntervalEndDate);
    expect(items).toBeTruthy();
    expect(items.length).toEqual(1);
    const agendaItem: AgendaItem = items[0];
    expect(agendaItem.resourceName).toEqual(resourceName);
    expect(agendaItem.channelName).toEqual(channelName);
    expect(agendaItem.startDate).toEqual(DateTime.fromJSDate(boundsStartDate));
    expect(agendaItem.endDate).toEqual(DateTime.fromJSDate(boundsEndDate));
    expect(agendaItem.label).toEqual(label);
    expect(agendaItem.data).toEqual(data);
    expect((agendaItem.data as {label: string}).label).toEqual(label);
  });

  it('VisualSchedulerService setViewportDuration() should throw TimescaleNotSet Error if the Timescale has not been set', () => {
    expect(() => visualSchedulerService.setViewportDuration(Duration.fromDurationLike({hours: 1})))
    .toThrowMatching((thrown: TimescaleNotSet) => thrown.whoYouGonnaCall !== undefined);
  });

  it('VisualSchedulerService setViewportDuration() should change the offsetDuration in the service', (done: DoneFn) => {
    const boundsStartDate = new Date('2022-01-01 00:00:00');
    const boundsEndDate = new Date('2022-01-02 00:00:00');
    const viewportDuration = Interval.fromDateTimes(boundsStartDate, boundsEndDate).toDuration().minus({hours: 12});

    // skip the event for the setBounds
    visualSchedulerService.getTimescale$().pipe(skip(1), first()).subscribe(
      (timescale:Timescale) => {
        expect(timescale.boundsInterval.start).toEqual(DateTime.fromJSDate(boundsStartDate));
        expect(timescale.boundsInterval.end).toEqual(DateTime.fromJSDate(boundsEndDate));
        expect(timescale.visibleDuration.as('milliseconds')).toEqual(viewportDuration.as('milliseconds'));
        done();
      }
    );

    visualSchedulerService.setBounds(boundsStartDate, boundsEndDate);
    visualSchedulerService.setViewportDuration(viewportDuration);
  });

  it('VisualSchedulerService setViewportDuration() shouldnt be shorter than the minimum', (done: DoneFn) => {
    const boundsStartDate = new Date('2022-01-01 00:00:00');
    const boundsEndDate = new Date('2022-01-02 00:00:00');
    const viewportDuration =  VisualSchedulerService.MIN_VIEWPORT_DURATION.minus({seconds: 1});

    // skip the event for the setBounds
    visualSchedulerService.getTimescale$().pipe(skip(1), first()).subscribe(
      (timescale:Timescale) => {
        expect(timescale.boundsInterval.start).toEqual(DateTime.fromJSDate(boundsStartDate));
        expect(timescale.boundsInterval.end).toEqual(DateTime.fromJSDate(boundsEndDate));
        expect(timescale.visibleDuration.as('milliseconds')).toEqual(VisualSchedulerService.MIN_VIEWPORT_DURATION.as('milliseconds'));
        done();
      }
    );

    visualSchedulerService.setBounds(boundsStartDate, boundsEndDate);
    visualSchedulerService.setViewportDuration(viewportDuration);
  });

  it('VisualSchedulerService setViewportDuration() shouldnt be longer than the maximum', (done: DoneFn) => {
    const boundsStartDate = new Date('2022-01-01 00:00:00');
    const boundsEndDate = new Date('2022-01-08 00:00:00');
    const viewportDuration =  VisualSchedulerService.MAX_VIEWPORT_DURATION.plus({seconds: 1});

    // skip the event for the setBounds
    visualSchedulerService.getTimescale$().pipe(skip(1), first()).subscribe(
      (timescale:Timescale) => {
        expect(timescale.boundsInterval.start).toEqual(DateTime.fromJSDate(boundsStartDate));
        expect(timescale.boundsInterval.end).toEqual(DateTime.fromJSDate(boundsEndDate));
        expect(timescale.visibleDuration.as('milliseconds')).toEqual(VisualSchedulerService.MAX_VIEWPORT_DURATION.as('milliseconds'));
        done();
      }
    );

    visualSchedulerService.setBounds(boundsStartDate, boundsEndDate);
    visualSchedulerService.setViewportDuration(viewportDuration);
  });

  it('VisualSchedulerService setViewportDuration() shouldnt be longer than the scheduler bounds', (done: DoneFn) => {
    const boundsStartDate = new Date('2022-01-01 00:00:00');
    const boundsEndDate = new Date('2022-01-02 00:00:00');
    const boundsIntervalDuration = Interval.fromDateTimes(boundsStartDate, boundsEndDate).toDuration();
    const viewportDuration = boundsIntervalDuration.plus({seconds: 1});

    // skip the event for the setBounds
    visualSchedulerService.getTimescale$().pipe(skip(1), first()).subscribe(
      (timescale:Timescale) => {
        expect(timescale.boundsInterval.start).toEqual(DateTime.fromJSDate(boundsStartDate));
        expect(timescale.boundsInterval.end).toEqual(DateTime.fromJSDate(boundsEndDate));
        expect(timescale.visibleDuration.as('milliseconds')).toEqual(boundsIntervalDuration.as('milliseconds'));
        done();
      }
    );

    visualSchedulerService.setBounds(boundsStartDate, boundsEndDate);
    visualSchedulerService.setViewportDuration(viewportDuration);
  });

  it('VisualSchedulerService setBounds() the bounds interval must be at least the minimum viewport duration', () => {
    const boundsStartDate = new Date('2022-01-01 00:00:00');
    const boundsEndDate = new Date(boundsStartDate.getTime() + VisualSchedulerService.MIN_VIEWPORT_DURATION.minus({seconds: 1}).as('milliseconds'));
    expect(() => visualSchedulerService.setBounds(boundsStartDate, boundsEndDate))
    .toThrowMatching((thrown: TimescaleInvalid) => thrown.validatorCode === TimescaleValidatorErrorCode.BoundsIntervalTooShort);
  });

  it('VisualSchedulerService getAgendaItems$() should return the list of current agenda items any time an agendaItem is added', (done: DoneFn) => {
    const boundsStartDate = new Date('2022-01-01 00:00:00');
    const boundsEndDate = new Date('2022-01-02 00:00:00');
    const resourceName = 'resource';
    const channelName = 'channel';
    const label = 'label'
    const data = {label: label};

    visualSchedulerService.getAgendaItems$().pipe(first()).subscribe(
      (agendaItems:AgendaItem[]) => {
        expect(agendaItems).toBeTruthy();
        expect(agendaItems.length).toEqual(1);
        const agendaItem:AgendaItem = agendaItems[0];
        expect(agendaItem.resourceName).toEqual(resourceName);
        expect(agendaItem.channelName).toEqual(channelName);
        expect(agendaItem.startDate).toEqual(DateTime.fromJSDate(boundsStartDate));
        expect(agendaItem.endDate).toEqual(DateTime.fromJSDate(boundsEndDate));
        expect(agendaItem.label).toEqual(label);
        expect(agendaItem.data).toEqual(data);
        expect((agendaItem.data as {label: string}).label).toEqual(label);
        done();
      }
    );

    visualSchedulerService.setBounds(boundsStartDate, boundsEndDate);

    // TODO: the service doesn't actually know if a resource and channel exist, checking for an intersection initializes data behind
    // the scenes for the service to assume they exist.
    expect(visualSchedulerService.getIntersectingAgendaItems(resourceName, channelName, boundsStartDate, boundsEndDate)).toEqual([]);

    visualSchedulerService.addAgendaItem(resourceName, channelName, boundsStartDate, boundsEndDate, data, (data)=> data.label);
  });

})
