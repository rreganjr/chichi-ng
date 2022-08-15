import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Duration, Interval } from 'luxon';
import { first } from 'rxjs';
import { VisualSchedulerService } from '../../../visual-scheduler.service';
import { AgendaItem, AgendaItemLabeler } from '../agenda-item.model';
import { DndDropEvent } from 'ngx-drag-drop';

import { ChannelComponent, DropZoneAgendaItem } from './channel.component';
import { AgendaItemConflicts } from '../../../agenda-item-conflicts.error';

describe('ChannelComponent', () => {
  const resourceName: string = 'resource';
  const channelName: string = 'channel';
  const schedulerBoundsStartDate: Date = new Date('2021-05-01 00:00:00');
  const schedulerBoundsEndDate: Date = new Date('2021-05-08 00:00:00');
  const agendaItemBoundsStart: Date = new Date(schedulerBoundsStartDate.getTime() + 24 * 60 * 60 * 1000); // 24 hours from scheduler start
  const agendaItemBoundsEnd: Date = new Date(agendaItemBoundsStart.getTime() + (1 * 60 * 60 * 1000)); // one hour long
  const schedulerOffset: Duration = Duration.fromDurationLike({days: 2});
  const agendaItemData = {};
  const agendaItemLabeler:AgendaItemLabeler<any> = () => {return 'label'};

  let visualSchedulerService: VisualSchedulerService;

  let component: ChannelComponent;
  let fixture: ComponentFixture<ChannelComponent>;

  beforeEach(async () => {
    visualSchedulerService = new VisualSchedulerService();
    await TestBed.configureTestingModule({
      declarations: [ChannelComponent],
      providers: [{ provide: VisualSchedulerService, useValue: visualSchedulerService }]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChannelComponent);
    component = fixture.componentInstance;
    component.resourceName = resourceName;
    component.channelName = channelName;
    visualSchedulerService.setBounds(schedulerBoundsStartDate, schedulerBoundsEndDate);
    fixture.detectChanges();
  });

  it('should create a ChannelComponent', () => {
    expect(component).toBeTruthy();
  });

  it('setting bounds triggers timescale change causing channel to have a single drop zone spanning the bounds.', (done: DoneFn) => {
    component.visibleAgendaItems$?.subscribe((agendaItems:AgendaItem[]) => {
      expect(agendaItems.length).toEqual(1);
      const item:AgendaItem = agendaItems[0];
      expect(item instanceof DropZoneAgendaItem).toBeTrue();
      expect(item.bounds).toEqual(Interval.fromDateTimes(schedulerBoundsStartDate, schedulerBoundsEndDate));
      expect(item.resourceName).toEqual(resourceName);
      expect(item.channelName).toEqual(channelName);
      done();
    });
  });

  it('adding an agenda item for the full bounds causing channel to have a single agenda item spanning the bounds.', (done: DoneFn) => {
    visualSchedulerService.getIntersectingAgendaItems(resourceName, channelName, schedulerBoundsStartDate, schedulerBoundsEndDate); // makes the service assume it exists
    const testItem = visualSchedulerService.addAgendaItem(resourceName, channelName, schedulerBoundsStartDate, schedulerBoundsEndDate, {label: 'new item'}, (data:any)=>data.label);
    fixture.detectChanges();
    component.visibleAgendaItems$?.subscribe((agendaItems:AgendaItem[]) => {
      expect(agendaItems.length).toEqual(1);
      const item:AgendaItem = agendaItems[0];
      expect(item instanceof AgendaItem).toBeTrue();
      expect(item.id).toEqual(testItem.id);
      expect(item.bounds).toEqual(Interval.fromDateTimes(schedulerBoundsStartDate, schedulerBoundsEndDate));
      expect(item.resourceName).toEqual(resourceName);
      expect(item.channelName).toEqual(channelName);
      done();
    });
  });

  it('adding an agenda item for less than the full bounds causing channel to have a single agenda item and drop zones on either side.', (done: DoneFn) => {
    visualSchedulerService.getIntersectingAgendaItems(resourceName, channelName, schedulerBoundsStartDate, schedulerBoundsEndDate); // makes the service assume it exists
    const testItem = visualSchedulerService.addAgendaItem(resourceName, channelName, agendaItemBoundsStart, agendaItemBoundsEnd, {label: 'new item'}, (data:any)=>data.label);
    fixture.detectChanges();
    component.visibleAgendaItems$?.subscribe((agendaItems:AgendaItem[]) => {
      expect(agendaItems.length).toEqual(3);

      const dropZone1:AgendaItem = agendaItems[0];
      expect(dropZone1 instanceof DropZoneAgendaItem).toBeTrue();
      expect(dropZone1.bounds).toEqual(Interval.fromDateTimes(schedulerBoundsStartDate, agendaItemBoundsStart));
      expect(dropZone1.resourceName).toEqual(resourceName);
      expect(dropZone1.channelName).toEqual(channelName);

      const item:AgendaItem = agendaItems[1];
      expect(item instanceof AgendaItem).toBeTrue();
      expect(item.id).toEqual(testItem.id);
      expect(item.bounds).toEqual(Interval.fromDateTimes(agendaItemBoundsStart, agendaItemBoundsEnd));
      expect(item.resourceName).toEqual(resourceName);
      expect(item.channelName).toEqual(channelName);

      const dropZone2:AgendaItem = agendaItems[2];
      expect(dropZone2 instanceof DropZoneAgendaItem).toBeTrue();
      expect(dropZone2.bounds).toEqual(Interval.fromDateTimes(agendaItemBoundsEnd, schedulerBoundsEndDate));
      expect(dropZone2.resourceName).toEqual(resourceName);
      expect(dropZone2.channelName).toEqual(channelName);

      done();
    });
  });

  it('add more than one item and have one item before the visible duration', (done: DoneFn) => {
    visualSchedulerService.setViewportOffsetDuration(schedulerOffset);
    visualSchedulerService.getIntersectingAgendaItems(resourceName, channelName, schedulerBoundsStartDate, schedulerBoundsEndDate); // makes the service assume it exists
    const testItem = visualSchedulerService.addAgendaItem(resourceName, channelName, agendaItemBoundsStart, agendaItemBoundsEnd, {label: 'item1'}, (data:any)=>data.label);
    const testItem2 = visualSchedulerService.addAgendaItem(resourceName, channelName, agendaItemBoundsEnd, schedulerBoundsEndDate, {label: 'item2'}, (data:any)=>data.label);
    fixture.detectChanges();
    component.visibleAgendaItems$?.subscribe((agendaItems:AgendaItem[]) => {
      expect(agendaItems.length).toEqual(3);

      const dropZone1:AgendaItem = agendaItems[0];
      expect(dropZone1 instanceof DropZoneAgendaItem).toBeTrue();
      expect(dropZone1.bounds).toEqual(Interval.fromDateTimes(schedulerBoundsStartDate, agendaItemBoundsStart));
      expect(dropZone1.resourceName).toEqual(resourceName);
      expect(dropZone1.channelName).toEqual(channelName);

      const item:AgendaItem = agendaItems[1];
      expect(item instanceof AgendaItem).toBeTrue();
      expect(item.id).toEqual(testItem.id);
      expect(item.bounds).toEqual(Interval.fromDateTimes(agendaItemBoundsStart, agendaItemBoundsEnd));
      expect(item.resourceName).toEqual(resourceName);
      expect(item.channelName).toEqual(channelName);

      const item2:AgendaItem = agendaItems[2];
      expect(item2 instanceof AgendaItem).toBeTrue();
      expect(item2.id).toEqual(testItem2.id);
      expect(item2.bounds).toEqual(Interval.fromDateTimes(agendaItemBoundsEnd, schedulerBoundsEndDate));
      expect(item2.resourceName).toEqual(resourceName);
      expect(item2.channelName).toEqual(channelName);

      done();
    });
  });

  it('onDrop should cause a new agenda item to be added', (done: DoneFn) => {
    const eventType = 'drag';
     visualSchedulerService.getAgendaItems$().pipe(first()).subscribe(
      (agendaItems:AgendaItem[]) => {
        expect(agendaItems.length).toEqual(1);
        const item:AgendaItem = agendaItems[0];
        expect(item instanceof AgendaItem).toBeTrue();
        expect(item.bounds).toEqual(Interval.fromDateTimes(agendaItemBoundsStart, agendaItemBoundsEnd));
        expect(item.resourceName).toEqual(resourceName);
        expect(item.channelName).toEqual(channelName);
        done();
      }
    );

    component.onDrop(
      {event: new DragEvent(eventType), dropEffect: 'copy', isExternal: true},
      new AgendaItem(resourceName, channelName, Interval.fromDateTimes(agendaItemBoundsStart, agendaItemBoundsEnd), agendaItemData, agendaItemLabeler)
    );
  });

  it('onDrop over an existing item, note this shouldnt happen as drop only works over drop zones', () => {
    const eventType = 'drag';
    visualSchedulerService.getIntersectingAgendaItems(resourceName, channelName, schedulerBoundsStartDate, schedulerBoundsEndDate); // makes the service assume it exists
    const testItem = visualSchedulerService.addAgendaItem(resourceName, channelName, agendaItemBoundsStart, agendaItemBoundsEnd, {label: 'item1'}, (data:any)=>data.label);
    fixture.detectChanges();

    expect(() => component.onDrop(
      {event: new DragEvent(eventType), dropEffect: 'copy', isExternal: true},
      new AgendaItem(resourceName, channelName, Interval.fromDateTimes(agendaItemBoundsStart, agendaItemBoundsEnd), agendaItemData, agendaItemLabeler)
    ))
    .toThrowMatching((thrown: AgendaItemConflicts) => (
      thrown.conflictingInterval.equals(Interval.fromDateTimes(agendaItemBoundsStart, agendaItemBoundsEnd)) &&
      thrown.conflictingItems.length === 1 &&
      thrown.conflictingItems[0].id === testItem.id
    ));
  });
});
