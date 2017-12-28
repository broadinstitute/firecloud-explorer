import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '@app/core';
import { SharedModule } from '@app/shared';

import { StoreModule } from '@ngrx/store';
import { FileManagerRoutingModule } from './file-manager-routing.module';
import { TransferablesReducer } from './reducers/transferables.reducer';

import { LoginComponent } from './login/login.component';
import { FileExplorerComponent } from './file-explorer/file-explorer.component';
import { TransferablesGridComponent } from './transferables-grid/transferables-grid.component';

import { FilesService } from './services/files.service';
import { FirecloudService } from './services/firecloud.service';
import { GcsService } from './services/gcs.service';
import { DownloadStatusService } from './services/download-status.service';
import { FilesDatabase } from './dbstate/files-database';

import { DownloadValidatorService } from './services/download-validator.service';
import { RegisterUploadService } from './services/register-upload.service';
import { GcsApiService } from './services/gcs-api.service';
import { GcsApiMockService } from './services/gcs-api-mock.service';
import { FirecloudApiService } from './services/firecloud-api.service';
import { FirecloudApiMockService } from './services/firecloud-api-mock.service';
import { ElectronService } from 'ngx-electron';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { RequestInterceptor } from './services/request.interceptor';
import { environment } from '@env/environment';
import { HttpClient } from '@angular/common/http';
import { FileDownloadModalComponent } from './file-download-modal/file-download-modal.component';
import { MatDialogModule } from '@angular/material/dialog';
import { FilterSizePipe } from './filters/filesize-filter';
import { FileUploadModalComponent } from './file-upload-modal/file-upload-modal.component';
import { FileExplorerUploadComponent } from './file-explorer-upload/file-explorer-upload.component';

@NgModule({
  imports: [
    CommonModule,
    CoreModule,
    SharedModule,
    FileManagerRoutingModule,
    StoreModule.forFeature('transferables', TransferablesReducer),
    MatDialogModule
  ],
  declarations: [
    FileExplorerComponent,
    TransferablesGridComponent,
    LoginComponent,
    FileDownloadModalComponent,
    FilterSizePipe,
    FileUploadModalComponent,
    FileExplorerUploadComponent,
  ],
  providers: [
    FilterSizePipe,
    TransferablesGridComponent,
    DownloadStatusService,
    FilesDatabase,
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
      deps: [HttpClient, ElectronService],
      useFactory(http: HttpClient, electronService: ElectronService) {
        if (environment.testing) {
          return new GcsApiMockService();
        } else {
          return new GcsApiService(http, electronService);
        }
      }
    },
    DownloadValidatorService,
    RegisterUploadService
  ],
  exports: [

  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  entryComponents: [
    FileDownloadModalComponent,
    FileUploadModalComponent
  ],
})
export class FileManagerModule { }
