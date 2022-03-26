import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AgendaItem, VisualSchedulerService } from 'chichi-ng';

@Component({
  selector: 'demo-item-editor',
  templateUrl: './item-editor.component.html',
  styleUrls: ['./item-editor.component.scss']
})
export class ItemEditorComponent implements OnInit {

  // interesting note: suppressMilliseconds only works if the value is zero
  // see https://stackoverflow.com/questions/49171431/luxon-set-milliseconds-for-toiso
  public readonly ISO8601_datetime_local_opts = {suppressMilliseconds: false, includeOffset: false};
  @Input() public agendaItem: AgendaItem|null = null;
  @Output() public output: EventEmitter<'save'|'cancel'> = new EventEmitter();

  constructor(
    private _visualSchedulerService: VisualSchedulerService
  ) { }

  ngOnInit(): void {
  }

  public onSave(): void {
    this.output.emit('save');
  }

  public onCancel(): void {
    this.output.emit('cancel');
  }
}
