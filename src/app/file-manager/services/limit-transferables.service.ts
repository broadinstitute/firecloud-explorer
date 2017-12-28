import { Injectable } from '@angular/core';
import * as Transferables from '../actions/transferables.actions';
import { Item } from '../models/item';
import { Store } from '@ngrx/store';
import { AppState } from '../dbstate/app-state';
import { FilesDatabase } from '../dbstate/files-database';
import {ItemStatus} from '@app/file-manager/models/item-status';
import {GcsService} from '@app/file-manager/services/gcs.service';

@Injectable()
export class LimitTransferablesService {

  constructor(
    private gcsService: GcsService,
    private store: Store<AppState>,
  ) { }

  public completedItem(item: Item): void {

  }

  private pendingItem(item: Item): Item {
    if (item.status === ItemStatus.PENDING) {
      return item;
    }
  }

  public controlLimitItems(files: Item[]): void {
    let maxFiles = [];
    const pendingFiles = files.filter(item => this.pendingItem(item) );
    console.log('Pending files ${pendingFiles}');

    if (files.length > 10) {
      maxFiles = files.splice(0, 10);
    } else {
      maxFiles = files;
    }

    maxFiles.forEach(item => {
      item.status = ItemStatus.DOWNLOADING;
      this.store.dispatch(new Transferables.UpdateItem(item));
    });
    this.gcsService.downloadFiles(maxFiles);
  }
}
