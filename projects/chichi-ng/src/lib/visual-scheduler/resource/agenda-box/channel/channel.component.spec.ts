import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VisualSchedulerService } from '../../../visual-scheduler.service';

import { ChannelComponent } from './channel.component';

describe('ChannelComponent', () => {
  const resourceName: string = 'resource';
  const channelName: string = 'channel';
  const schedulerBoundsStartDate: Date = new Date('2021-05-01 00:00:00');
  const schedulerBoundsEndDate: Date = new Date('2021-05-08 00:00:00');
  const agendaItemBoundsStart: Date = new Date(schedulerBoundsStartDate.getTime() + 24 * 60 * 60 * 1000); // 24 hours from scheduler start
  const agendaItemBoundsEnd: Date = new Date(agendaItemBoundsStart.getTime() + (1 * 60 * 60 * 1000)); // one hour long
  let visualSchedulerService: VisualSchedulerService;

  let component: ChannelComponent;
  let fixture: ComponentFixture<ChannelComponent>;

  beforeEach(async () => {
    visualSchedulerService = new VisualSchedulerService();
    await TestBed.configureTestingModule({
      declarations: [ChannelComponent],
      providers: [{ provide: VisualSchedulerService, useValue: visualSchedulerService }]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChannelComponent);
    component = fixture.componentInstance;
    component.resourceName = resourceName;
    component.channelName = channelName;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
