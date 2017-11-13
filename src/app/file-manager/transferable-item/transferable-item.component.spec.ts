import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferableItemComponent } from './transferable-item.component';
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

describe('TransferableItemComponent', () => {
  let component: TransferableItemComponent;
  let fixture: ComponentFixture<TransferableItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransferableItemComponent ],
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
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ],
      providers: [
        FilesService,
        { provide: GcsService, useClass: GcsApiMockService },
        { provide: FirecloudService, useClass: FirecloudApiMockService },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransferableItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
