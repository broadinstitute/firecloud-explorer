import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '@app/core';
import { SharedModule } from '@app/shared';

import { Store, StoreModule } from '@ngrx/store';
import { FileManagerRoutingModule } from './file-manager-routing.module';
import { TransferablesReducer } from './reducers/transferables.reducer';
import { DownloadsReducer } from './reducers/downloads.reducer';
import { UploadsReducer } from './reducers/uploads.reducer';
import { ExportToGCSReducer } from './reducers/export-to-gcs.reducer';
import { ExportToS3Reducer } from './reducers/export-to-s3.reducer';

import { LoginComponent } from './login/login.component';
import { FileExplorerComponent } from './file-explorer/file-explorer.component';
import { TransferablesGridComponent } from './transferables-grid/transferables-grid.component';

import { FilesService } from './services/files.service';
import { GcsService } from './services/gcs.service';
import { StatusService } from './services/status.service';
import { BucketService } from './services/bucket.service';

import { DownloadValidatorService } from './services/download-validator.service';
import { RegisterUploadService } from './services/register-upload.service';
import { GcsApiService } from './services/gcs-api.service';
import { GcsApiMockService } from './services/gcs-api-mock.service';
import { FirecloudApiService } from './services/firecloud-api.service';
import { PreflightService } from './services/preflight.service';
import { UploadPreflightService } from './services/upload-preflight.service';
import { ElectronService } from 'ngx-electron';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { RequestInterceptor } from './services/request.interceptor';
import { environment } from '@env/environment';
import { HttpClient } from '@angular/common/http';
import { FileDownloadModalComponent } from './file-download-modal/file-download-modal.component';
import { WarningModalComponent } from './warning-modal/warning-modal.component';
import { MatDialogModule } from '@angular/material/dialog';
import { FilterSizePipe } from './filters/filesize-filter';
import { FileUploadModalComponent } from './file-upload-modal/file-upload-modal.component';
import { FileExplorerUploadComponent } from './file-explorer-upload/file-explorer-upload.component';
import { LimitTransferablesService } from '@app/file-manager/services/limit-transferables.service';
import { MatDialog } from '@angular/material';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { ElectronIpcApiService } from '@app/file-manager/services/electron-ipc.api.service';
import { GoogleLoginService } from '@app/file-manager/services/login-google.service';
import { FileExportModalComponent } from './file-export-modal/file-export-modal.component';
import { S3ExportService } from '@app/file-manager/services/s3-export.service';
import { SelectionService } from '@app/file-manager/services/selection.service';
import { NgZone } from '@angular/core';
import { ProgressTabComponent } from './progress-tab/progress-tab.component';
import { StatusBoxComponent } from './status-box/status-box.component';

@NgModule({
  imports: [
    CommonModule,
    CoreModule,
    SharedModule,
    FileManagerRoutingModule,
    StoreModule.forFeature('transferables', TransferablesReducer),
    StoreModule.forFeature('downloads', DownloadsReducer),
    StoreModule.forFeature('uploads', UploadsReducer),
    StoreModule.forFeature('exportToGCS', ExportToGCSReducer),
    StoreModule.forFeature('exportToS3', ExportToS3Reducer),
    MatDialogModule,
  ],
  declarations: [
    FileExplorerComponent,
    TransferablesGridComponent,
    LoginComponent,
    FileDownloadModalComponent,
    FilterSizePipe,
    FileUploadModalComponent,
    FileExplorerUploadComponent,
    WarningModalComponent,
    BreadcrumbComponent,
    FileExportModalComponent,
    ProgressTabComponent,
    StatusBoxComponent,
  ],
  providers: [
    FilterSizePipe,
    TransferablesGridComponent,
    StatusService,
    FilesService,
    UploadPreflightService,
    PreflightService,
    BucketService,
    GoogleLoginService,
    LimitTransferablesService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: RequestInterceptor,
      multi: true
    },
    FirecloudApiService,
    {
      provide: GcsService,
      deps: [HttpClient, ElectronService, Store, MatDialog, NgZone],
      useFactory(http: HttpClient, electronService: ElectronService, store: Store<any>, dialog: MatDialog) {
        if (environment.testing) {
          return new GcsApiMockService();
        } else {
          return new GcsApiService(http, electronService, store, dialog);
        }
      }
    },
    DownloadValidatorService,
    RegisterUploadService,
    ElectronIpcApiService,
    S3ExportService,
    SelectionService,
  ],
  exports: [

  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  entryComponents: [
    FileDownloadModalComponent,
    FileUploadModalComponent,
    FileExportModalComponent,
    WarningModalComponent
  ],
})
export class FileManagerModule { }
