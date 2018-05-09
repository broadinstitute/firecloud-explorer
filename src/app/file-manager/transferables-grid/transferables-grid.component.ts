import { Component, OnInit, NgZone, AfterViewInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Store } from '@ngrx/store';

import * as Transferables from '@app/file-manager/actions/transferables.actions';

import { DownloadValidatorService } from '@app/file-manager/services/download-validator.service';

import { AppState } from '@app/file-manager/reducers';

import { Item } from '@app/file-manager/models/item';
import { DownloadItem } from '@app/file-manager/models/download-item';
import { UploadItem } from '@app/file-manager/models/upload-item';
import { ExportToGCSItem } from '@app/file-manager/models/export-to-gcs-item';
import { ExportToS3Item } from '@app/file-manager/models/export-to-s3-item';

import { TransferableState } from '@app/file-manager/reducers/transferables.reducer';

import { MatDialog } from '@angular/material';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/merge';
import { GcsService } from '@app/file-manager/services/gcs.service';
import { StatusService } from '@app/file-manager/services/status.service';

import { LimitTransferablesService } from '@app/file-manager/services/limit-transferables.service';
import { Type } from '@app/file-manager/models/type';
import { ItemStatus } from '@app/file-manager/models/item-status';
import { S3ExportService } from '@app/file-manager/services/s3-export.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ProgressBar } from 'primeng/primeng';
import { Observable } from 'rxjs/Observable';
import { WarningModalComponent } from '@app/file-manager/warning-modal/warning-modal.component';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Component({
  selector: 'app-transferables-grid',
  templateUrl: './transferables-grid.component.html',
  styleUrls: ['./transferables-grid.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class TransferablesGridComponent implements OnInit, AfterViewInit {

  tabFilter = '';
  selectedIndex: number;
  displayedColumns = ['name', 'size', 'status', 'progress', 'actions'];

  constructor(
    private statusService: StatusService,
    private zone: NgZone,
    private store: Store<AppState>,
    private registerDownload: DownloadValidatorService,
    private gcsService: GcsService,
    private limitTransferables: LimitTransferablesService,
    private s3Service: S3ExportService,
    private spinner: NgxSpinnerService,
    private dialog: MatDialog) {
    this.selectedIndex = 0;
  }

  load() {
    // this.store.dispatch(new Transferables.Load());
  }

  filter() {
  }

  // filtering method
  applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();
    this.tabFilter = filterValue;
  }

  reset() {
    // not yet implemented
    // this.store.dispatch(new Transferables.Reset());
  }

  selectAll() {
    // not yet implemented
    // this.store.dispatch(new Transferables.SelectAll());
  }

  unselectAll() {
    // not yet implemented
    // this.store.dispatch(new Transferables.UnselectAll());
  }

  toggleSelection() {
    // not yet implemented
    // this.store.dispatch(new Transferables.ToggleSelection());
  }

  updateItem(item: any) {
    // not yet implemented
    // this.store.dispatch(new Transferables.UpdateItem(item));
  }

  selectItem(item: any) {
    // not yet implemented
    // this.store.dispatch(new Transferables.SelectItem(item));
  }

  toggleItemSelection(item: any) {
    // not yet implemented
    // this.store.dispatch(new Transferables.ToggleItemSelection(item));
  }

  removeItem(item: any) {
    // not yet implemented
    // this.store.dispatch(new Transferables.RemoveItem(item));
  }

  ngOnInit() {

    if (localStorage.getItem('displaySpinner') === 'true') {
      this.spinner.show();
      localStorage.removeItem('displaySpinner');
    }

    switch (localStorage.getItem('operation-type')) {
      case Type.DOWNLOAD: {
        this.selectedIndex = 0;
        break;
      }
      case Type.UPLOAD: {
        this.selectedIndex = 1;
        break;
      }
      case Type.EXPORT_GCP: {
        this.selectedIndex = 2;
        break;
      }
      case Type.EXPORT_S3: {
        this.selectedIndex = 3;
        break;
      }
      default: {
        this.selectedIndex = 0;
        break;
      }
    }
  }

  ngAfterViewInit() {

  }

  trackSelection(event) {
    this.selectItem(event);
  }

  pauseSelected() {
    // not yet implemented
  }

  resumeSelected() {
    // not yet implemented
  }

  retrySelected() {
    // not yet implemented
  }

  cancelUploads() {
    this.spinner.show();
    const dialogRef = this.dialog.open(WarningModalComponent, {
      width: '500px',
      disableClose: true,
      data: 'cancelAllUploads'
    });

    dialogRef.afterClosed().subscribe(modalResponse => {
      this.zone.run(() => {
        if (modalResponse.exit) {
          this.gcsService.cancelUploads();
        }
        this.spinner.hide();
      });
    });
  }

  cancelDownloads() {
    this.spinner.show();
    const dialogRef = this.dialog.open(WarningModalComponent, {
      width: '500px',
      disableClose: true,
      data: 'cancelAllDownloads'
    });

    dialogRef.afterClosed().subscribe(modalResponse => {
      this.zone.run(() => {
        if (modalResponse.exit) {
          this.gcsService.cancelDownloads();
        }
        this.spinner.hide();
      });
    });
  }

  cancelExportsToGCP() {
    this.spinner.show();
    const dialogRef = this.dialog.open(WarningModalComponent, {
      width: '500px',
      disableClose: true,
      data: 'cancelAllExportsToGCP'
    });

    dialogRef.afterClosed().subscribe(modalResponse => {
      this.zone.run(() => {
        if (modalResponse.exit) {
          this.gcsService.cancelExportsToGCP();
        }
        this.spinner.hide();
      });
    });
  }

  cancelExportsToS3() {
    const dialogRef = this.dialog.open(WarningModalComponent, {
      width: '500px',
      disableClose: true,
      data: 'cancelAllExportsToS3'
    });

    dialogRef.afterClosed().subscribe(modalResponse => {
      if (modalResponse.exit) {
        this.gcsService.cancelExportToS3();
      }
      this.spinner.hide();
    });
  }

  stopAll() {
  }

  selectRowBox(event, cbox, row) {
    this.toggleItemSelection(row);
    cbox.toggle();
    event.stopPropagation();
  }

  isSelected(row) {
    return row.selected;
  }

  sortData(evt) {
  }

  startDownload(files: DownloadItem[]) {
    this.limitTransferables.startDownloading(files);
  }

  startUpload(files: UploadItem[]) {
    this.limitTransferables.startUploading(files);
  }

  startGCSExport(files: ExportToGCSItem[]) {
    this.limitTransferables.startExportingToGCS(files);
  }

  startS3Export(files: ExportToS3Item[]) {
    this.limitTransferables.startExportingToS3(files);
  }

}
