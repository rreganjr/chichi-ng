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
    this.output.emit('save');
  }

  public onCancel(): void {
    this.output.emit('cancel');
  }
}
