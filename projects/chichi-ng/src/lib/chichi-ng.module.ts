import { NgModule } from '@angular/core';
import {CommonModule} from '@angular/common'

import { ChichiNgComponent } from './chichi-ng.component';
import { BypassPanelComponent } from './bypass-panel/bypass-panel.component';
import { TurningGlobeComponent } from './turning-globe/turning-globe.component';



@NgModule({
  declarations: [
    ChichiNgComponent,
    BypassPanelComponent,
    TurningGlobeComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ChichiNgComponent,
    BypassPanelComponent,
    TurningGlobeComponent
  ]
})
export class ChichiNgModule { }
