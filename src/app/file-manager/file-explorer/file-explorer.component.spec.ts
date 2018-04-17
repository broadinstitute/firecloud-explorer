import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FileExplorerComponent } from './file-explorer.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { SharedModule } from '@app/shared';
import { CoreModule } from '@app/core';
import { SettingsModule } from '../../settings';
import { NgxElectronModule } from 'ngx-electron';
import { RouterTestingModule } from '@angular/router/testing';
import { FilesService } from '@app/file-manager/services/files.service';
import { GcsService } from '@app/file-manager/services/gcs.service';
import { GcsApiMockService } from '@app/file-manager/services/gcs-api-mock.service';
import { FirecloudService } from '@app/file-manager/services/firecloud.service';
import { FirecloudApiMockService } from '@app/file-manager/services/firecloud-api-mock.service';
import { FilterSizePipe } from '../filters/filesize-filter';
import { MatDialogModule } from '@angular/material/dialog';
import { FileDownloadModalComponent } from '../file-download-modal/file-download-modal.component';
import { FileExportModalComponent } from '../file-export-modal/file-export-modal.component';
import { ElectronIpcService } from '@app/file-manager/services/electron-ipc.service';
import { ElectronIpcMockService } from '@app/file-manager/services/electron-ipc.mock.service';
import { SelectionService } from '@app/file-manager/services/selection.service';

describe('FileExplorerComponent', () => {
  let component: FileExplorerComponent;
  let fixture: ComponentFixture<FileExplorerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        FileExplorerComponent,
        FilterSizePipe,
        FileDownloadModalComponent,
        FileExportModalComponent

      ],
      imports: [
        BrowserAnimationsModule,
        RouterModule,
        // core & shared
        CoreModule,
        SharedModule,

        // features
        SettingsModule,
        NgxElectronModule,
        RouterTestingModule,
        MatDialogModule,
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ],
      providers: [
        FilterSizePipe,
        FilesService,
        { provide: GcsService, useClass: GcsApiMockService },
        { provide: FirecloudService, useClass: FirecloudApiMockService },
        { provide: ElectronIpcService, useClass: ElectronIpcMockService},
        { provide: SelectionService, useClass: SelectionService}
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileExplorerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

});
