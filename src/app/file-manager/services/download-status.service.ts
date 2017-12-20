import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import * as Transferables from '../actions/transferables.actions';

import { Item } from '../models/item';
import { AppState } from '../dbstate/appState';
import { FilesDatabase } from '../dbstate/filesDatabase';

/**
 * Download progress information service
 */
@Injectable()
export class DownloadStatusService {
  private filesDatabase: FilesDatabase;
  private allItemsStatus = Observable;
  private itemsStatus: Array<Item> = [];

  constructor(private store: Store<AppState>,
    private electronService: ElectronService) { }

  updateProgress(): Observable<any> {
    this.electronService.ipcRenderer.removeAllListeners('download-status');
    const allItemsStatus = Observable.create((observer) => {
      this.electronService.ipcRenderer.on('download-status', (event, data) => {
        this.updateDownloadItem(data);
        observer.next(this.generalProgress(data));
      });
    });
    return allItemsStatus;
  }

  private updateDownloadItem(data: Item) {
    const downloadItems = (new FilesDatabase(this.store));
    for (let i = 0; i < downloadItems.data.length; i++) {
      if (data.name === downloadItems.data[i].name) {
        downloadItems.data[i].progress = data.progress;
        this.store.dispatch(new Transferables.UpdateItem(downloadItems.data[i]));
      }
    }
  }

  private generalProgress(data: Item): number {
    let totalProgress = 0;
    this.updateProgressItem(data);
    this.itemsStatus.forEach( el => {
      totalProgress += el.progress;
    });
    return Math.floor(totalProgress / this.itemsStatus.length);
  }

  private updateProgressItem(data: Item) {
    let i = 0;
    while (i < this.itemsStatus.length) {
      if (data.name === this.itemsStatus[i].name) {
        this.itemsStatus[i].progress = data.progress;
        return;
      }
      i++;
    }
    this.itemsStatus.push(data);
  }
}
