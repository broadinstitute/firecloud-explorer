import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { SharedModule } from '@app/shared';
import { CoreModule } from '@app/core';
import { FileManagerModule } from '@app/file-manager';

import { SettingsModule } from './settings';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgxElectronModule } from 'ngx-electron';
import { GoogleLoginService } from '@app/file-manager/services/login-google.service';

@NgModule({
  imports: [
    // angular
    BrowserAnimationsModule,
    BrowserModule,
    NgxElectronModule,

    // core & shared
    CoreModule,
    SharedModule.forRoot(),

    // features
    SettingsModule,
    FileManagerModule,

    // app
    AppRoutingModule,
  ],
  declarations: [
    AppComponent
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  providers: [
    GoogleLoginService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
