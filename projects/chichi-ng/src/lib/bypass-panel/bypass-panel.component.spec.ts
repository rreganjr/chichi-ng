import { async, ComponentFixture, TestBed, inject, tick, fakeAsync } from '@angular/core/testing';
import {DebugElement} from '@angular/core';
import {By} from '@angular/platform-browser';

import { BypassPanelComponent } from './bypass-panel.component';

describe('BypassPanelComponent', () => {
  let component: BypassPanelComponent;
  let fixture: ComponentFixture<BypassPanelComponent>;
  let debugElement: DebugElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BypassPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BypassPanelComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;

    fixture.detectChanges();
  });

  it('should exist', () => {
    expect(component).toBeTruthy();
  });

  it('should start with left panel active', () => {
    expect(component.rightPanelActive === false);
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
    component.rightPanelActive = false;
    fixture.detectChanges();
    const rightPanel: DebugElement = debugElement.query(By.css('div.container  div.right-panel'));
    const overlayContainer: DebugElement = debugElement.query(By.css('div.container  div.overlay-container'));
    expect(rightPanel.nativeElement.getBoundingClientRect().x).toEqual(overlayContainer.nativeElement.getBoundingClientRect().x);
  });

  it('setting rightPanelActive should move the overlay-container to the left', () => {
    component.rightPanelActive = true;
    fixture.detectChanges();
    const leftPanel: DebugElement = debugElement.query(By.css('div.container  div.left-panel'));
    const overlayContainer: DebugElement = debugElement.query(By.css('div.container  div.overlay-container'));
    expect(leftPanel.nativeElement.getBoundingClientRect().x).toEqual(overlayContainer.nativeElement.getBoundingClientRect().x);
  });

});
