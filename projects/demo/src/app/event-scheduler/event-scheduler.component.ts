import { Component, OnInit } from '@angular/core';
import { VisualSchedulerService, AgendaItem, AgendaItemLabeler, ToolEvent } from 'chichi-ng';
import { filter } from 'rxjs';

class ChatData {
  constructor(
    public label: string = 'new chat'    
  ) {}
}
const chatLabeler: AgendaItemLabeler<ChatData> = (data: ChatData) => data.label;

class VideoData {
  constructor(
    public label: string = 'new video'
  ) {}
}
const videoLabeler: AgendaItemLabeler<VideoData> = (data: VideoData) => data.label;

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
  public showEditor: boolean = false;
  public agendaItemToEdit: AgendaItem|null = null;

  constructor(private vsServ: VisualSchedulerService) {
  }

  ngOnInit(): void {
    const date: Date = new Date(this.startDate.getTime() + 1 * 60 * 60 * 1000);

    let i = 0;
    for (let date = this.startDate; date.getTime() < this.endDate.getTime() + 60*60*1000; date = new Date(date.getTime() + 60*60*1000)) {
      i++;
      this.vsServ.addAgendaItem(`room-${(i%3)+1}`, 'chat', date, new Date(date.getTime() + 1 * 60 * 60 * 1000), new ChatData(`chat ${i}`), chatLabeler);
      this.vsServ.addAgendaItem(`room-${(i%3)+1}`, 'video', date, new Date(date.getTime() + 1 * 60 * 60 * 1000), new VideoData(`video ${i}`), videoLabeler);
    }
    this.vsServ.getToolEvents$().pipe(filter((event: ToolEvent) => event.isEdit())).subscribe((event: ToolEvent) => {
      console.log(`got Tool Event: `, event);
      this.agendaItemToEdit = event.agendaItem;
      this.showEditor = true;
    });
  }

  onEditEvent(event: 'save'|'cancel'): void {
    console.log(`editor event: ${event}`);
    this.agendaItemToEdit = null;
    this.showEditor = false;
  }
}
