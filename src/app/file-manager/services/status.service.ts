import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { Observable } from 'rxjs/Observable';
import { Item } from '../models/item';
import * as Transferables from '../actions/transferables.actions';
import { Store } from '@ngrx/store';
import { AppState } from '../dbstate/app-state';
import { FilesDatabase } from '../dbstate/files-database';
import { Type } from '@app/file-manager/models/type';
import { LimitTransferablesService } from '@app/file-manager/services/limit-transferables.service';
import {ItemStatus} from '@app/file-manager/models/item-status';

/**
 * Download progress information service
 */
@Injectable()
export class StatusService {

  constructor(private store: Store<AppState>,
    private limitTransferables: LimitTransferablesService,
    private electronService: ElectronService) { }

  updateDownloadProgress(): Observable<any> {
    this.electronService.ipcRenderer.removeAllListeners('download-status');
    return Observable.create((observer) => {
      this.electronService.ipcRenderer.on('download-status', (event, data) => {
        this.updateItem(data, Type.DOWNLOAD, ItemStatus.DOWNLOADING);
        observer.next(this.generalProgress(Type.DOWNLOAD));
      });
    });
  }

  updateUploadProgress(): Observable<any> {
    this.electronService.ipcRenderer.removeAllListeners('upload-status');
    return Observable.create((observer) => {
      this.electronService.ipcRenderer.on('upload-status', (event, data) => {
        this.updateItem(data, Type.UPLOAD, ItemStatus.UPLOADING);
        observer.next(this.generalProgress(Type.UPLOAD));
      });
    });
  }

  private updateItem(data: Item, type: Type, status: ItemStatus) {
    const items = new FilesDatabase(this.store).data.
    filter(item => item.type === type);
    for (let i = 0; i < items.length; i++) {
      if (data.id === items[i].id) {
        this.store.dispatch(new Transferables.UpdateItemProgress(data));
      }
      if (data.progress === 100) {
        this.store.dispatch(new Transferables.UpdateItemCompleted(data));
        this.limitTransferables.pendingItem(type, status);
      }
    }
  }

  private generalProgress(type: Type): number {
    let totalSize = 0;
    let totalTransferred = 0;
    new FilesDatabase(this.store).data.
    filter(item => item.type === type)
    .forEach( item => {
      totalSize += item.size;
      totalTransferred += item.transferred;
    });
    return Math.floor((totalTransferred * 100) / totalSize);
  }

}
