import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChichiNgComponent } from './chichi-ng.component';

describe('ChichiNgComponent', () => {
  let component: ChichiNgComponent;
  let fixture: ComponentFixture<ChichiNgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChichiNgComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChichiNgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create a ChichiNgComponent', () => {
    expect(component).toBeTruthy();
  });
});
