import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import * as Transferables from '../actions/transferables.actions';

import { Item } from '../models/item';
import { AppState } from '../dbstate/app-state';
import { FilesDatabase } from '../dbstate/files-database';

/**
 * Download progress information service
 */
@Injectable()
export class DownloadStatusService {

  constructor(private store: Store<AppState>,
    private electronService: ElectronService) { }

  updateProgress(): Observable<any> {
    this.electronService.ipcRenderer.removeAllListeners('download-status');
    const allItemsStatus = Observable.create((observer) => {
      this.electronService.ipcRenderer.on('download-status', (event, data) => {
        observer.next(this.generalProgress());
        this.updateDownloadItem(data);
      });
    });
    return allItemsStatus;
  }

  private updateDownloadItem(data: Item) {
    const downloadItems = new FilesDatabase(this.store);
    for (let i = 0; i < downloadItems.data.length; i++) {
      if (data.id === downloadItems.data[i].id) {
        this.store.dispatch(new Transferables.UpdateItem(data));
      }
    }
  }

  private generalProgress(): number {
    const downloadItems = new FilesDatabase(this.store);
    let totalProgress = 0;
    downloadItems.data.forEach( el => {
      totalProgress += el.progress;
    });
    return Math.floor(totalProgress / downloadItems.data.length);
  }
}
