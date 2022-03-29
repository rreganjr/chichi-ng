import { Component, OnInit } from '@angular/core';
import { VisualSchedulerService, AgendaItem, AgendaItemLabeler, ToolEvent } from 'chichi-ng';
import { DateTime } from 'luxon';
import { filter } from 'rxjs';

// interesting note: suppressMilliseconds only works if the value is zero
// see https://stackoverflow.com/questions/49171431/luxon-set-milliseconds-for-toiso

export const ISO8601_datetime_local_opts = {suppressMilliseconds: false, includeOffset: false};

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

  public startDate!: string;
  public endDate!: string;
  public channels: string[] = ['chat', 'video'];
  public showEditor: boolean = false;
  public agendaItemToEdit: AgendaItem|null = null;

  constructor(private vsServ: VisualSchedulerService) {
    const start: Date = new Date();
    //start.setMinutes(0);
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() + 14 * 24 * 60 * 60 * 1000);
    this.startDate = DateTime.fromJSDate(start).toISO(ISO8601_datetime_local_opts);
    this.endDate = DateTime.fromJSDate(end).toISO(ISO8601_datetime_local_opts);

    console.log(`startDate = ${this.startDate} endDate = ${this.endDate}`);
    // TODO: clear the minute because there is a bug where the item rendering is relative to the timeline
    // but the timeline shows the whole hour even though the start may be x minutes into the hour
    // The fix is to shift the rendered items and/or timeline, note if the timeline uses whole hours then
    // there is a gap at the start and end from the bounds start and end which may not be on the hour
    //this.startDate.setMinutes(0); 
//    this.vsServ.setBoundsInterval(Interval.fromDateTimes(this.startDate, this.endDate));
  }

  ngOnInit(): void {
    const date: Date = new Date(new Date(this.startDate).getTime() + 1 * 60 * 60 * 1000);

    let i = 0;
    for (let startDate = date; startDate.getTime() < new Date(this.endDate).getTime() + 60*60*1000; startDate = new Date(startDate.getTime() + 60*60*1000)) {
      i++;
      let endDate = new Date(startDate.getTime() + 1 * 60 * 60 * 1000);
      this.vsServ.addAgendaItem(`room-${(i%3)+1}`, 'chat', startDate, endDate, new ChatData(`chat ${i}`), chatLabeler);
      this.vsServ.addAgendaItem(`room-${(i%3)+1}`, 'video', startDate, endDate, new VideoData(`video ${i}`), videoLabeler);
    }

    // listen for an EDIT {@link ToolEvent} and show the {@link ModalComponent} with the
    // supplied {@link AgendaItem} in the {@link ItemEditorComponent}
    this.vsServ.getToolEvents$().pipe(filter((event: ToolEvent) => event.isEdit())).subscribe((event: ToolEvent) => {
      this.agendaItemToEdit = event.agendaItem;
      this.showEditor = true;
    });
  }

  /**
   * Listen for save/cancel on the {@link ItemEditorComponent.output} and close the editor.
   * The {@link ItemEditorComponent} deals with validation and actual saving
   * 
   * @param event - listen for 'save' or 'cancel' from the {@link ItemEditorComponent.output}
   */
  onEditEvent(event: 'save'|'cancel'): void {
    console.log(`editor event: ${event}`);
    this.agendaItemToEdit = null;
    this.showEditor = false;
  }
}
