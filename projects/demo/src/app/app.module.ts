import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { SignUpOrInComponent } from './sign-up-or-in/sign-up-or-in.component';
import { ChichiNgModule } from 'chichi-ng';

@NgModule({
  declarations: [
    AppComponent,
    SignUpOrInComponent
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
