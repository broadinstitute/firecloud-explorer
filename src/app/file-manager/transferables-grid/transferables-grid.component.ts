import { Component, OnInit, NgZone, AfterViewInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import * as Transferables from '../actions/transferables.actions';
import { DownloadValidatorService } from '../services/download-validator.service';
import { Item } from '../models/item';
import { MatPaginator, MatSort, MatTableDataSource, MatDialog } from '@angular/material';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/merge';
import { GcsService } from '@app/file-manager/services/gcs.service';
import { StatusService } from '../services/status.service';
import { AppState } from '../dbstate/app-state';
import { FilesDatabase } from '../dbstate/files-database';
import { LimitTransferablesService } from '../services/limit-transferables.service';
import { Type } from '@app/file-manager/models/type';
import { ItemStatus } from '@app/file-manager/models/item-status';
import { S3ExportService } from '@app/file-manager/services/s3-export.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable } from 'rxjs/Observable';
import { WarningModalComponent } from '../warning-modal/warning-modal.component';

@Component({
  selector: 'app-transferalbes-grid',
  templateUrl: './transferables-grid.component.html',
  styleUrls: ['./transferables-grid.component.css']
})

export class TransferablesGridComponent implements OnInit, AfterViewInit {
  static isExporting: Boolean = false;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  displayedColumns = ['name', 'size', 'status', 'progress', 'actions'];

  dataSource = new MatTableDataSource([]);
  filesDatabase: FilesDatabase;
  generalProgress = 0;
  generalUploadProgress = 0;
  uploadInProgress = false;
  downloadInProgress = false;
  generalExportToGCPProgress = 0;
  generalExportToS3Progress = 0;
  exportToS3InProgress = false;
  exportItems = [];
  uploadCanceled = false;
  downloadCanceled = false;
  exportToGCPCanceled = false;
  exportToS3Canceled = false;

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
    this.generalExportToGCPProgress = 0;

    this.dataSource.data = this.filesDatabase.data;
    this.statusService.updateDownloadProgress().subscribe(data => {
      this.zone.run(() => {
        this.generalProgress = data;
        if (data === 100 ) {
          this.downloadInProgress = false;
          this.generalProgress = 100;
        } else {
          this.downloadInProgress = true;
        }
      });
    });

    this.statusService.updateUploadProgress().subscribe(data => {
      this.zone.run(() => {
        this.generalUploadProgress = data;
        if (data === 100 ) {
          this.uploadInProgress = false;
          this.generalUploadProgress = 100;
        } else {
          this.uploadInProgress = true;
        }
      });
    });

    this.gcsService.exportItemCompleted.subscribe(() => {
        this.exportItems = new FilesDatabase(this.store).data
          .filter(item => item.type === Type.EXPORT_GCP && item.status === ItemStatus.PENDING);

        if (this.exportItems.length !== 0) {
          this.generalExportToGCPProgress =
            Math.round(((this.filesDatabase.data.length - this.exportItems.length ) * 100 ) / this.filesDatabase.data.length);
        }

        if (this.exportItems.length === 0 && TransferablesGridComponent.isExporting) {
          // execute this condition when all exports are completed
          TransferablesGridComponent.isExporting = false;
          this.generalExportToGCPProgress = 100;
          this.spinner.hide();
        } else if (TransferablesGridComponent.isExporting) {
          // execute this condition when exports are still in progress
          if (!this.gcsService.cancelGCPExports) {
            this.limitTransferables.exportItems(this.exportItems);
          } else {
            this.generalExportToGCPProgress = 100;
            TransferablesGridComponent.isExporting = false;
          }
        }
      });

    Observable.timer(2000, 1000).subscribe(t => {
      this.zone.run(() => { });
    });

    this.statusService.updateExportS3Progress().subscribe(data => {
      this.zone.run(() => {
        this.generalExportToS3Progress = data;
        const items = new FilesDatabase(this.store).data
          .filter(item => item.type === Type.EXPORT_S3 && item.status === ItemStatus.PENDING);
        if (items.length === 0 && this.exportToS3InProgress === true) {
          this.exportToS3InProgress = false;
        } else if (items.length !== 0) {
          this.exportToS3InProgress = true;
        }
      });
    });

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
        } else {
          this.spinner.hide();
        }
      });
    });
  }

  cancelExportsToS3() {
    this.gcsService.cancelExportToS3().afterClosed().subscribe(modalResponse => {
      this.zone.run(() => {
        this.exportToS3InProgress = !modalResponse.exit;
        this.exportToS3Canceled = modalResponse.exit;
        console.log('exportToS3InProgress: ', this.exportToS3InProgress);
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

  startDownload(files: Item[]) {
    this.limitTransferables.controlLimitItems(files, Type.DOWNLOAD, ItemStatus.DOWNLOADING);
  }

  startUpload(files: Item[]) {
    this.limitTransferables.controlLimitItems(files, Type.UPLOAD, ItemStatus.UPLOADING);
  }

  startExport(preserveStructure: Boolean, type: Type) {
    const files = new FilesDatabase(this.store).data
      .filter(item => item.type === type && item.status === ItemStatus.PENDING);
    localStorage.setItem('preserveStructure', preserveStructure.toString());
    this.spinner.hide();
    if (type === Type.EXPORT_S3) {
      this.exportToS3InProgress = true;
      this.limitTransferables.controlLimitItems(files, Type.EXPORT_S3, ItemStatus.EXPORTING_S3);
    } else {
      TransferablesGridComponent.isExporting = true;
      this.limitTransferables.exportItems(files);
    }
  }

  getExportingStatus() {
   return TransferablesGridComponent.isExporting;
  }
}
