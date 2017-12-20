import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Item } from '../models/item';
import { TransferableState } from '../reducers/transferables.reducer';
import { AppState } from './appState';

@Injectable()
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

    this.itemsObs = store.select('downloadables');
    this.itemsObs.subscribe( data => {
        this.dataChange.next(data.items);
        this.selectionChange.next(data.selectedCount);
        this.totalCount = data.count;
      });
    }
  }
