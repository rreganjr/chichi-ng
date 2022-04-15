import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Interval } from 'luxon';
import { VisualSchedulerService } from '../../../visual-scheduler.service';
import { AgendaItem } from '../agenda-item.model';

import { AgendaItemComponent } from './agenda-item.component';

describe('AgendaItemComponent', () => {
  let component: AgendaItemComponent;
  let fixture: ComponentFixture<AgendaItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgendaItemComponent ],
      providers: [VisualSchedulerService]
    })
    .compileComponents();
  });

  beforeEach(() => {
    const start: Date = new Date();
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() +  24 * 60 * 60 * 1000);
    const testItem = new AgendaItem('resource', 'channel', Interval.fromDateTimes(start, end), {label: 'new item'}, (data:any)=>data.label);

    fixture = TestBed.createComponent(AgendaItemComponent);
    component = fixture.componentInstance;
    component.agendaItem = testItem;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
