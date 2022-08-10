import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Duration, Interval } from 'luxon';
import { first, skip } from 'rxjs';
import { Timescale } from '../../../timescale.model';
import { ToolEvent } from '../../../toolbox/tool/tool-event.model';
import { VisualSchedulerService } from '../../../visual-scheduler.service';
import { DropZoneAgendaItem } from '../channel/channel.component';

import { DropZoneComponent } from './drop-zone.component';

describe('DropZoneComponent', () => {
  const resourceName: string = 'resource';
  const channelName: string = 'channel';
  const toolType: string = channelName;
  const differentToolType: string = `not-${toolType}`;
  const schedulerBoundsStartDate: Date = new Date('2021-05-01 00:00:00');
  const schedulerBoundsEndDate: Date = new Date('2021-05-08 00:00:00');
  const dropZoneBoundsStart: Date = new Date(schedulerBoundsStartDate.getTime() + 24 * 60 * 60 * 1000); // 24 hours from scheduler start
  const dropZoneBoundsEnd: Date = new Date(dropZoneBoundsStart.getTime() + (1 * 60 * 60 * 1000)); // one hour long
  let visualSchedulerService: VisualSchedulerService;

  let component: DropZoneComponent;
  let fixture: ComponentFixture<DropZoneComponent>;

  beforeEach(async () => {
    visualSchedulerService = new VisualSchedulerService();
    await TestBed.configureTestingModule({
      declarations: [ DropZoneComponent ],
      providers: [{ provide: VisualSchedulerService, useValue: visualSchedulerService }]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DropZoneComponent);
    component = fixture.componentInstance;
    visualSchedulerService.setBounds(schedulerBoundsStartDate, schedulerBoundsEndDate);
    visualSchedulerService.getIntersectingAgendaItems(resourceName, channelName, schedulerBoundsStartDate, schedulerBoundsEndDate); // makes the service assume it exists
    component.agendaItem = new DropZoneAgendaItem(resourceName, channelName, Interval.fromDateTimes(dropZoneBoundsStart, dropZoneBoundsEnd));
    component.isDragging = false;
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
    const offsetDuration = Interval.fromDateTimes(schedulerBoundsStartDate, dropZoneBoundsStart).toDuration();
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
    const offsetDuration = Interval.fromDateTimes(schedulerBoundsStartDate, dropZoneBoundsStart).toDuration().minus({hours: 1});
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
    const offsetDuration = Interval.fromDateTimes(schedulerBoundsStartDate, dropZoneBoundsStart).toDuration().plus({minutes: 30});
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

  it('when a tool that matches the channel is dragged', (done: DoneFn) => {
    const eventType = 'dragstart';
    // skip the first event which is always a ToolEvent.CLEAR
    visualSchedulerService.getToolEvents$().pipe(skip(1), first()).subscribe(
      (toolEvent:ToolEvent) => {
        // verify the expected event from the tool
        expect(toolEvent.isStart()).toBeTrue();
        expect(toolEvent.toolType).toEqual(toolType);
        expect(toolEvent.event?.type).toEqual(eventType);
        expect(component.isDragging).toBeTrue();
        done();
      }
    );
    // before dragging starts
    expect(component.isDragging).toBeFalse();

    // simulate a tool onDragStart
    visualSchedulerService.dragStart(new DragEvent(eventType),toolType)
  });

  it('when a tool that matches the channel is dropped, isDragging should revert to false', (done: DoneFn) => {
    const eventType = 'dragstart';
    // skip the first event which is always a ToolEvent.CLEAR then look for drag start
    visualSchedulerService.getToolEvents$().pipe(skip(1), first()).subscribe(
      (toolEvent:ToolEvent) => {
        // verify the expected event from the tool
        expect(toolEvent.isStart()).toBeTrue();
        expect(toolEvent.toolType).toEqual(toolType);
        expect(toolEvent.event?.type).toEqual(eventType);
        expect(component.isDragging).toBeTrue();
      }
    );
    // skip the first event which is always a ToolEvent.CLEAR and skip the drag start
    visualSchedulerService.getToolEvents$().pipe(skip(2), first()).subscribe(
      (toolEvent:ToolEvent) => {
        // verify the expected event from the tool
        expect(toolEvent.isEnd()).toBeTrue();
        expect(toolEvent.toolType).toEqual(toolType);
        expect(toolEvent.event?.type).toEqual(eventType);
        expect(component.isDragging).toBeFalse();
        done();
      }
    );

    // before dragging starts
    expect(component.isDragging).toBeFalse();

    // simulate a tool onDragStart() and onDragEnd()
    visualSchedulerService.dragStart(new DragEvent(eventType),toolType)
    visualSchedulerService.dragEnd(new DragEvent(eventType),toolType)
  });

});
