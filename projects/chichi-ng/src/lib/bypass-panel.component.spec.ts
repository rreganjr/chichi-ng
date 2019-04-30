import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChiChiBypassPanelComponent } from './bypass-panel.component';

describe('BypassPanelComponent', () => {
  let component: ChiChiBypassPanelComponent;
  let fixture: ComponentFixture<ChiChiBypassPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChiChiBypassPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChiChiBypassPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
