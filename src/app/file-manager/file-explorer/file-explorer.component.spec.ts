import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { FileExplorerComponent } from './file-explorer.component';
import { RouterModule } from '@angular/router';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { SharedModule } from '@app/shared';
import { CoreModule } from '@app/core';
import { FileManagerModule } from '@app/file-manager';
import { SettingsModule } from '../../settings';
import { NgxElectronModule } from 'ngx-electron';
import { RouterTestingModule } from '@angular/router/testing';


describe('FileExplorerComponent', () => {
  let component: FileExplorerComponent;
  let fixture: ComponentFixture<FileExplorerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        FileExplorerComponent
      ],
      imports: [
        BrowserAnimationsModule,
        RouterModule,
        // core & shared
        CoreModule,
        SharedModule,

        // features
        SettingsModule,
        FileManagerModule,
        NgxElectronModule,
        RouterTestingModule,
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
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
