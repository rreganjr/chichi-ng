import { DebugElement, ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Duration } from 'luxon';
import { first, skip } from 'rxjs';
import { Timescale } from '../../../timescale.model';
import { VisualSchedulerService } from '../../../visual-scheduler.service';

import { TimelineComponent } from './timeline.component';

describe('TimelineComponent', () => {
  const resourceName: string = 'resource';
  const channelName: string = 'channel';
  const schedulerBoundsStartDate: Date = new Date('2021-05-01 00:05:00');
  const schedulerBoundsEndDate: Date = new Date('2021-05-08 00:55:00');
  let visualSchedulerService: VisualSchedulerService;
  let component: TimelineComponent;
  let debugElement: DebugElement;

  let fixture: ComponentFixture<TimelineComponent>;

  beforeEach(async () => {
    visualSchedulerService = new VisualSchedulerService();
    await TestBed.configureTestingModule({
      declarations: [ TimelineComponent ],
      providers: [{ provide: VisualSchedulerService, useValue: visualSchedulerService }]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TimelineComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    visualSchedulerService.setBounds(schedulerBoundsStartDate, schedulerBoundsEndDate);
    visualSchedulerService.getIntersectingAgendaItems(resourceName, channelName, schedulerBoundsStartDate, schedulerBoundsEndDate); // makes the service assume it exists
    fixture.detectChanges();
  });

  it('should create a TimelineComponent', () => {
    expect(component).toBeTruthy();
  });

  /*
   * The timeline layout varies by the visible vieport
   * < 12 hours
   * < 1 day
   * < 2 days
   * < 3 days
   * < 5 days
   * < 7 days
   * >= 7 days
    */

  it('TimelineComponent for viewport duration of one hour should have primaryTicks and betweenTicks  ', (done: DoneFn) => {
    visualSchedulerService.getTimescale$().pipe(first()).subscribe(
      (timescale:Timescale) => {
        console.log(`timescale seconds: ${timescale.visibleTimelineBounds.toDuration().as('seconds')}`, fixture.debugElement.children);
        const timeLineInternals: object = component.getInternalConfig();

        let counter: number = 0
        fixture.debugElement.children.forEach( (debugElement: DebugElement) => {
          console.log(`child[${counter}] = ${debugElement.name}.${debugElement.nativeElement.className} ${debugElement.nativeElement.id} `);
          counter++;
        })
        done();
      }
    );
    visualSchedulerService.setViewportDuration(Duration.fromDurationLike({hours: 1}));
  })

  it('TimelineComponent for viewport duration of twelve hours should have primaryTicks and betweenTicks  ', (done: DoneFn) => {
    visualSchedulerService.getTimescale$().pipe(first()).subscribe(
      (timescale:Timescale) => {
        console.log(`timescale seconds: ${timescale.visibleTimelineBounds.toDuration().as('seconds')}`, fixture.debugElement.children);
        const timeLineInternals: object = component.getInternalConfig();
        let counter: number = 0
        fixture.debugElement.children.forEach( (debugElement: DebugElement) => {
          console.log(`child[${counter}] = ${debugElement.name}.${debugElement.nativeElement.className} ${debugElement.nativeElement.id} `);
          counter++;
        })
        done();
      }
    );
    visualSchedulerService.setViewportDuration(Duration.fromDurationLike({hours: 12}));
  })

  it('TimelineComponent for viewport duration of one day should have primaryTicks and betweenTicks  ', (done: DoneFn) => {
    visualSchedulerService.getTimescale$().pipe(first()).subscribe(
      (timescale:Timescale) => {
        console.log(`timescale seconds: ${timescale.visibleTimelineBounds.toDuration().as('seconds')}`, fixture.debugElement.children);
        const timeLineInternals: object = component.getInternalConfig();
        let counter: number = 0
        fixture.debugElement.children.forEach( (debugElement: DebugElement) => {
          console.log(`child[${counter}] = ${debugElement.name}.${debugElement.nativeElement.className} ${debugElement.nativeElement.id} `);
          counter++;
        })
        done();
      }
    );
    visualSchedulerService.setViewportDuration(Duration.fromDurationLike({hours: 24}));
  })

  it('TimelineComponent for viewport duration of two days should have primaryTicks and betweenTicks  ', (done: DoneFn) => {
    visualSchedulerService.getTimescale$().pipe(first()).subscribe(
      (timescale:Timescale) => {
        console.log(`timescale seconds: ${timescale.visibleTimelineBounds.toDuration().as('seconds')}`, fixture.debugElement.children);
        const timeLineInternals: object = component.getInternalConfig();
        let counter: number = 0
        fixture.debugElement.children.forEach( (debugElement: DebugElement) => {
          console.log(`child[${counter}] = ${debugElement.name}.${debugElement.nativeElement.className} ${debugElement.nativeElement.id} `);
          counter++;
        })
        done();
      }
    );
    visualSchedulerService.setViewportDuration(Duration.fromDurationLike({days: 2}));
  })

  it('TimelineComponent for viewport duration of three days should have primaryTicks and betweenTicks  ', (done: DoneFn) => {
    visualSchedulerService.getTimescale$().pipe(first()).subscribe(
      (timescale:Timescale) => {
        console.log(`timescale seconds: ${timescale.visibleTimelineBounds.toDuration().as('seconds')}`, fixture.debugElement.children);
        const timeLineInternals: object = component.getInternalConfig();
        let counter: number = 0
        fixture.debugElement.children.forEach( (debugElement: DebugElement) => {
          console.log(`child[${counter}] = ${debugElement.name}.${debugElement.nativeElement.className} ${debugElement.nativeElement.id} `);
          counter++;
        })
        done();
      }
    );
    visualSchedulerService.setViewportDuration(Duration.fromDurationLike({days: 3}));
  })

  it('TimelineComponent for viewport duration of five days should have primaryTicks and betweenTicks  ', (done: DoneFn) => {
    visualSchedulerService.getTimescale$().pipe(first()).subscribe(
      (timescale:Timescale) => {
        console.log(`timescale seconds: ${timescale.visibleTimelineBounds.toDuration().as('seconds')}`, fixture.debugElement.children);
        const timeLineInternals: object = component.getInternalConfig();
        let counter: number = 0
        fixture.debugElement.children.forEach( (debugElement: DebugElement) => {
          console.log(`child[${counter}] = ${debugElement.name}.${debugElement.nativeElement.className} ${debugElement.nativeElement.id} `);
          counter++;
        })
        done();
      }
    );
    visualSchedulerService.setViewportDuration(Duration.fromDurationLike({days: 5}));
  })

  it('TimelineComponent for viewport duration of seven days should have primaryTicks and betweenTicks  ', (done: DoneFn) => {
    visualSchedulerService.getTimescale$().pipe(first()).subscribe(
      (timescale:Timescale) => {
        console.log(`timescale seconds: ${timescale.visibleTimelineBounds.toDuration().as('seconds')}`, fixture.debugElement.children);
        const timeLineInternals: object = component.getInternalConfig();
        let counter: number = 0
        fixture.debugElement.children.forEach( (debugElement: DebugElement) => {
          console.log(`child[${counter}] = ${debugElement.name}.${debugElement.nativeElement.className} ${debugElement.nativeElement.id} `);
          counter++;
        })
        done();
      }
    );
    visualSchedulerService.setViewportDuration(Duration.fromDurationLike({days: 7}));
  })

  it('TimelineComponent for viewport duration of more than seven days should have primaryTicks and betweenTicks  ', (done: DoneFn) => {
    visualSchedulerService.getTimescale$().pipe(first()).subscribe(
      (timescale:Timescale) => {
        console.log(`timescale seconds: ${timescale.visibleTimelineBounds.toDuration().as('seconds')}`, fixture.debugElement.children);
        const timeLineInternals: object = component.getInternalConfig();
        let counter: number = 0
        fixture.debugElement.children.forEach( (debugElement: DebugElement) => {
          console.log(`child[${counter}] = ${debugElement.name}.${debugElement.nativeElement.className} ${debugElement.nativeElement.id} `);
          counter++;
        })
        done();
      }
    );
    visualSchedulerService.setViewportDuration(Duration.fromDurationLike({days: 14}));
  })

  it('TimelineComponent doesnt have outOfBounds regions when bounds match the primary ticks of hours', (done: DoneFn) => {
    visualSchedulerService.getTimescale$().pipe(skip(1), first()).subscribe(
      (timescale:Timescale) => {
        console.log(`timescale seconds: ${timescale.visibleTimelineBounds.toDuration().as('seconds')}`, fixture.debugElement.children);
        const timeLineInternals: object = component.getInternalConfig();
        let counter: number = 0
        fixture.debugElement.children.forEach( (debugElement: DebugElement) => {
          console.log(`child[${counter}] = ${debugElement.name}.${debugElement.nativeElement.className} ${debugElement.nativeElement.id} `);
          counter++;
        })
        done();
      }
    );
    visualSchedulerService.setViewportDuration(Duration.fromDurationLike({hours: 6}));
    visualSchedulerService.setBounds(new Date('2021-05-01 02:00:00'), new Date('2021-05-01 08:00:00'));
  })

  it('TimelineComponent doesnt have outOfBounds regions when bounds match the primary ticks of days', (done: DoneFn) => {
    visualSchedulerService.getTimescale$().pipe(skip(1), first()).subscribe(
      (timescale:Timescale) => {
        console.log(`timescale seconds: ${timescale.visibleTimelineBounds.toDuration().as('seconds')}`, fixture.debugElement.children);
        const timeLineInternals: object = component.getInternalConfig();
        let counter: number = 0
        fixture.debugElement.children.forEach( (debugElement: DebugElement) => {
          console.log(`child[${counter}] = ${debugElement.name}.${debugElement.nativeElement.className} ${debugElement.nativeElement.id} `);
          counter++;
        })
        done();
      }
    );
    visualSchedulerService.setBounds(new Date('2021-05-01 00:00:00'), new Date('2021-05-14 00:00:00'));
    visualSchedulerService.setViewportDuration(Duration.fromDurationLike({hours: 6}));
  })
});
