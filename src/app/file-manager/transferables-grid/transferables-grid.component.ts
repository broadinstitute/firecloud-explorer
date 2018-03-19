import { Component, OnInit, NgZone, AfterViewInit, ViewChild, } from '@angular/core';
import { Store } from '@ngrx/store';
import * as Transferables from '../actions/transferables.actions';
import { DownloadValidatorService } from '../services/download-validator.service';
import { Item } from '../models/item';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
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
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable } from 'rxjs/Observable';

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
  disabledDownload = false;
  disabledUpload = false;
  modeVariable = 'determinate';
  generalExportToGCPProgress = 0;
  exportToGCPInProgress = false;
  INDETERMINATE = 'indeterminate';
  DETERMINATE = 'determinate';

  constructor(
    private statusService: StatusService,
    private zone: NgZone,
    private store: Store<AppState>,
    private registerDownload: DownloadValidatorService,
    private gcsService: GcsService,
    private limitTransferables: LimitTransferablesService,
    private spinner: NgxSpinnerService
  ) {
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
    this.dataSource.data = this.filesDatabase.data;
    this.statusService.updateDownloadProgress().subscribe(data => {
      this.zone.run(() => {
        this.generalProgress = data;
        if (data === 100 || this.disabledDownload) {
          this.downloadInProgress = false;
        } else {
          this.downloadInProgress = true;
        }
      });
    });

    this.statusService.updateUploadProgress().subscribe(data => {
      this.zone.run(() => {
        this.generalUploadProgress = data;
        if (data === 100 || this.disabledUpload) {
          this.uploadInProgress = false;
        } else {
          this.uploadInProgress = true;
        }
      });
    });
    this.gcsService.exportItemCompleted.subscribe(data => {
      const items = new FilesDatabase(this.store).data
        .filter(item => item.type === Type.EXPORT_GCP && item.status === ItemStatus.PENDING);
      if (items.length === 0 && TransferablesGridComponent.isExporting) {
        this.modeVariable = this.DETERMINATE;
        this.generalExportToGCPProgress = 100;
        TransferablesGridComponent.isExporting = false;
      } else if (TransferablesGridComponent.isExporting) {
        this.modeVariable = this.INDETERMINATE;
        this.limitTransferables.exportItems(items);
      }
    });
    Observable.timer(2000, 1000).subscribe(t => {
      this.zone.run(() => { });
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
    this.gcsService.cancelExportsToGCP().subscribe(value => {
      this.zone.run(() => {
        this.exportToGCPInProgress = true;
        if (!value) {
          this.spinner.show();
        } else {
          this.spinner.hide();
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

  startExportToGCP(preserveStructure: Boolean) {
    const files = new FilesDatabase(this.store).data
      .filter(item => item.type === Type.EXPORT_GCP && item.status === ItemStatus.PENDING);
    this.modeVariable = this.INDETERMINATE;
    TransferablesGridComponent.isExporting = true;
    localStorage.setItem('preserveStructure', preserveStructure.toString());
    this.spinner.hide();
    this.limitTransferables.exportItems(files);
  }
}
