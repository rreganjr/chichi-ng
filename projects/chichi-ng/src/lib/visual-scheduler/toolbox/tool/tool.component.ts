import { Component, Input, OnInit } from '@angular/core';
import { EffectAllowed } from 'ngx-drag-drop';

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

  constructor() { }

  ngOnInit(): void {
  }

  public onDragStart($event: DragEvent, type: string) : void {

  }

  public onDragEnd($event: DragEvent, type: string) : void {

  }

}
