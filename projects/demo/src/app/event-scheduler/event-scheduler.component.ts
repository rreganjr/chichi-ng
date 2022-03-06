import { Component, OnInit } from '@angular/core';
import { VisualSchedulerService } from 'chichi-ng';

@Component({
  selector: 'event-scheduler',
  templateUrl: './event-scheduler.component.html',
  styleUrls: ['./event-scheduler.component.scss'],
  providers: [VisualSchedulerService]
})
export class EventSchedulerComponent implements OnInit {

  public startDate: Date = new Date();
  public endDate: Date = new Date(this.startDate.getTime() + 14 * 24 * 60 * 60 * 1000);
  public channels: string[] = ['chat', 'video'];

  constructor(private vsServ: VisualSchedulerService) {
   }

  ngOnInit(): void {
    const startDate: Date = new Date(this.startDate.getTime() + 1 * 60 * 60 * 1000);
    console.log(`event-scheduler: `, this.vsServ.getAgendaItemsByResourceChannel$('room-1', 'chat'));
    this.vsServ.getAgendaItemsByResourceChannel$('room-1', 'chat').subscribe((agendaItems: object[]) => {
      console.log(`agendaItems: `, agendaItems);
    })
    console.log(`adding agenda item`);
    this.vsServ.addAgendaItem('room-1', 'chat', startDate, new Date(startDate.getTime() + 1 * 60 * 60 * 1000), {}, ()=>'label');
  }

}
