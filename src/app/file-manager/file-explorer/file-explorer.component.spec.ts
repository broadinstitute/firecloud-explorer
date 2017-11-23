import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FileExplorerComponent } from './file-explorer.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { SharedModule } from '@app/shared';
import { CoreModule } from '@app/core';
import { SettingsModule } from '../../settings';
import { NgxElectronModule } from 'ngx-electron';
import { RouterTestingModule } from '@angular/router/testing';
import { FilesService } from '../services/files.service';
import { GcsService } from '../services/gcs.service';
import { GcsApiMockService } from '../services/gcs-api-mock.service';
import { FirecloudService } from '../services/firecloud.service';
import { FirecloudApiMockService } from '../services/firecloud-api-mock.service';
import { FilterSizePipe } from '../filters/filesize-filter';
import { MatDialogModule } from '@angular/material/dialog';
import { FileModalComponent } from '../file-modal/file-modal.component';


describe('FileExplorerComponent', () => {
  let component: FileExplorerComponent;
  let fixture: ComponentFixture<FileExplorerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        FileExplorerComponent,
        FilterSizePipe,
        FileModalComponent,
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
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileExplorerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
