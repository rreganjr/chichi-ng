import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ChiChiBypassPanelComponent } from './bypass-panel/bypass-panel.component';
import { ChiChiTurningGlobeComponent } from './turning-globe/turning-globe.component';

@NgModule({
  declarations: [ChiChiBypassPanelComponent, ChiChiTurningGlobeComponent],
  imports: [
    BrowserModule
  ],
  exports: [ChiChiBypassPanelComponent]
})
export class ChichiNgModule { }
