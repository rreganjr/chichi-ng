import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AgendaItem, VisualSchedulerService } from 'chichi-ng';

@Component({
  selector: 'demo-item-editor',
  templateUrl: './item-editor.component.html',
  styleUrls: ['./item-editor.component.scss']
})
export class ItemEditorComponent implements OnInit {

  @Input() public agendaItem: AgendaItem|null = null;
  @Output() public output: EventEmitter<'save'|'cancel'> = new EventEmitter();

  constructor(
    private _visualSchedulerService: VisualSchedulerService
  ) { }

  ngOnInit(): void {
  }

  public onSave(): void {
    // TODO: form needs to be bound etc.
    if (
      this.agendaItem?.resourceName &&
      this.agendaItem?.channelName &&
      this.agendaItem?.bounds &&
      this._visualSchedulerService.isIntervalAvailable(
        this.agendaItem?.resourceName, 
        this.agendaItem?.channelName, 
        this.agendaItem?.bounds.start.toJSDate(), 
        this.agendaItem?.bounds.start.toJSDate())) {
          // item bounds are valid
          this.output.emit('save');
        } else {
          console.log(`agendaItem bounds conflict`);
        }
  }

  public onCancel(): void {
    this.output.emit('cancel');
  }
}
