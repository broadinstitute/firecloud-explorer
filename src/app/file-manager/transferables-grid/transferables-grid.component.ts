import { Component, OnInit, NgZone, AfterViewInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Store } from '@ngrx/store';

import * as Transferables from '../actions/transferables.actions';

import { DownloadValidatorService } from '../services/download-validator.service';

import { AppState } from '@app/file-manager/reducers';

import { Item } from '../models/item';
import { DownloadItem } from '../models/download-item';
import { UploadItem } from '../models/upload-item';
import { ExportToGCSItem } from '../models/export-to-gcs-item';
import { ExportToS3Item } from '../models/export-to-s3-item';

import { TransferableState } from '../reducers/transferables.reducer';

import { DownloadState } from '../reducers/downloads.reducer';
import { UploadState } from '../reducers/uploads.reducer';
import { ExportToGCSState } from '../reducers/export-to-gcs.reducer';
import { ExportToS3State } from '../reducers/export-to-s3.reducer';

import { MatDialog } from '@angular/material';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/merge';
import { GcsService } from '@app/file-manager/services/gcs.service';
import { StatusService } from '../services/status.service';

import { LimitTransferablesService } from '../services/limit-transferables.service';
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

  displayedColumns = ['name', 'size', 'status', 'progress', 'actions'];

  // ---------------------------- progress info from here ----------------
  downCompleted = 0;
  downTotal = 0;
  downProgress = 0;
  downPending = false;
  downInProgress = false;
  downCanceled = false;

  upCompleted = 0;
  upTotal = 0;
  upProgress = 0;
  upPending = false;
  upInProgress = false;
  upCanceled = false;

  gcsCompleted = 0;
  gcsTotal = 0;
  gcsProgress = 0;
  gcsPending = false;
  gcsInProgress = false;
  gcsCanceled = false;

  s3Completed = 0;
  s3Total = 0;
  s3Progress = 0;
  s3Pending = false;
  s3InProgress = false;
  s3Canceled = false;

  downloadState: Observable<DownloadState>;
  uploadState: Observable<UploadState>;
  exportToGCSState: Observable<ExportToGCSState>;
  exportToS3State: Observable<ExportToS3State>;
  // ------------------------------ to here ------------------------

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

    this.downloadState = this.store.select('downloads');
    this.uploadState = this.store.select('uploads');
    this.exportToGCSState = this.store.select('exportToGCS');
    this.exportToS3State = this.store.select('exportToS3');

    /**
     * registering listeners to download progress info
     */
    this.downloadState.subscribe(cs => {
      this.zone.run(() => {
        this.downCompleted = cs.completed.count;
        this.downTotal = cs.totalCount;
        this.downProgress = cs.totalProgress;
        if (!isFinite(this.downProgress)) {
          this.downProgress = 0;
        }
        this.downInProgress = cs.inProgress.count > 0;
        this.downPending = cs.pending.count > 0;
      });
    });

    /**
     * registering listeners to upload progress info
     */
    this.uploadState.subscribe(cs => {
      this.zone.run(() => {
        this.upCompleted = cs.completed.count;
        this.upTotal = cs.totalCount;
        this.upProgress = cs.totalProgress;
        if (!isFinite(this.upProgress)) {
          this.upProgress = 0;
        }
        this.upInProgress = cs.inProgress.count > 0;
        this.upPending = cs.pending.count > 0;
      });
    });

    /**
     * registering listeners to export-to-gcs progress info
     */
    this.exportToGCSState.subscribe(cs => {
      this.zone.run(() => {
        this.gcsCompleted = cs.completed.count;
        this.gcsTotal = cs.totalCount;
        this.gcsProgress = 100.0 * this.gcsCompleted / this.gcsTotal;
        if (!isFinite(this.gcsProgress)) {
          this.gcsProgress = 0;
        }
        this.gcsInProgress = cs.inProgress.count > 0;
        this.gcsPending = cs.pending.count > 0;
      });
    });

    /**
     * registering listeners to export-to-s3 progress info
     */
    this.exportToS3State.subscribe(cs => {
      this.zone.run(() => {
        this.s3Completed = cs.completed.count;
        this.s3Total = cs.totalCount;
        this.s3Progress = 100.0 * this.s3Completed / this.s3Total;
        if (!isFinite(this.s3Progress)) {
          this.s3Progress = 0;
        }
        this.s3InProgress = cs.inProgress.count > 0;
        this.s3Pending = cs.pending.count > 0;
      });
    });

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
    // this.store.dispatch(new Transferables.Reset());
  }

  selectAll() {
    // this.store.dispatch(new Transferables.SelectAll());
  }

  unselectAll() {
    // this.store.dispatch(new Transferables.UnselectAll());
  }

  toggleSelection() {
    // this.store.dispatch(new Transferables.ToggleSelection());
  }

  updateItem(item: any) {
    // this.store.dispatch(new Transferables.UpdateItem(item));
  }

  selectItem(item: any) {
    // this.store.dispatch(new Transferables.SelectItem(item));
  }

  toggleItemSelection(item: any) {
    // this.store.dispatch(new Transferables.ToggleItemSelection(item));
  }

  removeItem(item: any) {
    // this.store.dispatch(new Transferables.RemoveItem(item));
  }

  ngOnInit() {

    this.s3Canceled = this.gcsService.exportToS3Canceled;

    if (localStorage.getItem('displaySpinner') === 'true') {
      this.spinner.show();
      localStorage.removeItem('displaySpinner');
    }
  }

  ngAfterViewInit() {

  }

  trackSelection(event) {
    this.selectItem(event);
  }

  pauseSelected() {
  }

  resumeSelected() {
  }

  retrySelected() {
  }

  cancelUploads() {
    const dialogRef = this.dialog.open(WarningModalComponent, {
      width: '500px',
      disableClose: true,
      data: 'cancelAllUploads'
    });
    dialogRef.afterClosed().subscribe(modalResponse => {
      if (modalResponse.exit) {
        this.gcsService.cancelUploads();
      }
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
        this.downCanceled = modalResponse.exit;
        this.downInProgress = !modalResponse.exit;
        this.gcsService.cancelDownloads();
        this.spinner.hide();
      });
    });
    //   this.zone.run(() => {
    //     this.downloadCanceled = modalResponse.exit;
    //     this.downloadInProgress = !modalResponse.exit;
    //   });
    // });
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
          this.spinner.hide();
        } else {
          this.spinner.hide();
        }
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
    this.limitTransferables.controlDownloadItemLimits(files);
  }

  startUpload(files: UploadItem[]) {
    this.limitTransferables.controlUploadItemLimits(files);
  }

  startGCSExport(files: ExportToGCSItem[]) {
    this.limitTransferables.controlExportToGCSItemLimits(files);
  }

  startS3Export(files: ExportToS3Item[]) {
    this.limitTransferables.controlExportToS3ItemLimits(files);
  }

}
