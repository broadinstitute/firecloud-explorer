import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '@app/core';
import { SharedModule } from '@app/shared';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { FileManagerRoutingModule } from './file-manager-routing.module';
import { DownloadablesReducer } from './reducers/downloadables.reducer';

import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { FileExplorerComponent } from './file-explorer/file-explorer.component';
import { TransferableItemComponent } from './transferable-item/transferable-item.component';
import { TransferablesGridComponent } from './transferables-grid/transferables-grid.component';

import { FilesService } from './services/files.service';
import { FirecloudService } from './services/firecloud.service';
import { GcsService } from './services/gcs.service';
import { RegisterDownloadService } from './services/register-download.service';

import { GcsApiService } from './services/gcs-api.service';
import { GcsApiMockService } from './services/gcs-api-mock.service';
import { FirecloudApiService } from './services/firecloud-api.service';
import { FirecloudApiMockService } from './services/firecloud-api-mock.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { RequestInterceptor } from './services/request.interceptor';
import { environment } from '@env/environment';
import { HttpClient } from '@angular/common/http';
import { FileModalComponent } from './file-modal/file-modal.component';
import { MatDialogModule } from '@angular/material/dialog';
import { FilterSizePipe } from './filters/filesize-filter';

@NgModule({
  imports: [
    CommonModule,
    CoreModule,
    SharedModule,
    FileManagerRoutingModule,
    StoreModule.forFeature('downloadables', DownloadablesReducer),
    MatDialogModule
  ],
  declarations: [
    HomeComponent,
    FileExplorerComponent,
    TransferableItemComponent,
    TransferablesGridComponent,
    LoginComponent,
    FileModalComponent,
    FilterSizePipe
  ],
  providers: [
    FilterSizePipe,
    TransferablesGridComponent,
    FilesService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: RequestInterceptor,
      multi: true
    },
    {
      provide: FirecloudService,
      deps: [HttpClient],
      useFactory(http: HttpClient) {
        if (environment.testing) {
          return new FirecloudApiMockService();
        } else {
          return new FirecloudApiService(http);
        }
      }
    },
    {
      provide: GcsService,
      deps: [HttpClient],
      useFactory(http: HttpClient) {
        if (environment.testing) {
          return new GcsApiMockService();
        } else {
          return new GcsApiService(http);
        }
      }
    },
    RegisterDownloadService,
  ],
  exports: [

  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  entryComponents: [
    FileModalComponent
  ],
})
export class FileManagerModule { }
