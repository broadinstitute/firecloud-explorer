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

import { MatPaginator, MatSort, MatTableDataSource, MatDialog } from '@angular/material';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/merge';
import { GcsService } from '@app/file-manager/services/gcs.service';
import { StatusService } from '../services/status.service';
import { FilesDatabase } from '../dbstate/files-database';
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

  static isExporting: Boolean = false;
  static firstIteration: Boolean = true;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('pbg') pbg: ProgressBar;

  displayedColumns = ['name', 'size', 'status', 'progress', 'actions'];

  dataSource = new MatTableDataSource([]);
  filesDatabase: FilesDatabase;
  generalProgress = 0;
  generalUploadProgress = 0;
  uploadInProgress = false;
  downloadInProgress = false;
  disabledDownload = false;
  disabledUpload = false;
  exportToS3InProgress = false;
  exportToGcpItems = new FilesDatabase(this.store);
  exportToS3Canceled = false;

  // ---------------------------- progress info from here ----------------
  downCompleted = 0;
  downTotal = 0;
  downProgress = 0;

  upCompleted = 0;
  upTotal = 0;
  upProgress = 0;

  gcsCompleted = 0;
  gcsTotal = 0;
  gcsProgress = 0;

  s3Completed = 0;
  s3Total = 0;
  s3Progress = 0;

  downloadState: Observable<DownloadState>;
  uploadState: Observable<UploadState>;
  exportToGCSState: Observable<ExportToGCSState>;
  exportToS3State: Observable<ExportToS3State>;
  // ------------------------------ until here ------------------------

  itemsObs: Observable<TransferableState>;

  modeVariable = 'determinate';
  generalExportToGCPProgress = 0;
  INDETERMINATE = 'indeterminate';
  DETERMINATE = 'determinate';
  exportItems = [];
  uploadCanceled = false;
  downloadCanceled = false;
  exportToGCPCanceled = false;

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
    this.filesDatabase = new FilesDatabase(store);

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
      });
    });

  }

  load() {
    this.store.dispatch(new Transferables.Load());
  }

  filter() {

  }

  // filtering method
  applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();
    this.dataSource.filter = filterValue;
  }

  reset() {
    this.store.dispatch(new Transferables.Reset());
  }

  selectAll() {
    this.store.dispatch(new Transferables.SelectAll());
  }

  unselectAll() {
    this.store.dispatch(new Transferables.UnselectAll());
  }

  toggleSelection() {
    this.store.dispatch(new Transferables.ToggleSelection());
  }

  updateItem(item: any) {
    this.store.dispatch(new Transferables.UpdateItem(item));
  }

  selectItem(item: any) {
    this.store.dispatch(new Transferables.SelectItem(item));
  }

  toggleItemSelection(item: any) {
    this.store.dispatch(new Transferables.ToggleItemSelection(item));
  }

  removeItem(item: any) {
    this.store.dispatch(new Transferables.RemoveItem(item));
  }

  ngOnInit() {

    this.exportToS3Canceled = this.gcsService.exportToS3Canceled;

    this.dataSource.data = this.filesDatabase.data();

    if (localStorage.getItem('displaySpinner') === 'true') {
      this.spinner.show();
      localStorage.removeItem('displaySpinner');
    }
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.dataSource.filterPredicate = (data: Item, filter: string) => data.name.toLowerCase().indexOf(filter) !== -1;
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
    this.gcsService.cancelUploads().afterClosed().subscribe(modalResponse => {
      this.zone.run(() => {
        this.uploadCanceled = modalResponse.exit;
        this.uploadInProgress = !modalResponse.exit;
      });
    });
  }

  cancelDownloads() {
    this.gcsService.cancelDownloads().afterClosed().subscribe(modalResponse => {
      this.zone.run(() => {
        this.downloadCanceled = modalResponse.exit;
        this.downloadInProgress = !modalResponse.exit;
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
        this.exportToGCPCanceled = modalResponse.exit;
        if (modalResponse.exit) {
          this.gcsService.cancelExportsToGCP();
          this.gcsService.cancelGCPExports = true;
          this.gcsService.exportItemCompleted.next(true);
          this.spinner.hide();
        } else {
          this.spinner.hide();
        }
      });
    });
  }

  // handleGcpExport(pendingItems) {
  //   // cancelGCPExports its a flag which indicates if cancel order has been given
  //   if (!this.gcsService.cancelGCPExports) {
  //     // exportToGcpItems passes the list of items to be exported when each chunk has already finished its export
  //     this.limitTransferables.exportItems(pendingItems);
  //   } else {
  //     // prepares the Ui to indicate that exports to gcp have been cancelled
  //     TransferablesGridComponent.isExporting = false;
  //   }
  // }

  cancelExportsToS3() {

    this.gcsService.cancelExportToS3().afterClosed().subscribe(modalResponse => {
      this.zone.run(() => {
        this.exportToS3InProgress = !modalResponse.exit;
        this.exportToS3Canceled = modalResponse.exit;
      });
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

  startGCSExport(files: ExportToGCSItem[], preserveStructure: Boolean) {
    this.limitTransferables.controlExportToGCSItemLimits(files);
  }

  startS3Export(files: ExportToS3Item[], preserveStructure: Boolean) {
    this.limitTransferables.controlExportToS3ItemLimits(files);
  }

  getExportingStatus() {
    return TransferablesGridComponent.isExporting;
  }
}
