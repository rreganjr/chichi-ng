import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import { ChichiNgModule } from 'chichi-ng';

import { AppComponent } from './app.component';
import { SignUpOrInComponent } from './sign-up-or-in/sign-up-or-in.component';
import { EventSchedulerComponent } from './event-scheduler/event-scheduler.component';
import { ModalComponent } from './event-scheduler/modal/modal.component';
import { ItemEditorComponent } from './event-scheduler/item-editor/item-editor.component';

@NgModule({
  declarations: [
    AppComponent,
    SignUpOrInComponent,
    EventSchedulerComponent,
    ModalComponent,
    ItemEditorComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ChichiNgModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
