import { async, ComponentFixture, TestBed, inject, tick, fakeAsync } from '@angular/core/testing';
import {DebugElement} from '@angular/core';
import {By} from '@angular/platform-browser'

import { ChiChiBypassPanelComponent } from './bypass-panel.component';

describe('BypassPanelComponent', () => {
  let component: ChiChiBypassPanelComponent;
  let fixture: ComponentFixture<ChiChiBypassPanelComponent>;
  let debugElement : DebugElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChiChiBypassPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChiChiBypassPanelComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with left panel active', () => {
    expect(component.rightPanelActive == false);
  });

  it('should have a container div', () => {
    expect(debugElement.query(By.css('div.container')).nativeElement.innerText).toBe('');
  });

  it('should have a left-panel in container div', () => {
    expect(debugElement.query(By.css('div.container > div.left-panel')).nativeElement.innerText).toBe('');
  });

  it('should have a right-panel in container div', () => {
    expect(debugElement.query(By.css('div.container > div.right-panel')).nativeElement.innerText).toBe('');
  });

});
