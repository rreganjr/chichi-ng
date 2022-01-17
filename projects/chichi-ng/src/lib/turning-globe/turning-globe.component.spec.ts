import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TurningGlobeComponent } from './turning-globe.component';

describe('TurningGlobeComponent', () => {
  let component: TurningGlobeComponent;
  let fixture: ComponentFixture<TurningGlobeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TurningGlobeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TurningGlobeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
