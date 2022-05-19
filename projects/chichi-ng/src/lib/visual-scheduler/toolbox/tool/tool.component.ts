import { Component, Input } from '@angular/core';
import { EffectAllowed } from 'ngx-drag-drop';
import { VisualSchedulerService } from '../../visual-scheduler.service';

/**
 * A tool can be dropped on a drop-zone in an appropriate channel based on the toolType
 * equalling the channel name. This creates an agenda item.
 */
@Component({
  selector: 'cc-tool',
  templateUrl: './tool.component.html',
  styleUrls: ['./tool.component.scss']
})
export class ToolComponent {

  /**
   * The tool type is used to determine appropriate {@link ChannelComponent}s that can be dragged to.
   * If the tool type does not match any of the channel names it won't be dropable.
   * TODO: should there be a special case to drop on any channel? perhaps an empty string?
   */
  @Input() toolType: string = '';

  /**
   * Allow controlling if a tool is enabled from outside the scheduler
   */
  @Input() enabled: boolean = true;

  public readonly effectAllowed: EffectAllowed = 'copy';

  constructor(
    private _visualSchedulerService: VisualSchedulerService
  ) { }

  public onDragStart($event: DragEvent, toolType: string) : void {
    this._visualSchedulerService.dragStart($event, toolType);
  }

  public onDragEnd($event: DragEvent, toolType: string) : void {
    this._visualSchedulerService.dragEnd($event, toolType);
  }

}
