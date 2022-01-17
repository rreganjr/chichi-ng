import { NgModule } from '@angular/core';
import {CommonModule} from '@angular/common'

import { ChichiNgComponent } from './chichi-ng.component';
import { BypassPanelComponent } from './bypass-panel/bypass-panel.component';
import { TurningGlobeComponent } from './turning-globe/turning-globe.component';
import { VisualSchedulerComponent } from './visual-scheduler/visual-scheduler.component';



@NgModule({
  declarations: [
    ChichiNgComponent,
    BypassPanelComponent,
    TurningGlobeComponent,
    VisualSchedulerComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ChichiNgComponent
  ]
})
export class ChichiNgModule { }
