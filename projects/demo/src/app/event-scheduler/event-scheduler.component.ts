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
    const startDate: Date = new Date(this.startDate.getTime() + 1 * 60 * 60 * 1000);
    this.vsServ.addAgendaItem('room-1', 'chat', startDate, new Date(startDate.getTime() + 1 * 60 * 60 * 1000), new ChatData('my chat'), chatLabeler);
    this.vsServ.addAgendaItem('room-1', 'video', startDate, new Date(startDate.getTime() + 2 * 60 * 60 * 1000), new VideoData('my awesome video'), videoLabeler);
    this.vsServ.addAgendaItem('room-2', 'chat', startDate, new Date(startDate.getTime() + 3 * 60 * 60 * 1000), new ChatData('my other chat'), chatLabeler);
  }

}
