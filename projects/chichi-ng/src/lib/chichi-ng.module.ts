import { NgModule } from '@angular/core';
import {CommonModule} from '@angular/common'

import { ChichiNgComponent } from './chichi-ng.component';
import { BypassPanelComponent } from './bypass-panel/bypass-panel.component';
import { TurningGlobeComponent } from './turning-globe/turning-globe.component';
import { VisualSchedulerModule } from './visual-scheduler/visual-scheduler.module';
import { VisualSchedulerComponent } from './visual-scheduler/visual-scheduler.component';
import { ToolboxComponent } from './visual-scheduler/toolbox/toolbox.component';
import { ToolComponent } from './visual-scheduler/toolbox/tool/tool.component';
import { ResourceComponent } from './visual-scheduler/resource/resource.component';


@NgModule({
  declarations: [
    ChichiNgComponent,
    BypassPanelComponent,
    TurningGlobeComponent,
  ],
  imports: [
    CommonModule,
    VisualSchedulerModule
  ],
  exports: [
    ChichiNgComponent,
    BypassPanelComponent,
    TurningGlobeComponent,
    VisualSchedulerComponent,
    ToolboxComponent,
    ToolComponent,
    ResourceComponent,
  ]
})
export class ChichiNgModule { }
