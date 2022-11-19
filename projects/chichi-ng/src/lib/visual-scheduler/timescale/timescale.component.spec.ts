import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Duration, Interval } from 'luxon';
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
});
