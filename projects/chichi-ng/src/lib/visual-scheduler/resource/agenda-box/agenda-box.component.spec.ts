import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgendaBoxComponent } from './agenda-box.component';

describe('AgendaBoxComponent', () => {
  let component: AgendaBoxComponent;
  let fixture: ComponentFixture<AgendaBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgendaBoxComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AgendaBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create a AgendaBoxComponent', () => {
    expect(component).toBeTruthy();
  });
});
