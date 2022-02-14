import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimescaleComponent } from './timescale.component';

describe('TimescaleComponent', () => {
  let component: TimescaleComponent;
  let fixture: ComponentFixture<TimescaleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TimescaleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TimescaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
