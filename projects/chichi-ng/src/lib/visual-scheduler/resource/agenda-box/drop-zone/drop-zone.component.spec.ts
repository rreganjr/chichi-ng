import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Interval } from 'luxon';
import { VisualSchedulerService } from '../../../visual-scheduler.service';
import { DropZoneAgendaItem } from '../channel/channel.component';

import { DropZoneComponent } from './drop-zone.component';

describe('DropZoneComponent', () => {
  let component: DropZoneComponent;
  let fixture: ComponentFixture<DropZoneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DropZoneComponent ],
      providers: [VisualSchedulerService]
    })
    .compileComponents();
  });

  beforeEach(() => {
    const start: Date = new Date();
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() +  24 * 60 * 60 * 1000);
    const dropZone = new DropZoneAgendaItem('resource', 'channel', Interval.fromDateTimes(start, end));

    fixture = TestBed.createComponent(DropZoneComponent);
    component = fixture.componentInstance;
    component.agendaItem = dropZone;
    component.isDragging = false;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
