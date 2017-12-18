import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { Observable } from 'rxjs/Observable';
import { FilesDatabase } from '../transferables-grid/transferables-grid.component';

import { DownloadItem } from '../models/downloadItem';

/**
 * Download progress information service
 */
@Injectable()
export class DownloadStatusService {
  private filesDatabase: FilesDatabase;
  private itemsStatus: Array<DownloadItem> = [];

  constructor(private electronService: ElectronService) {
  }

  updateProgress() {
    this.electronService.ipcRenderer.removeAllListeners('download-status');
    const allItemsStatus = Observable.create((observer) => {
      this.electronService.ipcRenderer.on('download-status', (event, data) => {
        const newFile: DownloadItem = { name: data.name, progress: data.total.completed };
        observer.next(this.generalProgress(newFile));
      });
    });
  }

  private generalProgress(data: DownloadItem): number {
    let totalProgress = 0;
    this.updateProgressItem(data);
    this.itemsStatus.forEach( el => {
      totalProgress += el.progress;
      console.log(totalProgress);
    });
    console.log(this.itemsStatus.length);
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
