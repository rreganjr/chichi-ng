import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DateTime } from 'luxon';

import { VisualSchedulerComponent } from './visual-scheduler.component';
import { VisualSchedulerService } from './visual-scheduler.service';

describe('VisualSchedulerComponent', () => {
  let testStartDate: Date = new Date('2021-05-01 00:00:00');
  let testEndDate: Date = new Date('2021-05-08 00:00:00');

  let component: VisualSchedulerComponent;
  let fixture: ComponentFixture<VisualSchedulerComponent>;
  // let hostComponent: TestHostComponent;
  // let hostFixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TestHostComponent, VisualSchedulerComponent ],
      providers: [VisualSchedulerService]
    })
    .compileComponents();
  });

  // beforeEach(() => {
  //   hostFixture = TestBed.createComponent(TestHostComponent);
  //   hostComponent = hostFixture.componentInstance;
  //   hostFixture.detectChanges();
  // });

  beforeEach(() => {
    fixture = TestBed.createComponent(VisualSchedulerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create host', () => {
    expect(DateTime.fromISO(testStartDate.toISOString())).toBeTruthy();
   // expect(hostComponent).toBeTruthy();
  });

  @Component({
    selector: `host-component`,
    template: `<cc-visual-scheduler [startDate]="startDate" [endDate]="endDate">`
  })
  class TestHostComponent {
    public startDate: Date = testStartDate;
    public endDate: Date = testEndDate;
  }
});
