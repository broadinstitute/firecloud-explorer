import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import * as Transferables from '../actions/transferables.actions';

import { Item } from '../models/item';
import { AppState } from '../dbstate/app-state';
import { FilesDatabase } from '../dbstate/files-database';
import { Type } from '@app/file-manager/models/type';

/**
 * Download progress information service
 */
@Injectable()
export class StatusService {

  constructor(private store: Store<AppState>,
    private electronService: ElectronService) { }

  updateProgress(): Observable<any> {
    this.electronService.ipcRenderer.removeAllListeners('download-status');
    return Observable.create((observer) => {
      this.electronService.ipcRenderer.on('download-status', (event, data) => {
        this.updateItem(data, Type.DOWNLOAD);
        observer.next(this.generalProgress(Type.DOWNLOAD));
      });
    });
  }

  updateUploadProgress(): Observable<any> {
    this.electronService.ipcRenderer.removeAllListeners('upload-status');
    return Observable.create((observer) => {
      this.electronService.ipcRenderer.on('upload-status', (event, data) => {
        this.updateItem(data, Type.UPLOAD);
        observer.next(this.generalProgress(Type.UPLOAD));
      });
    });
  }

  private updateItem(data: Item, type: String) {
    const items = new FilesDatabase(this.store).data.
    filter(item => item.type === type);
    for (let i = 0; i < items.length; i++) {
      if (data.id === items[i].id) {
        this.store.dispatch(new Transferables.UpdateItemProgress(data));
      }
      if (data.progress === 100) {
        this.store.dispatch(new Transferables.UpdateItemStatus(data));
      }
    }
  }

  private generalProgress(type: String): number {
    let totalSize = 0;
    let totalTransferred = 0;
    const downloadItems = new FilesDatabase(this.store).data.
    filter(item => item.type === type)
    .forEach( item => {
      totalSize += item.size;
      totalTransferred += item.transferred;
    });
    return Math.floor((totalTransferred * 100) / totalSize);
  }

}
