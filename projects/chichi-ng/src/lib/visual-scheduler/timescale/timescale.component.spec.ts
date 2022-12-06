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
  const schedulerBounds: Duration = Interval.fromDateTimes(schedulerBoundsStartDate, schedulerBoundsEndDate).toDuration();
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
    visualSchedulerService.getIntersectingAgendaItems(resourceName, channelName, schedulerBoundsStartDate, schedulerBoundsEndDate); // makes the service assume resource/channel exists

    fixture.detectChanges();
  });

  it('should create a TimescaleComponent', () => {
    expect(component).toBeTruthy();
  });

  it('if the viewport is at the minimum size it should stay the same on zoomIn', (done: DoneFn) => {
    const viewportDuration = TimescaleComponent.VIEWPORT_SIZES[0];
    const offsetDuration = Duration.fromDurationLike({hours: 0});

    let timeScaleChangeCount: number = 0
    visualSchedulerService.getTimescale$().subscribe({ next:
      (timescale:Timescale) => {
        switch (timeScaleChangeCount) {
          case 0:
            // initial setup
            expect(timescale.visibleDuration).toEqual(Timescale.DEFAULT_VISIBLE_DURATION);
            expect(timescale.offsetDuration).toEqual(Timescale.DEFAULT_OFFSET_DURATION);
            break;
          case 1:
            // setViewportDuration()
            expect(timescale.visibleDuration).toEqual(viewportDuration);
            expect(timescale.offsetDuration.as('seconds')).toEqual(offsetDuration.as('seconds'));
            break;

          // setViewportOffsetDuration() has no effect when the value doesn't change

          case 2:
            // zoomIn() setViewportDuration() is called even though the viewportDuration didn't change
            expect(timescale.visibleDuration).toEqual(viewportDuration);
            expect(timescale.offsetDuration.as('seconds')).toEqual(offsetDuration.as('seconds'));
            break;
        }
        timeScaleChangeCount++;
      },
      complete: () => {
        console.log(`service viewportDuration ${visualSchedulerService.timescale?.visibleDuration.as('seconds')}`)
        expect(visualSchedulerService.timescale?.visibleDuration.as('seconds')).toEqual(viewportDuration.as('seconds'));
        done();
      }
    });
    visualSchedulerService.setViewportDuration(viewportDuration); // does cause a timescale change event
    visualSchedulerService.setViewportOffsetDuration(offsetDuration); // doesn't cause a timescale change event
    component.zoomIn(); // does cause a timescale change event
    visualSchedulerService.shutdown();
  });

  it('if the viewport is not at the minimum size it should bet set to the next lower level on zoomIn', (done: DoneFn) => {
    const viewportDuration = TimescaleComponent.VIEWPORT_SIZES[2];
    const offsetDuration = Duration.fromDurationLike({hours: 0});

    let timeScaleChangeCount: number = 0
    visualSchedulerService.getTimescale$().subscribe({ next:
      (timescale:Timescale) => {
        switch (timeScaleChangeCount) {
          case 0:
            // initial setup
            expect(timescale.visibleDuration).toEqual(Timescale.DEFAULT_VISIBLE_DURATION);
            expect(timescale.offsetDuration).toEqual(Timescale.DEFAULT_OFFSET_DURATION);
            break;
          case 1:
            // setViewportDuration()
            expect(timescale.visibleDuration).toEqual(viewportDuration);
            expect(timescale.offsetDuration.as('seconds')).toEqual(offsetDuration.as('seconds'));
            break;

          // setViewportOffsetDuration() has no effect when the value doesn't change

          case 2:
            // zoom in makes the viewport show a smaller timespan
            const newViewPortDuration: Duration = timescale.visibleDuration;
            let newIndex: number = TimescaleComponent.VIEWPORT_SIZES.indexOf(newViewPortDuration);
            expect(newIndex).toEqual(1);
        }
        timeScaleChangeCount++;
      },
      complete: () => {
        console.log(`shutdown`);
        done();
      }
    });

    visualSchedulerService.setViewportDuration(viewportDuration);
    visualSchedulerService.setViewportOffsetDuration(offsetDuration);
    component.zoomIn();
    visualSchedulerService.shutdown();
  });

  it('if the viewport is at the maximum size it should stay the same on zoomOut', (done: DoneFn) => {
    const viewportDuration = TimescaleComponent.VIEWPORT_SIZES[TimescaleComponent.VIEWPORT_SIZES.length-1];
    const offsetDuration = Duration.fromDurationLike({hours: 0});

    let timeScaleChangeCount: number = 0
    visualSchedulerService.getTimescale$().subscribe({ next:
      (timescale:Timescale) => {
        switch (timeScaleChangeCount) {
          case 0:
            // initial setup
            expect(timescale.visibleDuration).toEqual(Timescale.DEFAULT_VISIBLE_DURATION);
            expect(timescale.offsetDuration).toEqual(Timescale.DEFAULT_OFFSET_DURATION);
            break;
          case 1:
            // setViewportDuration()
            expect(timescale.visibleDuration).toEqual(viewportDuration);
            expect(timescale.offsetDuration.as('seconds')).toEqual(offsetDuration.as('seconds'));
            break;

          // setViewportOffsetDuration() has no effect when the value doesn't change

          case 2:
            // zoomOut() when the viewPortDuration is at the max, stays the same.
            const newViewPortDuration: Duration = timescale.visibleDuration;
            let newIndex: number = TimescaleComponent.VIEWPORT_SIZES.indexOf(newViewPortDuration);
            expect(newIndex).toEqual(TimescaleComponent.VIEWPORT_SIZES.length-1);
        }
        timeScaleChangeCount++;
      },
      complete: () => {
        console.log(`shutdown`);
        done();
      }
    });

    visualSchedulerService.setViewportDuration(viewportDuration);
    visualSchedulerService.setViewportOffsetDuration(offsetDuration);
    component.zoomOut();
    visualSchedulerService.shutdown();
  });

  it('if the viewport would grow larger than the schedulerBounds it should stay the same size', (done: DoneFn) => {
    const sizeIndex: number = 2;
    const viewportDuration = TimescaleComponent.VIEWPORT_SIZES[sizeIndex];
    const offsetDuration = Duration.fromDurationLike({hours: 0});
    const schedulerBoundsEndDate: DateTime = DateTime.fromJSDate(schedulerBoundsStartDate).plus(viewportDuration).plus({hours: 1})
    const schedulerBoundsInterval: Interval = Interval.fromDateTimes(schedulerBoundsStartDate, schedulerBoundsEndDate);

    let timeScaleChangeCount: number = 0
    visualSchedulerService.getTimescale$().subscribe({ next:
      (timescale:Timescale) => {
        switch (timeScaleChangeCount) {
          case 0:
            // initial setup
            expect(timescale.visibleDuration).toEqual(Timescale.DEFAULT_VISIBLE_DURATION);
            expect(timescale.offsetDuration).toEqual(Timescale.DEFAULT_OFFSET_DURATION);
            break;
          case 1:
            // setBounds()
            expect(timescale.boundsInterval).toEqual(schedulerBoundsInterval);
            break;
          case 2:
            // setViewportDuration()
            expect(timescale.visibleDuration).toEqual(viewportDuration);
            expect(timescale.offsetDuration.as('seconds')).toEqual(offsetDuration.as('seconds'));
            break;

          // setViewportOffsetDuration() has no effect when the value doesn't change

          case 3:
            // zoomOut() when the viewPortDuration would grow larger than the boundsInterval, should stay the same.
            const newViewPortDuration: Duration = timescale.visibleDuration;
            let newIndex: number = TimescaleComponent.VIEWPORT_SIZES.indexOf(newViewPortDuration);
            expect(newIndex).toEqual(sizeIndex);
        }
        timeScaleChangeCount++;
      },
      complete: () => {
        console.log(`shutdown`);
        done();
      }
    });

    visualSchedulerService.setBounds(schedulerBoundsStartDate, schedulerBoundsEndDate);
    visualSchedulerService.setViewportDuration(viewportDuration);
    visualSchedulerService.setViewportOffsetDuration(offsetDuration);
    component.zoomOut();
    visualSchedulerService.shutdown();
  });

  it('if the viewport is not at the maximum size it should bet set to the next higher level on zoomOut', (done: DoneFn) => {
    const viewportDuration = TimescaleComponent.VIEWPORT_SIZES[0];
    const offsetDuration = Duration.fromDurationLike({hours: 0});

    let timeScaleChangeCount: number = 0
    visualSchedulerService.getTimescale$().subscribe({ next:
      (timescale:Timescale) => {
        switch (timeScaleChangeCount) {
          case 0:
            // initial setup
            expect(timescale.visibleDuration).toEqual(Timescale.DEFAULT_VISIBLE_DURATION);
            expect(timescale.offsetDuration).toEqual(Timescale.DEFAULT_OFFSET_DURATION);
            break;
          case 1:
            // setViewportDuration()
            expect(timescale.visibleDuration).toEqual(viewportDuration);
            expect(timescale.offsetDuration.as('seconds')).toEqual(offsetDuration.as('seconds'));
            break;

          // setViewportOffsetDuration() has no effect when the value doesn't change

          case 2:
            // zoomOut() makes the viewport show a larger timespan
            const newViewPortDuration: Duration = timescale.visibleDuration;
            let newIndex: number = TimescaleComponent.VIEWPORT_SIZES.indexOf(newViewPortDuration);
            expect(newIndex).toEqual(1);

          }
        timeScaleChangeCount++;
      },
      complete: () => {
        console.log(`shutdown`);
        done();
      }
    });

    visualSchedulerService.getTimescale$().pipe(skip(2), first()).subscribe({ next:
      (timescale:Timescale) => {
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

    visualSchedulerService.getTimescale$().pipe(skip(2)).subscribe({ complete:
      () => {
        console.log(`service offsetDuration ${visualSchedulerService.timescale?.offsetDuration.as('seconds')} offsetDuration = ${offsetDuration.as('seconds')}`)
        expect(visualSchedulerService.timescale?.offsetDuration.as('seconds')).toEqual(offsetDuration.as('seconds'));
        done();
      }
    });
    visualSchedulerService.setViewportDuration(viewportDuration);
    visualSchedulerService.setViewportOffsetDuration(offsetDuration);

    component.scanBack(); // this doesn't cause the timescale to update

    visualSchedulerService.shutdown(); // this causes the timescale observable to be marked complete
  });

  it('if the offset is not at the minimum offset it should reset to 0 on scanBack if the viewport size is greater than or equal to the original offset', (done: DoneFn) => {
    const viewportDuration = TimescaleComponent.VIEWPORT_SIZES[0];
    const offsetDuration = Duration.fromDurationLike({hours: 1});

    visualSchedulerService.getTimescale$().pipe(skip(3), first()).subscribe({ next:
      (timescale:Timescale) => {
        const newOffsettDuration: Duration = timescale.offsetDuration;
        expect(newOffsettDuration.as('seconds')).toEqual(Duration.fromDurationLike({hours: 0}).as('seconds'));
        done();
      }
    });
    visualSchedulerService.setViewportDuration(viewportDuration);
    visualSchedulerService.setViewportOffsetDuration(offsetDuration);

    component.scanBack();
  });

  it('if the offset is not at the minimum offset it should move back by the viewport duration on scanBack if the viewport size is less than the original offset', (done: DoneFn) => {
    const viewportDuration = TimescaleComponent.VIEWPORT_SIZES[0];
    const offsetDuration = Duration.fromDurationLike({hours: 8});

    let timeScaleChangeCount: number = 0
    visualSchedulerService.getTimescale$().subscribe({ next:
      (timescale:Timescale) => {
        switch (timeScaleChangeCount) {
          case 0:
            // initial setup
            expect(timescale.visibleDuration).toEqual(Timescale.DEFAULT_VISIBLE_DURATION);
            expect(timescale.offsetDuration).toEqual(Timescale.DEFAULT_OFFSET_DURATION);
            break;
          case 1:
            // setViewportDuration()
            expect(timescale.visibleDuration).toEqual(viewportDuration);
            break;
          case 2:
            // setViewportOffsetDuration
            expect(timescale.offsetDuration).toEqual(offsetDuration);
            break;
          case 3:
            // scanBack()
            const newOffsetDuration: Duration = timescale.offsetDuration;
            console.log(`newOffsettDuration = ${newOffsetDuration}`)
            expect(newOffsetDuration.as('seconds')).toEqual(offsetDuration.as('seconds') - viewportDuration.as('seconds'));
            done();
        }
        timeScaleChangeCount++;
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
        expect(newOffsettDuration.as('seconds')).toEqual(offsetDuration.as('seconds'));
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

    let timeScaleChangeCount: number = 0
    visualSchedulerService.getTimescale$().subscribe({ next:
      (timescale:Timescale) => {
        switch (timeScaleChangeCount) {
          case 0:
            // initial setup
            expect(timescale.visibleDuration).toEqual(Timescale.DEFAULT_VISIBLE_DURATION);
            expect(timescale.offsetDuration).toEqual(Timescale.DEFAULT_OFFSET_DURATION);
            break;
          case 1:
            // setViewportDuration()
            expect(timescale.visibleDuration).toEqual(viewportDuration);
            break;
          case 2:
            // setViewportOffsetDuration
            expect(timescale.offsetDuration).toEqual(offsetDuration);
            break;
          case 3:
            // scanForward()
            const newOffsettDuration: Duration = timescale.offsetDuration;
            expect(newOffsettDuration.as('seconds')).toEqual(maximumOffset.as('seconds'));
            done();
        }
        timeScaleChangeCount++;
      }
    });
    visualSchedulerService.setViewportDuration(viewportDuration);
    visualSchedulerService.setViewportOffsetDuration(offsetDuration);
    component.scanForward();
  });

  it('if the offset is not at the maximum offset and the viewport size is less than the duration between the current and maximum offset the new offset should be the the original offset plus the viewport size', (done: DoneFn) => {
    const viewportDuration = TimescaleComponent.VIEWPORT_SIZES[0];
    const maximumOffset:Duration = Interval.fromDateTimes(schedulerBoundsStartDate,schedulerBoundsEndDate).toDuration().minus(viewportDuration);
    const offsetDuration = maximumOffset.minus(viewportDuration).minus(viewportDuration).minus(viewportDuration);

    let timeScaleChangeCount: number = 0
    visualSchedulerService.getTimescale$().subscribe({ next:
      (timescale:Timescale) => {
        switch (timeScaleChangeCount) {
          case 0:
            // initial setup
            expect(timescale.visibleDuration).toEqual(Timescale.DEFAULT_VISIBLE_DURATION);
            expect(timescale.offsetDuration).toEqual(Timescale.DEFAULT_OFFSET_DURATION);
            break;
          case 1:
            // setViewportDuration()
            expect(timescale.visibleDuration).toEqual(viewportDuration);
            break;
          case 2:
            // setViewportOffsetDuration()
            expect(timescale.offsetDuration).toEqual(offsetDuration);
            break;
          case 3:
            // scanForward()
            const newOffsettDuration: Duration = timescale.offsetDuration;
            expect(newOffsettDuration.as('seconds')).toEqual(maximumOffset.minus(viewportDuration).minus(viewportDuration).as('seconds'));
            done();
        }
        timeScaleChangeCount++;
      }
    });

    visualSchedulerService.setViewportDuration(viewportDuration);
    visualSchedulerService.setViewportOffsetDuration(offsetDuration);
    component.scanForward();
  });

  it('if the viewport size is not at the maximum but the offset is at the maximum offset, setting viewport size larger should shift the offset so the view stays in the bounds ', (done: DoneFn) => {
    const initialViewportDurationIndex = 0;
    const initialViewportDuration = TimescaleComponent.VIEWPORT_SIZES[initialViewportDurationIndex];
    const maximumOffset:Duration = Interval.fromDateTimes(schedulerBoundsStartDate,schedulerBoundsEndDate).toDuration().minus(initialViewportDuration);
    const initialOffsetDuration = maximumOffset;

    let timeScaleChangeCount: number = 0
    let expectedViewportSizeIndex: number = 1;
    visualSchedulerService.getTimescale$().subscribe({ next:
      (timescale:Timescale) => {
        switch (timeScaleChangeCount) {
          case 0:
            // initial setup
            expect(timescale.visibleDuration).toEqual(Timescale.DEFAULT_VISIBLE_DURATION);
            expect(timescale.offsetDuration).toEqual(Timescale.DEFAULT_OFFSET_DURATION);
            break;
          case 1:
            // setViewportDuration()
            expect(timescale.visibleDuration).toEqual(initialViewportDuration);
            break;
          case 2:
            // setViewportOffsetDuration()
            expect(timescale.offsetDuration).toEqual(initialOffsetDuration);
            break;
          default:
            // additional setViewportDuration()
            let newIndex: number = TimescaleComponent.VIEWPORT_SIZES.indexOf(timescale.visibleDuration);
            expect(newIndex).toEqual(expectedViewportSizeIndex);
            expect(timescale.offsetDuration.as('seconds')).toEqual(timescale.boundsInterval.toDuration().minus(timescale.visibleDuration).as('seconds'));
            expectedViewportSizeIndex++;
            if (newIndex === TimescaleComponent.VIEWPORT_SIZES.length - 1) {
              done();
            }
        }
        timeScaleChangeCount++;
      }
    });

    visualSchedulerService.setViewportDuration(initialViewportDuration);
    visualSchedulerService.setViewportOffsetDuration(initialOffsetDuration);
    for ( let index = initialViewportDurationIndex+1; index < TimescaleComponent.VIEWPORT_SIZES.length; index++ ) {
      visualSchedulerService.setViewportDuration(TimescaleComponent.VIEWPORT_SIZES[index]);
    }
  });

});
