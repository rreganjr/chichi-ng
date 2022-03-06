import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DndModule } from 'ngx-drag-drop';
import { VisualSchedulerComponent } from './visual-scheduler.component';
import { TimescaleComponent } from './timescale/timescale.component';
import { TimelineComponent } from './resource/agenda-box/timeline/timeline.component';
import { ResourceComponent } from './resource/resource.component';
import { AgendaBoxComponent } from './resource/agenda-box/agenda-box.component';
import { ToolboxComponent } from './toolbox/toolbox.component';
import { ToolComponent } from './toolbox/tool/tool.component';
import { ChannelComponent } from './resource/agenda-box/channel/channel.component';
import { AgendaItemComponent } from './resource/agenda-box/agenda-item/agenda-item.component';

@NgModule({
  declarations: [
    VisualSchedulerComponent,
    TimescaleComponent,
    TimelineComponent,
    ResourceComponent,
    AgendaBoxComponent,
    ToolboxComponent,
    ToolComponent,
    ChannelComponent,
    AgendaItemComponent
  ],
  imports: [
    CommonModule,
    DndModule
  ],
  exports: [
    VisualSchedulerComponent,
    ToolboxComponent,
    ToolComponent,
    ResourceComponent
  ]
})
export class VisualSchedulerModule { }
