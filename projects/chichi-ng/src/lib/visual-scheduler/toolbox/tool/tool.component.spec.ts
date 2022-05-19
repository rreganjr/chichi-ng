import { Component } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { first, skip } from 'rxjs';
import { VisualSchedulerService } from '../../visual-scheduler.service';
import { ToolEvent } from './tool-event.model';

import { ToolComponent } from './tool.component';

describe('ToolComponent', () => {
  let component: ToolComponent;
  let fixture: ComponentFixture<ToolComponent>;
  let visualSchedulerService: VisualSchedulerService;

  beforeEach(waitForAsync(() => {
    visualSchedulerService = new VisualSchedulerService();
    TestBed.configureTestingModule({
      declarations: [ToolComponent],
      providers: [{ provide: VisualSchedulerService, useValue: visualSchedulerService }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it(' ToolComponent dragStart should generate a START ToolEvent', (done: DoneFn) => {
    const eventType = 'dragstart';
    const toolType = 'chat';
    // skip the first event which is always a ToolEvent.CLEAR
    visualSchedulerService.getToolEvents$().pipe(skip(1), first()).subscribe(
      (toolEvent:ToolEvent) => {
        expect(toolEvent.isStart()).toBeTrue();
        expect(toolEvent.toolType).toEqual(toolType);
        expect(toolEvent.event?.type).toEqual(eventType);
        done();
      }
    );
    component.onDragStart(
      new DragEvent(eventType),
      toolType
    );
  });

  it(' ToolComponent onDragEnd should generate an END ToolEvent', (done: DoneFn) => {
    const eventType = 'dragend';
    const toolType = 'chat';
    // skip the first event which is always a ToolEvent.CLEAR
    visualSchedulerService.getToolEvents$().pipe(skip(1), first()).subscribe(
      (toolEvent:ToolEvent) => {
        expect(toolEvent.isEnd()).toBeTrue();
        expect(toolEvent.toolType).toEqual(toolType);
        expect(toolEvent.event?.type).toEqual(eventType);
        done();
      }
    );
    component.onDragEnd(
      new DragEvent(eventType),
      toolType
    );
  });
});

describe('ToolComponent when inside a test host', () => {
  let testToolType: string = 'type-O-tool';
  let testEnabledTrue: boolean = true;
  let testEnabledFalse: boolean = false;
    let testHost: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let visualSchedulerService: VisualSchedulerService;

  beforeEach(waitForAsync(() => {
    visualSchedulerService = new VisualSchedulerService();
    TestBed.configureTestingModule({
      declarations: [ToolComponent, TestHostComponent],
      providers: [{ provide: VisualSchedulerService, useValue: visualSchedulerService }]
    }).compileComponents();
    fixture = TestBed.createComponent(TestHostComponent);
    testHost = fixture.componentInstance;
    fixture.detectChanges();  // trigger initial data binding
  }));

  it('The toolType input should be set on the test host', () => {
      expect(testHost.toolType).toEqual(testToolType);
      expect(testHost.enabled).toEqual(testEnabledTrue);
  });

  /**
   * Test host component for VisualSchedulerComponent
   */
  @Component({
    selector: `host-component`,
    template: `<cc-tool [toolType]='toolType' [enabled]='enabled'>`
  })
  class TestHostComponent {
    public toolType: string = testToolType;
    public enabled: boolean = testEnabledTrue;
  }
});
