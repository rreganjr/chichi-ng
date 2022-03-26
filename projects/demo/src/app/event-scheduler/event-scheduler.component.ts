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
    // TODO: clear the minute because there is a bug where the item rendering is relative to the timeline
    // but the timeline shows the whole hour even though the start may be x minutes into the hour
    // The fix is to shift the rendered items and/or timeline, note if the timeline uses whole hours then
    // there is a gap at the start and end from the bounds start and end which may not be on the hour
    this.startDate.setMinutes(0); 
    this.startDate.setSeconds(0);
    this.startDate.setMilliseconds(0);
    this.endDate.setSeconds(0);
    this.endDate.setMilliseconds(0);
  }

  ngOnInit(): void {
    const date: Date = new Date(this.startDate.getTime() + 1 * 60 * 60 * 1000);

    let i = 0;
    for (let startDate = date; startDate.getTime() < this.endDate.getTime() + 60*60*1000; startDate = new Date(startDate.getTime() + 60*60*1000)) {
      i++;
      let endDate = new Date(startDate.getTime() + 1 * 60 * 60 * 1000);
      this.vsServ.addAgendaItem(`room-${(i%3)+1}`, 'chat', startDate, endDate, new ChatData(`chat ${i}`), chatLabeler);
      this.vsServ.addAgendaItem(`room-${(i%3)+1}`, 'video', startDate, endDate, new VideoData(`video ${i}`), videoLabeler);
    }
    this.vsServ.getToolEvents$().pipe(filter((event: ToolEvent) => event.isEdit())).subscribe((event: ToolEvent) => {
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
