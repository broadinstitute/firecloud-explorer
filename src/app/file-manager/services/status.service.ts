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
import { ItemStatus } from '@app/file-manager/models/item-status';
import { OnInit } from '@angular/core/src/metadata/lifecycle_hooks';
const constants = require('../../../../electron_app/helpers/enviroment').constants;

/**
 * Download progress information service
 */
@Injectable()
export class StatusService {

  constructor(private store: Store<AppState>,
    private limitTransferables: LimitTransferablesService,
    private electronService: ElectronService) { }


  updateDownloadProgress(): Observable<any> {
    this.electronService.ipcRenderer.removeAllListeners(constants.IPC_DOWNLOAD_STATUS);
    return Observable.create((observer) => {
      this.electronService.ipcRenderer.on(constants.IPC_DOWNLOAD_STATUS, (event, data) => {
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
    if (data.progress === 100) {
      this.store.dispatch(new Transferables.UpdateItemCompleted(data));
      this.limitTransferables.pendingItem(type, status);
    } else {
      this.store.dispatch(new Transferables.UpdateItemProgress(data));
    }
  }

  private generalProgress(type: Type): number {
    let totalSize = 0;
    let totalTransferred = 0;
    new FilesDatabase(this.store).data.
      filter(item => item.type === type)
      .forEach(item => {
        totalSize += Number(item.size);
        totalTransferred += Number(item.transferred);
      });
    return Math.floor((totalTransferred * 100) / totalSize);
  }

  public generalExportProgress(): Observable<any> {
    return Observable.create((observer) => {
      const items = new FilesDatabase(this.store).data.
        filter(item => item.type === Type.EXPORT_GCP && (item.status === ItemStatus.EXPORTING_GCP || item.status === ItemStatus.PENDING));
      observer.next(items.length === 0 ? 'determinate' : 'indeterminate');
    });
  }
}
