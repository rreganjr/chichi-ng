import { Component, SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { DateTime } from 'luxon';
import { first } from 'rxjs';
import { TimescaleInvalid } from './timescale-invalid.error';
import { TimescaleValidatorErrorCode } from './timescale-validator.util';
import { Timescale } from './timescale.model';

import { VisualSchedulerComponent } from './visual-scheduler.component';
import { VisualSchedulerService } from './visual-scheduler.service';

describe('VisualSchedulerComponent', () => {
  let testStartDate: Date = new Date('2021-05-01 00:00:00');
  let testEndDate: Date = new Date('2021-05-08 00:00:00');
  let visualSchedulerService: VisualSchedulerService;

  let component: VisualSchedulerComponent;
  let fixture: ComponentFixture<VisualSchedulerComponent>;

  beforeEach(waitForAsync(() => {
    visualSchedulerService = new VisualSchedulerService();
    TestBed.configureTestingModule({
      declarations: [VisualSchedulerComponent],
      providers: [{ provide: VisualSchedulerService, useValue: visualSchedulerService }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VisualSchedulerComponent);
    component = fixture.componentInstance;
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('initial start and end dates through ngOnChanges to VisualSchedulerService', (done: DoneFn) => {
    visualSchedulerService.getTimescale$().pipe(first()).subscribe(
      (timescale:Timescale) => {
        expect(DateTime.fromJSDate(testStartDate)).toEqual(timescale.boundsInterval.start);
        expect(DateTime.fromJSDate(testEndDate)).toEqual(timescale.boundsInterval.end);
        done();
      }
    );
    component.ngOnChanges({
      startDate: new SimpleChange(undefined, testStartDate.toISOString(), true),
      endDate: new SimpleChange(undefined, testEndDate.toISOString(), true),
    });
    fixture.detectChanges();
  });

  it('change start date to later through ngOnChanges to VisualSchedulerService', (done: DoneFn) => {
    const updatedStart = new Date(testStartDate.getTime() + (1 * 60 * 60 * 1000));
    component.endDate = testEndDate.toISOString();
    visualSchedulerService.getTimescale$().pipe(first()).subscribe(
      (timescale:Timescale) => {
        expect(DateTime.fromJSDate(updatedStart)).toEqual(timescale.boundsInterval.start);
        expect(DateTime.fromJSDate(testEndDate)).toEqual(timescale.boundsInterval.end);
        done();
      }
    );
    component.ngOnChanges({
      startDate: new SimpleChange(testStartDate.toISOString(), updatedStart.toISOString(), false)
    });
    fixture.detectChanges();
  });

  it('change start date to earlier through ngOnChanges to VisualSchedulerService', (done: DoneFn) => {
    const updatedStart = new Date(testStartDate.getTime() - (1 * 60 * 60 * 1000));
    component.endDate = testEndDate.toISOString();
    visualSchedulerService.getTimescale$().pipe(first()).subscribe(
      (timescale:Timescale) => {
        expect(DateTime.fromJSDate(updatedStart)).toEqual(timescale.boundsInterval.start);
        expect(DateTime.fromJSDate(testEndDate)).toEqual(timescale.boundsInterval.end);
        done();
      }
    );
    component.ngOnChanges({
      startDate: new SimpleChange(testStartDate.toISOString(), updatedStart.toISOString(), false)
    });
    fixture.detectChanges();
  });

  it('change end date to later through ngOnChanges to VisualSchedulerService', (done: DoneFn) => {
    const updatedEnd = new Date(testEndDate.getTime() + (1 * 60 * 60 * 1000));
    component.startDate = testStartDate.toISOString();
    visualSchedulerService.getTimescale$().pipe(first()).subscribe(
      (timescale:Timescale) => {
        expect(DateTime.fromJSDate(testStartDate)).toEqual(timescale.boundsInterval.start);
        expect(DateTime.fromJSDate(updatedEnd)).toEqual(timescale.boundsInterval.end);
        done();
      }
    );
    component.ngOnChanges({
      endDate: new SimpleChange(testStartDate.toISOString(), updatedEnd.toISOString(), false)
    });
    fixture.detectChanges();
  });

  it('change end date to earlier through ngOnChanges to VisualSchedulerService', (done: DoneFn) => {
    const updatedEnd = new Date(testEndDate.getTime() - (1 * 60 * 60 * 1000));
    component.startDate = testStartDate.toISOString();
    visualSchedulerService.getTimescale$().pipe(first()).subscribe(
      (timescale:Timescale) => {
        expect(DateTime.fromJSDate(testStartDate)).toEqual(timescale.boundsInterval.start);
        expect(DateTime.fromJSDate(updatedEnd)).toEqual(timescale.boundsInterval.end);
        done();
      }
    );
    component.ngOnChanges({
      endDate: new SimpleChange(testStartDate.toISOString(), updatedEnd.toISOString(), false)
    });
    fixture.detectChanges();
  });
});

describe('VisualSchedulerComponent when inside a test host', () => {
  let testStartDate: Date = new Date('2021-05-01 00:00:00');
  let testEndDate: Date = new Date('2021-05-08 00:00:00');
  let testHost: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let visualSchedulerService: VisualSchedulerService;

  beforeEach(waitForAsync(() => {
    visualSchedulerService = new VisualSchedulerService();
    TestBed.configureTestingModule({
      declarations: [VisualSchedulerComponent, TestHostComponent],
      providers: [{ provide: VisualSchedulerService, useValue: visualSchedulerService }]
    }).compileComponents();
    fixture = TestBed.createComponent(TestHostComponent);
    testHost = fixture.componentInstance;
    fixture.detectChanges();  // trigger initial data binding
  }));

  it('The start and end data inputs should be set on the test host', () => {
      expect(testHost.startDate).toEqual(testStartDate.toISOString());
      expect(testHost.endDate).toEqual(testEndDate.toISOString());
  });

  it('The initial start and end dates on the test host should pass through the startDate and endDate inputs of the visual scheduler and should set the boundsInterval in the VisualSchedulerService and be observed on the Timescale$ observable. ', (done: DoneFn) => {
    visualSchedulerService.getTimescale$().pipe(first()).subscribe(
      (timescale:Timescale) => {
        expect(DateTime.fromJSDate(testStartDate)).toEqual(timescale.boundsInterval.start);
        expect(DateTime.fromJSDate(testEndDate)).toEqual(timescale.boundsInterval.end);
        done();
      }
    );
  });

  it('Changes to the startDate on the test host should pass through the startDate and endDate inputs of the visual scheduler and should set the boundsInterval in the VisualSchedulerService and be observed on the Timescale$ observable. ', (done: DoneFn) => {
    // change the values
    const updatedStart = new Date(testStartDate.getTime() + (1 * 60 * 60 * 1000));
    testHost.startDate = updatedStart.toISOString();
    fixture.detectChanges();
    visualSchedulerService.getTimescale$().pipe(first()).subscribe(
      (timescale:Timescale) => {
        expect(DateTime.fromJSDate(updatedStart)).toEqual(timescale.boundsInterval.start);
        expect(DateTime.fromJSDate(testEndDate)).toEqual(timescale.boundsInterval.end);
        done();
      }
    );
  });

  it('Changes to the endDate on the test host should pass through the startDate and endDate inputs of the visual scheduler and should set the boundsInterval in the VisualSchedulerService and be observed on the Timescale$ observable. ', (done: DoneFn) => {
    // change the values
    const updatedEnd = new Date(testEndDate.getTime() + (1 * 60 * 60 * 1000));
    testHost.endDate = updatedEnd.toISOString();
    fixture.detectChanges();
    visualSchedulerService.getTimescale$().pipe(first()).subscribe(
      (timescale:Timescale) => {
        expect(DateTime.fromJSDate(testStartDate)).toEqual(timescale.boundsInterval.start);
        expect(DateTime.fromJSDate(updatedEnd)).toEqual(timescale.boundsInterval.end);
        done();
      }
    );
  });

  it('Making the boundsInterval less than the visible duration should cause an error', (done: DoneFn) => {
    fixture.detectChanges();
    visualSchedulerService.getTimescale$().pipe(first()).subscribe(
      (timescale:Timescale) => {
        // change the end so the boundsInterval duration is shorter than the visibleDuration
        // NOTE: this assumes the visibleDuration is more than 1 millisecond
        const updatedEnd = new Date(testStartDate.getTime() + timescale.visibleDuration.as('milliseconds') - 1);
        testHost.endDate = updatedEnd.toISOString();
        try {
          fixture.detectChanges();
        } catch (error) {
          expect((error as TimescaleInvalid).validatorCode).toEqual(TimescaleValidatorErrorCode.VisibleDurationOutOfBounds);
        }
        done();
      }
    );
  });

  /**
   * Test host component for VisualSchedulerComponent
   */
  @Component({
    selector: `host-component`,
    template: `<cc-visual-scheduler [startDate]="startDate" [endDate]="endDate">`
  })
  class TestHostComponent {
    public startDate: string = testStartDate.toISOString();
    public endDate: string = testEndDate.toISOString();
  }
});
