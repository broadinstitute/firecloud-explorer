import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Item } from '../models/item';
import { TransferableState } from '../reducers/transferables.reducer';
import { AppState } from './app-state';

const initialState: TransferableState = {
  count: 0,
  selectedCount: 0,
  downloadingCount: 0,
  uploadingCount: 0,
  toDownloadCount: 0,
  toUploadCount: 0,
  items: []
};

@Injectable()
export class FilesDatabase {
  itemsObs: Observable<TransferableState>;
  totalCount = 0;

  dataChange: BehaviorSubject<Item[]> = new BehaviorSubject<Item[]>([]);
  selectionChange: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  stateChange: BehaviorSubject<TransferableState> = new BehaviorSubject<TransferableState>(initialState);

  get data(): Item[] {
    return this.dataChange.value;
  }

  get selectedCount(): number {
    return this.selectionChange.value;
  }

  get downloadingCount(): number {
    return this.stateChange.value.downloadingCount;
  }

  get uploadingCount(): number {
    return this.stateChange.value.uploadingCount;
  }

  get toDownloadCount(): number {
    return this.stateChange.value.toDownloadCount;
  }

  get toUploadCount(): number {
    return this.stateChange.value.toUploadCount;
  }

  constructor(private store: Store<AppState>) {

    this.itemsObs = store.select('transferables');
    this.itemsObs.subscribe(data => {
      this.dataChange.next(data.items);
      this.selectionChange.next(data.selectedCount);
      this.stateChange.next(data);
      this.totalCount = data.count;
    });
  }
}
