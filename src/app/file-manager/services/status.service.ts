import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { Observable } from 'rxjs/Observable';
import { Item } from '../models/item';
import { DownloadItem } from '../models/download-item';
import * as Transferables from '../actions/transferables.actions';
import * as downloadActions from '../actions/download-item.actions';
import * as uploadActions from '../actions/upload-item.actions';
import * as exportToGCSActions from '../actions/export-to-gcs-item.actions';
import * as exportToS3Actions from '../actions/export-to-s3-item.actions';

import { Store } from '@ngrx/store';
import { AppState } from '@app/file-manager/reducers';
import { FilesDatabase } from '../dbstate/files-database';
import { Type } from '@app/file-manager/models/type';
import { LimitTransferablesService } from '@app/file-manager/services/limit-transferables.service';
import { ItemStatus } from '@app/file-manager/models/item-status';
import { S3ExportService } from '@app/file-manager/services/s3-export.service';
import { OnInit } from '@angular/core/src/metadata/lifecycle_hooks';
const constants = require('../../../../electron_app/helpers/environment').constants;

/**
 * Download progress information service
 */
@Injectable()
export class StatusService {

  constructor(private store: Store<AppState>,
    private limitTransferables: LimitTransferablesService,
    private s3Service: S3ExportService,
    private electronService: ElectronService) { }

  /**
   *
   *
   */
  updateDownloadProgress(): Observable<any> {
    console.log('----------------- updateDownloadProgress ----------------- ');
    this.electronService.ipcRenderer.removeAllListeners(constants.IPC_DOWNLOAD_STATUS);

    return Observable.create((observer) => {
      this.electronService.ipcRenderer.on(constants.IPC_DOWNLOAD_STATUS, (event, data) => {
        this.updateDownloadItem(data);
        observer.next(this.generalProgress(Type.DOWNLOAD));
      });
    });

    // this.electronService.ipcRenderer.on(constants.IPC_DOWNLOAD_STATUS, (event, data) => {
    //   this.updateDownloadItem(data, Type.DOWNLOAD, ItemStatus.DOWNLOADING);

    //   observer.next(this.generalProgress(Type.DOWNLOAD));
    // });



  }

  updateExportS3Progress(): Observable<any> {
    this.electronService.ipcRenderer.removeAllListeners(constants.IPC_EXPORT_S3_DOWNLOAD_STATUS);
    return Observable.create((observer) => {
      this.electronService.ipcRenderer.on(constants.IPC_EXPORT_S3_DOWNLOAD_STATUS, (event, data) => {
        observer.next(this.generalProgress(Type.EXPORT_S3));
      });
    });
  }

  updateExportS3Complete(): Observable<any> {
    this.electronService.ipcRenderer.removeAllListeners(constants.IPC_EXPORT_S3_COMPLETE);
    return Observable.create((observer) => {
      this.electronService.ipcRenderer.on(constants.IPC_EXPORT_S3_COMPLETE, (event, data) => {
        if (data.status === ItemStatus.EXPORTED_S3) {
          this.updateItem(data, Type.EXPORT_S3, ItemStatus.EXPORTING_S3);
        } else {
          const existentItem = new FilesDatabase(this.store).data.
            filter(item => item.type === Type.EXPORT_S3 && item.id === data.id)[0];
          if (existentItem.status === ItemStatus.EXPORTING_S3) {
            this.s3Service.startUpload(data);
          }
        }
        observer.next(this.generalProgress(Type.EXPORT_S3));
      });
    });
  }

  updateUploadProgress(): Observable<any> {
    this.electronService.ipcRenderer.removeAllListeners(constants.IPC_UPLOAD_STATUS);
    return Observable.create((observer) => {
      this.electronService.ipcRenderer.on(constants.IPC_UPLOAD_STATUS, (event, data) => {
        this.updateItem(data, Type.UPLOAD, ItemStatus.UPLOADING);
        observer.next(this.generalProgress(Type.UPLOAD));
      });
    });
  }

  /**
   * Update DownloadItem
   * @param data updated DownloadItem
   * @param type entity type
   * @param status entity status
   */
  private updateDownloadItem(item: DownloadItem) {
    console.log('---------------updateDownloadItem--------------------- ', item);
    if (item.progress === 100) {
      this.store.dispatch(new downloadActions.CompleteItem(item));
      this.limitTransferables.pendingDownloadItem();
    } else {
      this.store.dispatch(new downloadActions.UpdateProgress(item));
    }
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
      filter(item => item.type === type && item.currentBatch)
      .forEach(item => {
        totalSize += Number(item.size);
        totalTransferred += Number(item.transferred);
      });
    return Math.floor((totalTransferred * 100) / totalSize);
  }

  /* TODO
    public generalExportProgress(): Observable<any> {
      return Observable.create((observer) => {
        const items = new FilesDatabase(this.store).data.
          filter(item => item.type === Type.EXPORT_GCP && (item.status === ItemStatus.EXPORTING_GCP || item.status === ItemStatus.PENDING));
        observer.next(items.length === 0 ? 'determinate' : 'indeterminate');
      });
    }
  */
}
