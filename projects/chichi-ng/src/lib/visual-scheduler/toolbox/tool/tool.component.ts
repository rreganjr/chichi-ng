import { Component, Input, OnInit } from '@angular/core';
import { EffectAllowed } from 'ngx-drag-drop';
import { VisualSchedulerService } from '../../visual-scheduler.service';

@Component({
  selector: 'cc-tool',
  templateUrl: './tool.component.html',
  styleUrls: ['./tool.component.scss']
})
export class ToolComponent implements OnInit {

  @Input() toolType: string = '';
  @Input() data: string = '';
  @Input() effectAllowed: EffectAllowed = 'all';
  @Input() disabled: boolean = false;
  @Input() handle: boolean = false;

  constructor(
    private _visualSchedulerService: VisualSchedulerService
  ) { }

  ngOnInit(): void {
  }

  public onDragStart($event: Event, toolType: string) : void {
    this._visualSchedulerService.dragStart($event, toolType);
  }

  public onDragEnd($event: Event, toolType: string) : void {
    this._visualSchedulerService.dragEnd($event, toolType);
  }

}
