import { DebugElement, ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Duration } from 'luxon';
import { first, skip } from 'rxjs';
import { Timescale } from '../../../timescale.model';
import { VisualSchedulerService } from '../../../visual-scheduler.service';

import { TimelineComponent, TimelineComponentInternals } from './timeline.component';

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
    component.channelName = channelName;
    component.resourceName = resourceName;
    component.showLabels = true;
    visualSchedulerService.setBounds(schedulerBoundsStartDate, schedulerBoundsEndDate);
    visualSchedulerService.setViewportOffsetDuration(Duration.fromDurationLike({seconds: 0}));
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
    const viewPortDuration: Duration = Duration.fromDurationLike({hours: 1});
    visualSchedulerService.getTimescale$().pipe(skip(1), first()).subscribe(
      (timescale:Timescale) => {
        console.log(`timescale seconds: ${timescale.visibleTimelineBounds.toDuration().as('seconds')}`, fixture.debugElement.children);
        const timeLineInternals: TimelineComponentInternals = component.getInternalConfig();
        expect(timeLineInternals.visibleHours).toEqual(viewPortDuration.as('hours'));
        expect(timeLineInternals.primaryTicksDuration.as('seconds')).toEqual(Duration.fromDurationLike({hours: 1}).as('seconds'));
        expect(timeLineInternals.betweenTicksDuration.as('seconds')).toEqual(Duration.fromDurationLike({minutes: 5}).as('seconds'));
        let counter: number = 0
        fixture.debugElement.children.forEach( (debugElement: DebugElement) => {
          console.log(`child[${counter}] = ${debugElement.name}.${debugElement.nativeElement.className} ${debugElement.nativeElement.id} `);
          counter++;
        })
        done();
      }
    );
    visualSchedulerService.setViewportDuration(viewPortDuration);
  })

  it('TimelineComponent for viewport duration of twelve hours should have primaryTicks and betweenTicks  ', (done: DoneFn) => {
    const viewPortDuration: Duration = Duration.fromDurationLike({hours: 12});
    visualSchedulerService.getTimescale$().pipe(skip(1), first()).subscribe(
      (timescale:Timescale) => {
        console.log(`timescale seconds: ${timescale.visibleTimelineBounds.toDuration().as('seconds')}`, fixture.debugElement.children);
        const timeLineInternals: TimelineComponentInternals = component.getInternalConfig();
        expect(timeLineInternals.visibleHours).toEqual(viewPortDuration.as('hours'));
        expect(timeLineInternals.primaryTicksDuration.as('seconds')).toEqual(Duration.fromDurationLike({hours: 1}).as('seconds'));
        expect(timeLineInternals.betweenTicksDuration.as('seconds')).toEqual(Duration.fromDurationLike({minutes: 15}).as('seconds'));
        let counter: number = 0
        fixture.debugElement.children.forEach( (debugElement: DebugElement) => {
          console.log(`child[${counter}] = ${debugElement.name}.${debugElement.nativeElement.className} ${debugElement.nativeElement.id} `);
          counter++;
        })
        done();
      }
    );
    visualSchedulerService.setViewportDuration(viewPortDuration);
  })

  it('TimelineComponent for viewport duration of one day should have primaryTicks and betweenTicks  ', (done: DoneFn) => {
    const viewPortDuration: Duration = Duration.fromDurationLike({hours: 24});
    visualSchedulerService.getTimescale$().pipe(skip(1), first()).subscribe(
      (timescale:Timescale) => {
        console.log(`timescale seconds: ${timescale.visibleTimelineBounds.toDuration().as('seconds')}`, fixture.debugElement.children);
        const timeLineInternals: TimelineComponentInternals = component.getInternalConfig();
        expect(timeLineInternals.visibleHours).toEqual(viewPortDuration.as('hours'));
        expect(timeLineInternals.primaryTicksDuration.as('seconds')).toEqual(Duration.fromDurationLike({hours: 2}).as('seconds'));
        expect(timeLineInternals.betweenTicksDuration.as('seconds')).toEqual(Duration.fromDurationLike({minutes: 30}).as('seconds'));
        let counter: number = 0
        fixture.debugElement.children.forEach( (debugElement: DebugElement) => {
          console.log(`child[${counter}] = ${debugElement.name}.${debugElement.nativeElement.className} ${debugElement.nativeElement.id} `);
          counter++;
        })
        done();
      }
    );
    visualSchedulerService.setViewportDuration(viewPortDuration);
  })

  it('TimelineComponent for viewport duration of two days should have primaryTicks and betweenTicks  ', (done: DoneFn) => {
    const viewPortDuration: Duration = Duration.fromDurationLike({days: 2});
    visualSchedulerService.getTimescale$().pipe(skip(1), first()).subscribe(
      (timescale:Timescale) => {
        console.log(`timescale seconds: ${timescale.visibleTimelineBounds.toDuration().as('seconds')}`, fixture.debugElement.children);
        const timeLineInternals: TimelineComponentInternals = component.getInternalConfig();
        expect(timeLineInternals.visibleHours).toEqual(viewPortDuration.as('hours'));
        expect(timeLineInternals.primaryTicksDuration.as('seconds')).toEqual(Duration.fromDurationLike({hours: 6}).as('seconds'));
        expect(timeLineInternals.betweenTicksDuration.as('seconds')).toEqual(Duration.fromDurationLike({minutes: 30}).as('seconds'));
        let counter: number = 0
        fixture.debugElement.children.forEach( (debugElement: DebugElement) => {
          console.log(`child[${counter}] = ${debugElement.name}.${debugElement.nativeElement.className} ${debugElement.nativeElement.id} `);
          counter++;
        })
        done();
      }
    );
    visualSchedulerService.setViewportDuration(viewPortDuration);
  })

  it('TimelineComponent for viewport duration of three days should have primaryTicks and betweenTicks  ', (done: DoneFn) => {
    const viewPortDuration: Duration = Duration.fromDurationLike({days: 3});
    visualSchedulerService.getTimescale$().pipe(skip(1), first()).subscribe(
      (timescale:Timescale) => {
        console.log(`timescale seconds: ${timescale.visibleTimelineBounds.toDuration().as('seconds')}`, fixture.debugElement.children);
        const timeLineInternals: TimelineComponentInternals = component.getInternalConfig();
        expect(timeLineInternals.visibleHours).toEqual(viewPortDuration.as('hours'));
        expect(timeLineInternals.primaryTicksDuration.as('seconds')).toEqual(Duration.fromDurationLike({hours: 6}).as('seconds'));
        expect(timeLineInternals.betweenTicksDuration.as('seconds')).toEqual(Duration.fromDurationLike({hours: 3}).as('seconds'));
        let counter: number = 0
        fixture.debugElement.children.forEach( (debugElement: DebugElement) => {
          console.log(`child[${counter}] = ${debugElement.name}.${debugElement.nativeElement.className} ${debugElement.nativeElement.id} `);
          counter++;
        })
        done();
      }
    );
    visualSchedulerService.setViewportDuration(viewPortDuration);
  })

  it('TimelineComponent for viewport duration of five days should have primaryTicks and betweenTicks  ', (done: DoneFn) => {
    const viewPortDuration: Duration = Duration.fromDurationLike({days: 5});
    visualSchedulerService.getTimescale$().pipe(skip(1), first()).subscribe(
      (timescale:Timescale) => {
        console.log(`timescale seconds: ${timescale.visibleTimelineBounds.toDuration().as('seconds')}`, fixture.debugElement.children);
        const timeLineInternals: TimelineComponentInternals = component.getInternalConfig();
        expect(timeLineInternals.visibleHours).toEqual(viewPortDuration.as('hours'));
        expect(timeLineInternals.primaryTicksDuration.as('seconds')).toEqual(Duration.fromDurationLike({hours: 12}).as('seconds'));
        expect(timeLineInternals.betweenTicksDuration.as('seconds')).toEqual(Duration.fromDurationLike({hours: 6}).as('seconds'));
        let counter: number = 0
        fixture.debugElement.children.forEach( (debugElement: DebugElement) => {
          console.log(`child[${counter}] = ${debugElement.name}.${debugElement.nativeElement.className} ${debugElement.nativeElement.id} `);
          counter++;
        })
        done();
      }
    );
    visualSchedulerService.setViewportDuration(viewPortDuration);
  })

  it('TimelineComponent for viewport duration of less than days should have primaryTicks and betweenTicks  ', (done: DoneFn) => {
    const viewPortDuration: Duration = Duration.fromDurationLike({days: 6});
    visualSchedulerService.getTimescale$().pipe(skip(1), first()).subscribe(
      (timescale:Timescale) => {
        console.log(`timescale seconds: ${timescale.visibleTimelineBounds.toDuration().as('seconds')}`, fixture.debugElement.children);
        const timeLineInternals: TimelineComponentInternals = component.getInternalConfig();
        expect(timeLineInternals.visibleHours).toEqual(viewPortDuration.as('hours'));
        expect(timeLineInternals.primaryTicksDuration.as('seconds')).toEqual(Duration.fromDurationLike({hours: 12}).as('seconds'));
        expect(timeLineInternals.betweenTicksDuration.as('seconds')).toEqual(Duration.fromDurationLike({hours: 6}).as('seconds'));

        expect(fixture.debugElement.children[0].nativeElement.className).toContain('day');
        let counter: number = 0
        fixture.debugElement.children.forEach( (debugElement: DebugElement) => {
          console.log(`child[${counter}] = ${debugElement.name}.${debugElement.nativeElement.class} ${debugElement.nativeElement.id} `);
          expect()
          counter++;
        })
        done();
      }
    );
    visualSchedulerService.setViewportDuration(viewPortDuration);
  })

  it('TimelineComponent for viewport duration of seven days (the max) should have primaryTicks of days and betweenTicks of  6 hours', (done: DoneFn) => {
    const viewPortDuration: Duration = VisualSchedulerService.MAX_VIEWPORT_DURATION;
    visualSchedulerService.getTimescale$().pipe(skip(1), first()).subscribe(
      (timescale:Timescale) => {
        console.log(`timescale seconds: ${timescale.visibleTimelineBounds.toDuration().as('seconds')}`, fixture.debugElement.children);
        const timeLineInternals: TimelineComponentInternals = component.getInternalConfig();
        expect(timeLineInternals.visibleHours).toEqual(viewPortDuration.as('hours'));
        expect(timeLineInternals.primaryTicksDuration.as('seconds')).toEqual(Duration.fromDurationLike({days: 1}).as('seconds'));
        expect(timeLineInternals.betweenTicksDuration.as('seconds')).toEqual(Duration.fromDurationLike({hours: 6}).as('seconds'));
        expect(timeLineInternals.startOfOutOfBoundsElementId).toBeTruthy();
        expect(timeLineInternals.endOfOutOfBoundsElementId).toBeTruthy();
        const startOfOutOfBoundsElementArray:Array<DebugElement> = debugElement.children.filter((value: DebugElement, index: number) => value.nativeElement.id === timeLineInternals.startOfOutOfBoundsElementId);
        expect(startOfOutOfBoundsElementArray).toBeTruthy();
        expect(startOfOutOfBoundsElementArray.length).toEqual(1);
        expect(startOfOutOfBoundsElementArray[0].nativeElement.className).toEqual('outOfBounds');
        expect(startOfOutOfBoundsElementArray[0].nativeElement.style.left).toEqual('0px');
        let counter: number = 0
        fixture.debugElement.children.forEach( (debugElement: DebugElement) => {
          console.log(`child[${counter}] = ${debugElement.name}.${debugElement.nativeElement.className} ${debugElement.nativeElement.id} `);
          counter++;
        })
        done();
      }
    );
    visualSchedulerService.setViewportDuration(viewPortDuration);
  })

  it('TimelineComponent doesnt have outOfBounds regions when bounds match the primary ticks of hours', (done: DoneFn) => {
    visualSchedulerService.getTimescale$().pipe(skip(1), first()).subscribe(
      (timescale:Timescale) => {
        console.log(`timescale seconds: ${timescale.visibleTimelineBounds.toDuration().as('seconds')}`, fixture.debugElement.children);
        const timeLineInternals: TimelineComponentInternals = component.getInternalConfig();
        expect(timeLineInternals.startOfOutOfBoundsElementId).toBeUndefined();
        expect(timeLineInternals.endOfOutOfBoundsElementId).toBeUndefined();
        done();
      }
    );
    visualSchedulerService.setViewportDuration(Duration.fromDurationLike({hours: 6}));
    visualSchedulerService.setBounds(new Date('2021-05-01 00:00:00'), new Date('2021-05-01 06:00:00'));
  })

  it('TimelineComponent doesnt have outOfBounds regions when bounds match the primary ticks of days', (done: DoneFn) => {
    visualSchedulerService.getTimescale$().pipe(skip(1), first()).subscribe(
      (timescale:Timescale) => {
        console.log(`timescale seconds: ${timescale.visibleTimelineBounds.toDuration().as('seconds')}`, fixture.debugElement.children);
        const timeLineInternals: TimelineComponentInternals = component.getInternalConfig();
        expect(timeLineInternals.startOfOutOfBoundsElementId).toBeUndefined();
        expect(timeLineInternals.endOfOutOfBoundsElementId).toBeUndefined();
        done();
      }
    );
    visualSchedulerService.setBounds(new Date('2021-05-01 00:00:00'), new Date('2021-05-14 00:00:00'));
  })
});
