import { Component, OnInit, AfterViewInit, Input, ViewChild, ChangeDetectionStrategy, NgZone } from '@angular/core';

import { Store } from '@ngrx/store';
import * as Transferables from '../actions/transferables.actions';
import { RegisterDownloadService } from '../services/register-download.service';
import { Item } from '../models/item';
import { TransferableState, TransferablesReducer } from '../reducers/transferables.reducer';
import { MatPaginator, MatSort, PageEvent } from '@angular/material';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { DownloadStatusService } from '../services/download-status.service';

import { ElectronService} from 'ngx-electron';
import { DataSource, CollectionViewer } from '@angular/cdk/collections';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/merge';

import { AppState } from '../dbstate/appState';
import { FilesDataSource } from '../dbstate/filesDataSource';
import { FilesDatabase } from '../dbstate/filesDatabase';

@Component({
  selector: 'app-transferables-grid',
  templateUrl: './transferables-grid.component.html',
  styleUrls: ['./transferables-grid.component.css'],
})
export class TransferablesGridComponent implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  displayedColumns = ['selected', 'name', 'size', 'status', 'progress', 'actions'];
  dataSource: FilesDataSource | null;
  selectedRows: any[] = [];
  filesDatabase = null;
  idCounter = 1;
  generalProgress = 0;
  completed = 0;

  pageSize = 5;
  pageSizeOptions = [5, 10, 25, 100];

  pageEvent: PageEvent;

  constructor(
    private store: Store<AppState>,
    private registerDownload: RegisterDownloadService,
    private downloadStatus: DownloadStatusService,
    private electronService: ElectronService,
    private zone: NgZone
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
    this.downloadStatus.updateProgress().subscribe(data => {
      this.zone.run(() => {
        console.log(data);
        this.generalProgress = data;
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

  // selectRow(event, row) {
  //   console.log(JSON.stringify(event.target));
  //   this.toggleItemSelection(row);
  //   event.stopPropagation();
  // }
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

  startDownload() {
    this.registerDownload.startDownload(this.filesDatabase.data);
  }
}
