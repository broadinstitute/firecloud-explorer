import { Component, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';

import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import * as Downloadables from '../actions/downloadables.actions';
import { Item } from '../models/item';
import { DownloadableState, DownloadablesReducer } from '../reducers/downloadables.reducer';
import { MatPaginator, PageEvent } from '@angular/material';
import { DataSource } from '@angular/cdk/collections';

export interface AppState {
  downloadables: DownloadableState;
}

@Component({
  selector: 'app-transferables-grid',
  templateUrl: './transferables-grid.component.html',
  styleUrls: ['./transferables-grid.component.css'],
})
export class TransferablesGridComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;

  itemsObs: Observable<DownloadableState>;
  idCounter = 1;

  color = 'primary';
  mode = 'determinate';
  value = 50;
  bufferValue = 75;

  pageSize = 5;
  pageSizeOptions = [5, 10, 25, 100];
  // MdPaginator Output
  pageEvent: PageEvent;

  data: any;

  selectionCount = 0;

  constructor(private store: Store<AppState>) {
    console.log(store);
    this.itemsObs = store.select('downloadables');
  }

  load() {
    this.store.dispatch(new Downloadables.Load());
  }

  filter() {
    // this.store.dispatch(new Downloadables.Filter());
  }

  reset() {
    this.store.dispatch(new Downloadables.Reset());
  }

  selectAll() {
    this.store.dispatch(new Downloadables.SelectAll());
  }

  unselectAll() {
    this.store.dispatch(new Downloadables.UnselectAll());
  }

  toggleSelection() {
    this.store.dispatch(new Downloadables.ToggleSelection());
  }

  updateItem(item: any) {
    this.store.dispatch(new Downloadables.UpdateItem(item));
  }

  selectItem(item: any) {
    this.store.dispatch(new Downloadables.SelectItem(item));
  }

  removeItem(item: any) {
    this.store.dispatch(new Downloadables.RemoveItem(item));
  }

  ngOnInit() {

    this.itemsObs.subscribe(
      response => {
        this.data = response;
      },
      error => {
        console.log(error);
      }
    );
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

}

