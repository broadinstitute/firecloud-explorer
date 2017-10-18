import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '@app/core';
import { SharedModule } from '@app/shared';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { FileManagerRoutingModule } from './file-manager-routing.module';

import { DownloadablesReducer } from './reducers/downloadables.reducer';

import { HomeComponent } from './home/home.component';
import { FileExplorerComponent } from './file-explorer/file-explorer.component';
import { TransferableItemComponent } from './transferable-item/transferable-item.component';
import { TransferablesGridComponent } from './transferables-grid/transferables-grid.component';

import { FilesService } from './services/files.service';
import { GcsService } from './services/gcs.service';

@NgModule({
  imports: [
    CommonModule,
    CoreModule,
    SharedModule,
    FileManagerRoutingModule,
    StoreModule.forFeature('downloadables', DownloadablesReducer),
    // EffectsModule.forFeature([SettingsEffects])
  ],
  declarations: [
    HomeComponent,
    FileExplorerComponent,
    TransferableItemComponent,
    TransferablesGridComponent
  ],
  providers: [
    FilesService,
    GcsService
  ],
  exports: [

  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class FileManagerModule { }
