import { Component, OnInit, NgZone, AfterViewInit, Input, ViewChild, ChangeDetectionStrategy } from '@angular/core';

import { Store } from '@ngrx/store';
import * as Transferables from '../actions/transferables.actions';
import { DownloadValidatorService } from '../services/download-validator.service';
import { Item } from '../models/item';
import { MatPaginator, MatSort } from '@angular/material';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/merge';
import { GcsService } from '@app/file-manager/services/gcs.service';
import { StatusService } from '../services/status.service';
import { AppState } from '../dbstate/app-state';
import { FilesDataSource } from '../dbstate/files-datasource';
import { FilesDatabase } from '../dbstate/files-database';

@Component({
  selector: 'app-transferalbes-grid',
  templateUrl: './transferables-grid.component.html',
  styleUrls: ['./transferables-grid.component.css']
})
export class TransferablesGridComponent implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  displayedColumns = ['name', 'size', 'status', 'progress', 'actions'];
  dataSource: FilesDataSource | null;
  filesDatabase: FilesDatabase;
  generalProgress = 0;
  generalUploadProgress = 0;

  constructor(
    private statusService: StatusService,
    private zone: NgZone,
    private store: Store<AppState>,
    private registerDownload: DownloadValidatorService,
    private gcsService: GcsService
  ) {
    this.filesDatabase = new FilesDatabase(store);
  }

  load() {
    this.store.dispatch(new Transferables.Load());
  }

  filter() {

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
    this.dataSource = new FilesDataSource(this.filesDatabase, this.store, this.sort, this.paginator);
    this.statusService.updateProgress().subscribe(data => {
      this.zone.run(() => {
        this.generalProgress = data;
      });
    });
    this.statusService.updateUploadProgress().subscribe(data => {
      this.zone.run(() => {
        this.generalUploadProgress = data;
      });
    });
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

  abortSelected() {
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
    this.gcsService.downloadFiles(files);
  }

  startUpload(files: Item[]) {
    this.gcsService.uploadFiles(localStorage.getItem('uploadBucket'), files);
  }

}
