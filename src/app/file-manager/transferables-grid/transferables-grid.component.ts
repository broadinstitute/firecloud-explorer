import { Component, OnInit, AfterViewInit, Input, ViewChild, ChangeDetectionStrategy } from '@angular/core';

import { Store } from '@ngrx/store';
import * as Transferables from '../actions/transferables.actions';
import { DownloadValidatorService } from '../services/download-validator.service';
import { Item } from '../models/item';
import { TransferableState, TransferablesReducer } from '../reducers/transferables.reducer';
import { MatPaginator, MatSort, PageEvent } from '@angular/material';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { DataSource, CollectionViewer } from '@angular/cdk/collections';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/merge';
import { GcsService } from '@app/file-manager/services/gcs.service';
import { Type } from '@app/file-manager/models/type';


export interface AppState {
  transferables: TransferableState;
}

export class FilesDatabase {
  itemsObs: Observable<TransferableState>;
  totalCount = 0;

  dataChange: BehaviorSubject<Item[]> = new BehaviorSubject<Item[]>([]);
  selectionChange: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  get data(): Item[] {
    return this.dataChange.value;
  }

  get selectedCount(): number {
    return this.selectionChange.value;
  }

  constructor(private store: Store<AppState>) {

    this.itemsObs = store.select('transferables');
    this.itemsObs.subscribe(data => {
      this.dataChange.next(data.items);
      this.selectionChange.next(data.selectedCount);
      this.totalCount = data.count;
    });
  }
}

export class FilesDataSource extends DataSource<Item> {
  itemsObs: Observable<TransferableState>;
  dataChange: BehaviorSubject<Item[]> = new BehaviorSubject<Item[]>([]);

  constructor(private filesDB: FilesDatabase,
    private store: Store<AppState>,
    private _sort: MatSort,
    private _paginator: MatPaginator) {

    super();
  }

  connect(): Observable<Item[]> {

    const displayDataChanges = [
      this.filesDB.dataChange,
      this._paginator.page,
      this.filesDB.selectionChange,
      // this._sort.sortChange
    ];

    return Observable.merge(...displayDataChanges).map(() => {

      const data = this.filesDB.data.slice();
      // Grab the page's slice of data.
      const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
      return data.splice(startIndex, this._paginator.pageSize);
    });
  }

  disconnect() {

  }
}

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
  filesDatabase = null;

  constructor(
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
