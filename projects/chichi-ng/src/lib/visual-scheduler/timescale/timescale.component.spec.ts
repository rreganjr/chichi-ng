import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Duration, Interval } from 'luxon';
import { Timescale } from '../timescale.model';
import { VisualSchedulerService } from '../visual-scheduler.service';

import { TimescaleComponent } from './timescale.component';

describe('TimescaleComponent', () => {
  let component: TimescaleComponent;
  let fixture: ComponentFixture<TimescaleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TimescaleComponent ],
      providers: [VisualSchedulerService]
    })
    .compileComponents();
  });

  beforeEach(() => {
    const start: Date = new Date();
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() +  24 * 60 * 60 * 1000);
    const bounds = Interval.fromDateTimes(start, end);

    fixture = TestBed.createComponent(TimescaleComponent);
    component = fixture.componentInstance;
    component._timescale = new Timescale(bounds, Duration.fromDurationLike({hours: 3}), Duration.fromDurationLike({hours: 0}));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
