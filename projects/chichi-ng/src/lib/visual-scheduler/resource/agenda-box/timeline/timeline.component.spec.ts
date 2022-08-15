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

  it('should have a native element', (done: DoneFn) => {
    visualSchedulerService.getTimescale$().pipe(skip(1), first()).subscribe(
      (timescale:Timescale) => {
        let leftPercentOfVisibleTimelineBounds = `${(Duration.fromDurationLike({hours: 1}).as('seconds') / timescale.visibleTimelineBounds.toDuration().as('seconds')) * 100}%`;
        expect(fixture.debugElement.nativeElement.style.display).toEqual('block');
        expect(fixture.debugElement.nativeElement.style.display).toEqual('none');
        done();
      }
    );
  })
});
