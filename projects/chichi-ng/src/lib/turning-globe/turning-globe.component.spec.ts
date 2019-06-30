import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChiChiTurningGlobeComponent } from './turning-globe.component';

describe('TurningGlobeComponent', () => {
  let component: ChiChiTurningGlobeComponent;
  let fixture: ComponentFixture<ChiChiTurningGlobeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChiChiTurningGlobeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChiChiTurningGlobeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
