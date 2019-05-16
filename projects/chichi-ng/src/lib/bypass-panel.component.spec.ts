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

  it('should exist', () => {
    expect(component).toBeTruthy();
  });

  it('should start with left panel active', () => {
    expect(component.rightPanelActive == false);
  });

  it('should have a container div', () => {
    expect(debugElement.query(By.css('div.container')).nativeElement).toBeTruthy();
  });

  it('should have a left-panel in the container div', () => {
    expect(debugElement.query(By.css('div.container  div.left-panel')).nativeElement.innerText).toBe('');
  });

  it('should have a right-panel in container div', () => {
    expect(debugElement.query(By.css('div.container  div.right-panel')).nativeElement.innerText).toBe('');
  });

  it('the overlay-container should be positioned to the right', () => {
    let rightPanel : DebugElement = debugElement.query(By.css('div.container  div.right-panel'));
    let overlayContainer : DebugElement = debugElement.query(By.css('div.container  div.overlay-container'));
    expect(rightPanel.nativeElement.getBoundingClientRect().x).toEqual(overlayContainer.nativeElement.getBoundingClientRect().x);
  });

  it('setting rightPanelActive should move the overlay-container to the left', () => {
    component.rightPanelActive = true;
    fixture.detectChanges();
    let leftPanel : DebugElement = debugElement.query(By.css('div.container  div.left-panel'));
    let overlayContainer : DebugElement = debugElement.query(By.css('div.container  div.overlay-container'));
    expect(leftPanel.nativeElement.getBoundingClientRect().x).toEqual(overlayContainer.nativeElement.getBoundingClientRect().x);
  });


  
});
