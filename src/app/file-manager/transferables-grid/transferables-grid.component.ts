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
import { WarningModalComponent } from '../warning-modal/warning-modal.component';

@Component({
  selector: 'app-transferables-grid',
  templateUrl: './transferables-grid.component.html',
  styleUrls: ['./transferables-grid.component.css']
})

export class TransferablesGridComponent implements OnInit, AfterViewInit {

  /**
   * These values are not persisting through the app execution.
   * When receiving info from any observable we get a new instance from the component,
   * which redefines any local variable. In this case, these values represent changes in the UI.
   * Todo : put needed properties on an object that has the correct lifetime. The Store is the best place.
   * */
  static isExporting: Boolean = false;
  static firstIteration: Boolean = true;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

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
    this.exportToS3Canceled = this.gcsService.exportToS3Canceled;
    this.dataSource.data = this.filesDatabase.data;
    this.statusService.updateDownloadProgress().subscribe(data => {
      this.zone.run(() => {
        this.generalProgress = data;
        this.downloadInProgress = !(data === 100 || this.disabledDownload);
      });
    });

    this.statusService.updateUploadProgress().subscribe(data => {
      this.zone.run(() => {
        this.generalUploadProgress = data;
        this.uploadInProgress = !(data === 100 || this.disabledUpload);
      });
    });

    this.gcsService.exportItemCompleted.subscribe(() => {
      if (!TransferablesGridComponent.firstIteration) {
        const pendingItems = this.exportToGcpItems.data.filter(item => item.type === Type.EXPORT_GCP && item.status === ItemStatus.PENDING);
        if (pendingItems.length !== 0) {
          this.handleGcpExport(pendingItems);
        } else if (TransferablesGridComponent.isExporting) {
          TransferablesGridComponent.isExporting = false;
          TransferablesGridComponent.firstIteration = true;
        }
      }
    });

    this.statusService.updateExportS3Progress().subscribe(data => {
      this.zone.run(() => {
        this.exportToS3InProgress = true;
      });
    });

    this.statusService.updateExportS3Complete().subscribe(data => {
      this.zone.run(() => {
        const items = new FilesDatabase(this.store).data
          .filter(item => item.type === Type.EXPORT_S3 && item.status === ItemStatus.PENDING);
        if (items.length === 0) {
          this.exportToS3InProgress = true;
        }
        this.exportToS3InProgress = !(data === 100 || this.disabledDownload);
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
    this.gcsService.cancelUploads().then(value => {
      this.zone.run(() => {
        this.disabledUpload = value;
      });
    });
  }

  cancelDownloads() {
    this.gcsService.cancelDownloads().then(value => {
      this.zone.run(() => {
        this.disabledDownload = value;
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

    dialogRef.afterClosed().subscribe(result => {
      this.zone.run(() => {
        if (result.exit) {
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

  handleGcpExport(pendingItems) {
    // cancelGCPExports its a flag which indicates if cancel order has been given
    if (!this.gcsService.cancelGCPExports) {
      // exportToGcpItems passes the list of items to be exported when each chunk has already finished its export
      this.limitTransferables.exportItems(pendingItems);
    } else {
      // prepares the Ui to indicate that exports to gcp have been cancelled
      TransferablesGridComponent.isExporting = false;
    }
  }

  cancelExportsToS3() {
    const dialogRef = this.dialog.open(WarningModalComponent, {
      width: '500px',
      disableClose: true,
      data: 'cancelAllExportsToS3'
    });

    dialogRef.afterClosed().subscribe(result => {
      this.zone.run(() => {
        if (result.exit) {
          this.gcsService.cancelExportToS3();
          this.exportToS3InProgress = false;
          this.exportToS3Canceled = true;
          this.gcsService.exportToS3Canceled = true;
        }
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
      TransferablesGridComponent.firstIteration = false;
    }
  }

  getExportingStatus() {
    return TransferablesGridComponent.isExporting;
  }

  updateCurrentBatch(type) {
    let items;
    if (type === Type.EXPORT_GCP || type === Type.EXPORT_S3) {
      items = new FilesDatabase(this.store).data.filter(item => item.type === type && item.currentBatch
        && item.status === ItemStatus.COMPLETED || item.status === ItemStatus.CANCELED);
    } else {
      items = new FilesDatabase(this.store).data.filter(item => item.type === type && item.currentBatch);
    }
    items.forEach(item => {
      item.currentBatch = false;
      this.store.dispatch(new Transferables.UpdateItem(item));
    });
  }
}
