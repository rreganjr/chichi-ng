import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DateTime, Duration, Interval } from 'luxon';
import { first, skip } from 'rxjs';
import { Timescale } from '../timescale.model';
import { VisualSchedulerService } from '../visual-scheduler.service';

import { TimescaleComponent } from './timescale.component';

describe('TimescaleComponent', () => {
  const resourceName: string = 'resource';
  const channelName: string = 'channel';
  const schedulerBoundsStartDate: Date = new Date('2021-05-01 00:00:00');
  const schedulerBoundsEndDate: Date = new Date('2021-05-08 00:00:00');
  let visualSchedulerService: VisualSchedulerService;

  let component: TimescaleComponent;
  let fixture: ComponentFixture<TimescaleComponent>;


  beforeEach(async () => {
    visualSchedulerService = new VisualSchedulerService();
    await TestBed.configureTestingModule({
      declarations: [TimescaleComponent],
      providers: [{ provide: VisualSchedulerService, useValue: visualSchedulerService }]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TimescaleComponent);
    component = fixture.componentInstance;

    visualSchedulerService.setBounds(schedulerBoundsStartDate, schedulerBoundsEndDate);
    visualSchedulerService.getIntersectingAgendaItems(resourceName, channelName, schedulerBoundsStartDate, schedulerBoundsEndDate); // makes the service assume it exists

    fixture.detectChanges();
  });

  it('should create a TimescaleComponent', () => {
    expect(component).toBeTruthy();
  });

  it('if the viewport is at the minimum size it should stay the same on zoomIn', (done: DoneFn) => {
    const viewportDuration = TimescaleComponent.VIEWPORT_SIZES[0];
    const offsetDuration = Duration.fromDurationLike({hours: 0});

    visualSchedulerService.getTimescale$().pipe(skip(2), first()).subscribe({ next:
      (timescale:Timescale) => {
        // zoom in makes the viewport show a smaller timespan
        const newViewPortDuration: Duration = timescale.visibleDuration;
        let newIndex: number = TimescaleComponent.VIEWPORT_SIZES.indexOf(newViewPortDuration);
        expect(newIndex).toEqual(0);
        done();
      }
    });
    visualSchedulerService.setViewportDuration(viewportDuration);
    visualSchedulerService.setViewportOffsetDuration(offsetDuration);

    component.zoomIn();
  });

  it('if the viewport is not at the minimum size it should bet set to the next lower level on zoomIn', (done: DoneFn) => {
    const viewportDuration = TimescaleComponent.VIEWPORT_SIZES[2];
    const offsetDuration = Duration.fromDurationLike({hours: 0});

    visualSchedulerService.getTimescale$().pipe(skip(2), first()).subscribe({ next:
      (timescale:Timescale) => {
        // zoom in makes the viewport show a smaller timespan
        const newViewPortDuration: Duration = timescale.visibleDuration;
        let newIndex: number = TimescaleComponent.VIEWPORT_SIZES.indexOf(newViewPortDuration);
        expect(newIndex).toEqual(1);
        done();
      }
    });
    visualSchedulerService.setViewportDuration(viewportDuration);
    visualSchedulerService.setViewportOffsetDuration(offsetDuration);

    component.zoomIn();
  });

  it('if the viewport is at the maximum size it should stay the same on zoomOut', (done: DoneFn) => {
    const viewportDuration = TimescaleComponent.VIEWPORT_SIZES[TimescaleComponent.VIEWPORT_SIZES.length-1];
    const offsetDuration = Duration.fromDurationLike({hours: 0});

    visualSchedulerService.getTimescale$().pipe(skip(2), first()).subscribe({ next:
      (timescale:Timescale) => {
        // zoom out makes the viewport show a larger timespan
        const newViewPortDuration: Duration = timescale.visibleDuration;
        let newIndex: number = TimescaleComponent.VIEWPORT_SIZES.indexOf(newViewPortDuration);
        expect(newIndex).toEqual(TimescaleComponent.VIEWPORT_SIZES.length-1);
        done();
      }
    });
    visualSchedulerService.setViewportDuration(viewportDuration);
    visualSchedulerService.setViewportOffsetDuration(offsetDuration);

    component.zoomOut();
  });

  it('if the viewport is not at the maximum size it should bet set to the next higher level on zoomOut', (done: DoneFn) => {
    const viewportDuration = TimescaleComponent.VIEWPORT_SIZES[0];
    const offsetDuration = Duration.fromDurationLike({hours: 0});

    visualSchedulerService.getTimescale$().pipe(skip(2), first()).subscribe({ next:
      (timescale:Timescale) => {
        // zoom out makes the viewport show a larger timespan
        const newViewPortDuration: Duration = timescale.visibleDuration;
        let newIndex: number = TimescaleComponent.VIEWPORT_SIZES.indexOf(newViewPortDuration);
        expect(newIndex).toEqual(1);
        done();
      }
    });
    visualSchedulerService.setViewportDuration(viewportDuration);
    visualSchedulerService.setViewportOffsetDuration(offsetDuration);

    component.zoomOut();
  });

  it('if the viewport is set to a specific size by index in a valid range', (done: DoneFn) => {
    const viewportDuration = TimescaleComponent.VIEWPORT_SIZES[0];
    const offsetDuration = Duration.fromDurationLike({hours: 0});
    const zoomToIndex: number = 3

    visualSchedulerService.getTimescale$().pipe(skip(2), first()).subscribe({ next:
      (timescale:Timescale) => {
        // zoom out makes the viewport show a larger timespan
        const newViewPortDuration: Duration = timescale.visibleDuration;
        let newIndex: number = TimescaleComponent.VIEWPORT_SIZES.indexOf(newViewPortDuration);
        expect(newIndex).toEqual(zoomToIndex);
        done();
      }
    });
    visualSchedulerService.setViewportDuration(viewportDuration);
    visualSchedulerService.setViewportOffsetDuration(offsetDuration);

    component.zoomTo(zoomToIndex);
  });

  // TODO: test zooming to an invalid index won't change the viewport

  it('if the offset is at the minimum offset it should stay the same on scanBack', (done: DoneFn) => {
    const viewportDuration = TimescaleComponent.VIEWPORT_SIZES[0];
    const offsetDuration = Duration.fromDurationLike({hours: 0});

    visualSchedulerService.getTimescale$().pipe(skip(2), first()).subscribe({ next:
      (timescale:Timescale) => {
        const newOffsettDuration: Duration = timescale.offsetDuration;
        expect(newOffsettDuration).toEqual(offsetDuration);
        done();
      }
    });
    visualSchedulerService.setViewportDuration(viewportDuration);
    visualSchedulerService.setViewportOffsetDuration(offsetDuration);

    component.scanBack();
  });

  it('if the offset is not at the minimum offset it should reset to 0 on scanBack if the viewport size is greater than or equal to the original offset', (done: DoneFn) => {
    const viewportDuration = TimescaleComponent.VIEWPORT_SIZES[0];
    const offsetDuration = Duration.fromDurationLike({hours: 1});

    visualSchedulerService.getTimescale$().pipe(skip(2), first()).subscribe({ next:
      (timescale:Timescale) => {
        const newOffsettDuration: Duration = timescale.offsetDuration;
        expect(newOffsettDuration).toEqual(Duration.fromDurationLike({hours: 0}));
        done();
      }
    });
    visualSchedulerService.setViewportDuration(viewportDuration);
    visualSchedulerService.setViewportOffsetDuration(offsetDuration);

    component.scanBack();
  });

  it('if the offset is not at the minimum offset it should move back by the viewport duration on scanBack if the viewport size is greater than the original offset', (done: DoneFn) => {
    const viewportDuration = TimescaleComponent.VIEWPORT_SIZES[0];
    const offsetDuration = Duration.fromDurationLike({hours: 12});

    visualSchedulerService.getTimescale$().pipe(skip(2), first()).subscribe({ next:
      (timescale:Timescale) => {
        const newOffsettDuration: Duration = timescale.offsetDuration;
        expect(newOffsettDuration).toEqual(offsetDuration.minus(viewportDuration));
        done();
      }
    });
    visualSchedulerService.setViewportDuration(viewportDuration);
    visualSchedulerService.setViewportOffsetDuration(offsetDuration);

    component.scanBack();
  });

  it('if the offset is at the maximum offset it should stay the same on scanForward', (done: DoneFn) => {
    const viewportDuration = TimescaleComponent.VIEWPORT_SIZES[0];
    const offsetDuration:Duration = Interval.fromDateTimes(schedulerBoundsStartDate,
      DateTime.fromJSDate(schedulerBoundsEndDate).minus(viewportDuration)).toDuration();


    visualSchedulerService.getTimescale$().pipe(skip(2), first()).subscribe({ next:
      (timescale:Timescale) => {
        const newOffsettDuration: Duration = timescale.offsetDuration;
        expect(newOffsettDuration).toEqual(offsetDuration);
        done();
      }
    });
    visualSchedulerService.setViewportDuration(viewportDuration);
    visualSchedulerService.setViewportOffsetDuration(offsetDuration);

    component.scanForward();
  });

  it('if the offset is not at the maximum offset it should set to the maximum offset on scanForward if the viewport size is greater than or equal to the original offset', (done: DoneFn) => {
    const viewportDuration = TimescaleComponent.VIEWPORT_SIZES[0];
    const maximumOffset:Duration = Interval.fromDateTimes(schedulerBoundsStartDate,
      DateTime.fromJSDate(schedulerBoundsEndDate).minus(viewportDuration)).toDuration();
    const offsetDuration = maximumOffset.minus(Duration.fromDurationLike({hours: 1}));

    visualSchedulerService.getTimescale$().pipe(skip(2), first()).subscribe({ next:
      (timescale:Timescale) => {
        const newOffsettDuration: Duration = timescale.offsetDuration;
        expect(newOffsettDuration).toEqual(maximumOffset);
        done();
      }
    });
    visualSchedulerService.setViewportDuration(viewportDuration);
    visualSchedulerService.setViewportOffsetDuration(offsetDuration);

    component.scanForward();
  });

  it('if the offset is not at the maximum offset and the viewport size is less than the duration between the current and maximum offset the new offset should be the viewport size plus the original offset', (done: DoneFn) => {
    const viewportDuration = TimescaleComponent.VIEWPORT_SIZES[0];
    const maximumOffset:Duration = Interval.fromDateTimes(schedulerBoundsStartDate,
      DateTime.fromJSDate(schedulerBoundsEndDate).minus(viewportDuration)).toDuration();
    const offsetDuration = maximumOffset.minus(viewportDuration).minus(viewportDuration);

    visualSchedulerService.getTimescale$().pipe(skip(2), first()).subscribe({ next:
      (timescale:Timescale) => {
        const newOffsettDuration: Duration = timescale.offsetDuration;
        expect(newOffsettDuration).toEqual(maximumOffset.minus(viewportDuration));
        done();
      }
    });
    visualSchedulerService.setViewportDuration(viewportDuration);
    visualSchedulerService.setViewportOffsetDuration(offsetDuration);

    component.scanForward();
  });

});
