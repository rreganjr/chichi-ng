import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Duration, Interval } from 'luxon';
import { first, skip } from 'rxjs';
import { Timescale } from '../../../timescale.model';
import { ToolEvent } from '../../../toolbox/tool/tool-event.model';
import { VisualSchedulerService } from '../../../visual-scheduler.service';

import { AgendaItemComponent } from './agenda-item.component';

describe('AgendaItemComponent', () => {
  const resourceName: string = 'resource';
  const channelName: string = 'channel';
  const schedulerBoundsStartDate: Date = new Date('2021-05-01 00:00:00');
  const schedulerBoundsEndDate: Date = new Date('2021-05-08 00:00:00');
  const agendaItemBoundsStart: Date = new Date(schedulerBoundsStartDate.getTime() + 24 * 60 * 60 * 1000); // 24 hours from scheduler start
  const agendaItemBoundsEnd: Date = new Date(agendaItemBoundsStart.getTime() + (1 * 60 * 60 * 1000)); // one hour long
  let visualSchedulerService: VisualSchedulerService;

  let component: AgendaItemComponent;
  let fixture: ComponentFixture<AgendaItemComponent>;

  beforeEach(async () => {
    visualSchedulerService = new VisualSchedulerService();
    await TestBed.configureTestingModule({
      declarations: [AgendaItemComponent],
      providers: [{ provide: VisualSchedulerService, useValue: visualSchedulerService }]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AgendaItemComponent);
    component = fixture.componentInstance;
    visualSchedulerService.setBounds(schedulerBoundsStartDate, schedulerBoundsEndDate);
    visualSchedulerService.getIntersectingAgendaItems(resourceName, channelName, schedulerBoundsStartDate, schedulerBoundsEndDate); // makes the service assume it exists
    component.agendaItem = visualSchedulerService.addAgendaItem(resourceName, channelName, agendaItemBoundsStart, agendaItemBoundsEnd, {label: 'new item'}, (data:any)=>data.label);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not be visible because the default visibleOffset is 0 hours and the viewportDuration is 3 hours', (done: DoneFn) => {
    fixture.detectChanges();
    visualSchedulerService.getTimescale$().pipe(first()).subscribe(
      (timescale:Timescale) => {
        expect(fixture.debugElement.nativeElement.style.display).toEqual('none');
        done();
      }
    );
  });

  it('should be fully visible, display should be block and left should be 0% when the element is at the left edge of visible', (done: DoneFn) => {
    const viewportDuration = Duration.fromDurationLike({hours: 3});
    const offsetDuration = Interval.fromDateTimes(schedulerBoundsStartDate, agendaItemBoundsStart).toDuration();
    visualSchedulerService.getTimescale$().pipe(skip(2), first()).subscribe(
      (timescale:Timescale) => {
        expect(fixture.debugElement.nativeElement.style.display).toEqual('block');
        expect(fixture.debugElement.nativeElement.style.left).toEqual('0%');
        let percentOfVisibleTimelineBounds = `${( component.agendaItem.bounds.toDuration().as('seconds') / timescale.visibleTimelineBounds.toDuration().as('seconds')) * 100}%`;
        expect(fixture.debugElement.nativeElement.style.width).toEqual(percentOfVisibleTimelineBounds);
        done();
      }
    );
    visualSchedulerService.setViewportDuration(viewportDuration);
    // when the next line executes the test agenda item should be visible and the
    // timescale observer above should match the native element in the view
    visualSchedulerService.setViewportOffsetDuration(offsetDuration);
    fixture.detectChanges();
  });

  it('should be fully visible, display should be block and left should be off the edge by an hour', (done: DoneFn) => {
    const viewportDuration = Duration.fromDurationLike({hours: 3});
    const offsetDuration = Interval.fromDateTimes(schedulerBoundsStartDate, agendaItemBoundsStart).toDuration().minus({hours: 1});
    visualSchedulerService.getTimescale$().pipe(skip(2), first()).subscribe(
      (timescale:Timescale) => {
        expect(fixture.debugElement.nativeElement.style.display).toEqual('block');
        let leftPercentOfVisibleTimelineBounds = `${(Duration.fromDurationLike({hours: 1}).as('seconds') / timescale.visibleTimelineBounds.toDuration().as('seconds')) * 100}%`;
        expect(fixture.debugElement.nativeElement.style.left).toEqual(leftPercentOfVisibleTimelineBounds);
        let percentOfWidthOfVisibleTimelineBounds = `${( component.agendaItem.bounds.toDuration().as('seconds') / timescale.visibleTimelineBounds.toDuration().as('seconds')) * 100}%`;
        expect(fixture.debugElement.nativeElement.style.width).toEqual(percentOfWidthOfVisibleTimelineBounds);
        done();
      }
    );
    visualSchedulerService.setViewportDuration(viewportDuration);
    // when the next line executes the test agenda item should be visible and the
    // timescale observer above should match the native element in the view
    visualSchedulerService.setViewportOffsetDuration(offsetDuration);
    fixture.detectChanges();
  });

  it('should be partially visible display should be block and left should be at the edge', (done: DoneFn) => {
    const viewportDuration = Duration.fromDurationLike({hours: 3});
    const offsetDuration = Interval.fromDateTimes(schedulerBoundsStartDate, agendaItemBoundsStart).toDuration().plus({minutes: 30});
    visualSchedulerService.getTimescale$().pipe(skip(2), first()).subscribe(
      (timescale:Timescale) => {
        expect(fixture.debugElement.nativeElement.style.display).toEqual('block');
        expect(fixture.debugElement.nativeElement.style.left).toEqual('0%');
        const visibleAgendaItemBounds: Interval|null = timescale.visibleTimelineBounds.intersection(component.agendaItem.bounds);
        let percentOfWidthOfVisibleTimelineBounds = `${(visibleAgendaItemBounds !== null?(visibleAgendaItemBounds.toDuration().as('seconds') / timescale.visibleTimelineBounds.toDuration().as('seconds')):0) * 100}%`;
        expect(fixture.debugElement.nativeElement.style.width).toEqual(percentOfWidthOfVisibleTimelineBounds);
        done();
      }
    );
    visualSchedulerService.setViewportDuration(viewportDuration);
    // when the next line executes the test agenda item should be partially visible and the
    // timescale observer above should match the native element in the view
    visualSchedulerService.setViewportOffsetDuration(offsetDuration);
    fixture.detectChanges();
  });

  it('onOpen should fire an EDIT event', (done: DoneFn) => {
    const eventType = 'click';
    // skip the first event which is always a ToolEvent.CLEAR
    visualSchedulerService.getToolEvents$().pipe(skip(1), first()).subscribe(
      (toolEvent:ToolEvent) => {
        expect(toolEvent.isEdit()).toBeTrue();
        expect(toolEvent.agendaItem).toEqual(component.agendaItem);
        expect(toolEvent.toolType).toEqual(channelName);
        expect(toolEvent.event?.type).toEqual(eventType);
        done();
      }
    );
    component.onOpen(
      new Event(eventType)
    );
  });

  it('onDelete should remove the agendaItem from the scheduler and fire a DELETE event', (done: DoneFn) => {
    const eventType = 'click';
    // skip the first event which is always a ToolEvent.CLEAR
    visualSchedulerService.getToolEvents$().pipe(skip(1), first()).subscribe(
      (toolEvent:ToolEvent) => {
        expect(toolEvent.isDelete()).toBeTrue();
        expect(toolEvent.agendaItem).toEqual(component.agendaItem);
        expect(toolEvent.toolType).toEqual(channelName);
        expect(toolEvent.event).toBeNull();
        done();
      }
    );
    // the item should exist before the delete
    expect(visualSchedulerService.getAgendaItemById(component.agendaItem.id)).toBeTruthy();
    component.onDelete(new Event(eventType));
    expect(visualSchedulerService.getAgendaItemById(component.agendaItem.id)).toBeUndefined();
  });

  // TODO: DOM based testing inside a host channel
});
