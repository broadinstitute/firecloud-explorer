import { Store } from '@ngrx/store';
import { MatPaginator, MatSort } from '@angular/material';
import { DataSource } from '@angular/cdk/collections';
import { Observable } from 'rxjs/Observable';
import { AppState } from './appState';
import { FilesDatabase } from './filesDatabase';
import { Item } from '../models/item';

export class FilesDataSource extends DataSource<Item> {

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
      this.filesDB.selectionChange
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
