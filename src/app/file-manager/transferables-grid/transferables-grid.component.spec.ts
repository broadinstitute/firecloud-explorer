import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferablesGridComponent, AppState } from './transferables-grid.component';
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

import { StoreModule, Store, combineReducers } from '@ngrx/store';
import { DownloadableState } from '../reducers/downloadables.reducer';
import { MockStore } from '../reducers/mock-store';

describe('TransferablesGridComponent', () => {
  let component: TransferablesGridComponent;
  let fixture: ComponentFixture<TransferablesGridComponent>;
  // let store: Store<AppState>;

  const itemsMock: DownloadableState = {
    count: 0,
    selectedCount: 0,
    items: []
  };

  beforeEach(async(() => {
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
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ],
      providers: [
        FilesService,
        { provide: GcsService, useClass: GcsApiMockService },
        { provide: FirecloudService, useClass: FirecloudApiMockService },
        {
          provide: Store, useValue: new MockStore({
            count: 0,
            selectedCount: 0,
            items: []
          })
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransferablesGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
