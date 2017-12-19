import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { Observable } from 'rxjs/Observable';
import { FilesDatabase } from '../transferables-grid/transferables-grid.component';
import { Store } from '@ngrx/store';
import * as Downloadables from '../actions/downloadables.actions';

import { DownloadItem } from '../models/downloadItem';
import { Item } from '../models/item';
import { AppState } from '../transferables-grid/transferables-grid.component';

/**
 * Download progress information service
 */
@Injectable()
export class DownloadStatusService {
  private filesDatabase: FilesDatabase;
  private allItemsStatus = Observable;
  private itemsStatus: Array<DownloadItem> = [];

  constructor(private store: Store<AppState>,
    private electronService: ElectronService) { }

  updateProgress(): Observable<any> {
    this.electronService.ipcRenderer.removeAllListeners('download-status');
    const allItemsStatus = Observable.create((observer) => {
      this.electronService.ipcRenderer.on('download-status', (event, data) => {
        const newFile: DownloadItem = { name: data.name, progress: data.total.completed };
        observer.next(this.generalProgress(newFile));
      });
    });
    return allItemsStatus;
  }

  private updateDownloadItem(data: DownloadItem) {
    this.filesDatabase.data
    this.store.dispatch(new Downloadables.UpdateItem(item));
  }

  private generalProgress(data: DownloadItem): number {
    let totalProgress = 0;
    this.updateProgressItem(data);
    this.itemsStatus.forEach( el => {
      totalProgress += el.progress;
    });
    return Math.floor(totalProgress / this.itemsStatus.length);
  }

  private updateProgressItem(data: DownloadItem) {
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
