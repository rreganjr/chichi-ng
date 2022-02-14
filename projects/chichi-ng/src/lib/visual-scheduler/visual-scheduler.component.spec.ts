import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualSchedulerComponent } from './visual-scheduler.component';

describe('VisualSchedulerComponent', () => {
  let component: VisualSchedulerComponent;
  let fixture: ComponentFixture<VisualSchedulerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VisualSchedulerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VisualSchedulerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
