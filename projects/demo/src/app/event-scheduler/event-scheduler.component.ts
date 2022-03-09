import { Component, OnInit } from '@angular/core';
import { VisualSchedulerService } from 'chichi-ng';
import { AgendaItemLabeler } from 'chichi-ng';

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
  }

}
