import { Injectable } from '@angular/core';
import * as Transferables from '../actions/transferables.actions';
import { Item } from '../models/item';
import { Store } from '@ngrx/store';
import { AppState } from '../dbstate/app-state';
import { FilesDatabase } from '../dbstate/files-database';
import {ItemStatus} from '@app/file-manager/models/item-status';
import {GcsService} from '@app/file-manager/services/gcs.service';
import { Type } from '@app/file-manager/models/type';

@Injectable()
export class LimitTransferablesService {

  constructor(
    private gcsService: GcsService,
    private store: Store<AppState>,
  ) { }

  public pendingItem(type: Type, status: ItemStatus): void {
    let items = new FilesDatabase(this.store).data;
    items = items.filter(item => item.type === type && item.status === ItemStatus.PENDING);
    console.log('Pending Items ', items);
    this.proceedNextItem(items, type, status);
  }

  public controlLimitItems(files: Item[], type: Type, status: ItemStatus): void {
    let maxFiles = [];

    if (files.length > 1 ) {
      maxFiles = files.splice(0, 2);
    } else {
      maxFiles = files;
    }

    console.log('Max files ', maxFiles);

    maxFiles.forEach(item => {
      item.status = status;
      this.store.dispatch(new Transferables.UpdateItem(item));
    });

    if (type === Type.DOWNLOAD) {
      this.gcsService.downloadFiles(maxFiles);
    } else {
      this.gcsService.uploadFiles(localStorage.getItem('uploadBucket'), maxFiles);
    }
  }

  private proceedNextItem(files: Item[], type: Type, status: ItemStatus): void {
    let maxFiles = [];

    if (files.length > 1 ) {
      maxFiles = files.splice(0, 1);
    } else {
      maxFiles = files;
    }

    console.log('Max files ', maxFiles);

    maxFiles.forEach(item => {
      item.status = status;
      this.store.dispatch(new Transferables.UpdateItem(item));
    });

    if (type === Type.DOWNLOAD) {
      this.gcsService.downloadFiles(maxFiles);
    } else {
      this.gcsService.uploadFiles(localStorage.getItem('uploadBucket'), maxFiles);
    }

  }
}
