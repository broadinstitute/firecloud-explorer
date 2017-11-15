import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { SharedModule } from '@app/shared';
import { CoreModule } from '@app/core';
import { SettingsModule } from '@app/settings';
import { NgxElectronModule } from 'ngx-electron';
import { RouterTestingModule } from '@angular/router/testing';

import { TransferablesGridComponent } from './transferables-grid.component';
import { FilesService } from '../services/files.service';
import { GcsService } from '../services/gcs.service';
import { GcsApiMockService } from '../services/gcs-api-mock.service';
import { FirecloudService } from '../services/firecloud.service';
import { FirecloudApiMockService } from '../services/firecloud-api-mock.service';

import { StoreModule } from '@ngrx/store';

describe('TransferablesGridComponent', () => {
  let component: TransferablesGridComponent;
  let fixture: ComponentFixture<TransferablesGridComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        TransferablesGridComponent
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
        StoreModule.forFeature('downloadables', {}),
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ],
      providers: [
        FilesService,
        { provide: GcsService, useClass: GcsApiMockService },
        { provide: FirecloudService, useClass: FirecloudApiMockService },
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(TransferablesGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
