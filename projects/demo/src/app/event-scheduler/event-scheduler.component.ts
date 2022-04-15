import { AfterViewInit, Component, OnInit } from '@angular/core';
import { VisualSchedulerService, AgendaItem, AgendaItemLabeler, ToolEvent, Timescale, Utils,
  TimescaleNotSetError,
  AgendaItemOutOfBounds,
  AgendaItemConflicts} from 'chichi-ng';
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
export class EventSchedulerComponent implements OnInit, AfterViewInit {

  public startDate!: string;
  public endDate!: string;
  public channels: string[] = ['chat', 'video'];
  public showEditor: boolean = false;
  public agendaItemToEdit: AgendaItem|null = null;
  public timeScale: Timescale|null = null;

  constructor(private _visualSchedulerService: VisualSchedulerService) {
    const start: Date = new Date();
    start.setSeconds(0);
    start.setMilliseconds(0);
    const end: Date = new Date(start.getTime() + 14 * 24 * 60 * 60 * 1000);

    // make the bounds friends to the datetime-local html input component
    this.startDate = Utils.toHtmlDateTimeLocalString(start);
    this.endDate =  Utils.toHtmlDateTimeLocalString(end);

    // if you initialize pre-existing agenda items here, set the bounds on the visualSchedulerService first
    this._visualSchedulerService.setBounds(start, end);
    this.makeTestData();
  }

  ngOnInit(): void {
    console.log(`EventSchedulerComponent.ngOnInit()`);      
    // if you initialize pre-existing agenda items here, set the bounds on the visualSchedulerService first
    this._visualSchedulerService.setBounds(new Date(Date.parse(this.startDate)), new Date(Date.parse(this.endDate)));
    this.makeTestData();

    // listen for an EDIT {@link ToolEvent} and show the {@link ModalComponent} with the
    // supplied {@link AgendaItem} in the {@link ItemEditorComponent}
    this._visualSchedulerService.getToolEvents$().pipe(filter((event: ToolEvent) => event.isEdit())).subscribe((event: ToolEvent) => {
      this.agendaItemToEdit = event.agendaItem;
      this.showEditor = true;
    });

    // this._visualSchedulerService.getTimescale$().subscribe((timeScale: Timescale) => {
    //   this.timeScale = timeScale;
    // });
  }

  ngAfterViewInit(): void {      
    console.log(`EventSchedulerComponent ngAfterViewInit()`);
    // initialize pre-existing agenda items here, after the start/end date gets passed through
    // the visual-schduler component
    this.makeTestData();
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

  /**
   * Create a bunch of test agend items
   * @throws Error if the items are out of bounds, confict with other items, or the bounds aren't set yet
   */
  private makeTestData(): void {
    const date: Date = new Date(new Date(this.startDate).getTime() + 1 * 60 * 60 * 1000);

    let i = 0;
    for (let startDate = date; startDate.getTime() < new Date(this.endDate).getTime() + 60*60*1000; startDate = new Date(startDate.getTime() + 60*60*1000)) {
      i++;
      let endDate = new Date(startDate.getTime() + 1 * 60 * 60 * 1000);
      try {
        this._visualSchedulerService.addAgendaItem(`room-${(i%3)+1}`, 'chat', startDate, endDate, new ChatData(`chat ${i}`), chatLabeler);
        this._visualSchedulerService.addAgendaItem(`room-${(i%3)+1}`, 'video', startDate, endDate, new VideoData(`video ${i}`), videoLabeler);
      } catch (error: any) {
        if (error instanceof TimescaleNotSetError) {
          console.log(error.message, error);
        } else if (error instanceof AgendaItemOutOfBounds) {
          console.log(error.message, error);
        } else if (error instanceof AgendaItemConflicts) {
          console.log(error.message, error);
        } else {
          console.log(`Oopsie something bad happened.`, error);
        }
      }
    }
  }

}
