import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DateTime, Duration, Interval } from 'luxon';
import { first, skip } from 'rxjs';
import { Timescale } from '../../../timescale.model';
import { VisualSchedulerService } from '../../../visual-scheduler.service';
import { AgendaItem } from '../agenda-item.model';

import { AgendaItemComponent } from './agenda-item.component';

describe('AgendaItemComponent', () => {
  const resourceName: string = 'resource';
  const channelName: string = 'channel';
  let schedulerBoundsStartDate: Date = new Date('2021-05-01 00:00:00');
  let schedulerBoundsEndDate: Date = new Date('2021-05-08 00:00:00');
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
    const agendaItemBoundsStart: Date = new Date(schedulerBoundsStartDate.getTime() + 24 * 60 * 60 * 1000); // 24 hours from scheduler start
    const agendaItemBoundsEnd: Date = new Date(agendaItemBoundsStart.getTime() + (1 * 60 * 60 * 1000)); // one hour long
    const testItem = new AgendaItem(resourceName, channelName, Interval.fromDateTimes(agendaItemBoundsStart, agendaItemBoundsEnd), {label: 'new item'}, (data:any)=>data.label);

    fixture = TestBed.createComponent(AgendaItemComponent);
    component = fixture.componentInstance;
    component.agendaItem = testItem;

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
    visualSchedulerService.setBounds(schedulerBoundsStartDate, schedulerBoundsEndDate);
  });

  it('display should be block and left should be 0%', (done: DoneFn) => {
    const viewportDuration = Duration.fromDurationLike({hours: 3});
    const offsetDuration = Duration.fromDurationLike({hours: 23});
    visualSchedulerService.getTimescale$().pipe(skip(2), first()).subscribe(
      (timescale:Timescale) => {
        expect(fixture.debugElement.nativeElement.style.display).toEqual('block');
        expect(fixture.debugElement.nativeElement.style.left).toEqual('0%');
        expect(fixture.debugElement.nativeElement.style.width).toEqual('33%');
        done();
      }
    );
    visualSchedulerService.setBounds(schedulerBoundsStartDate, schedulerBoundsEndDate);
    visualSchedulerService.setViewportDuration(viewportDuration);
    visualSchedulerService.setViewportOffsetDuration(offsetDuration);
    fixture.detectChanges();
  });

});
