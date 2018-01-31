import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { Observable } from 'rxjs/Observable';
import { SecurityService } from './security.service';
import { GcsService } from './gcs.service';
import { ElectronService } from 'ngx-electron';
import { Item } from '../models/item';
import * as Transferables from '../actions/transferables.actions';
import { AppState } from '../dbstate/app-state';
import { Store } from '@ngrx/store';
import { FilesDatabase } from '../dbstate/files-database';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/retry';
import { Type } from '@app/file-manager/models/type';
import { ItemStatus } from '@app/file-manager/models/item-status';
import { WarningModalComponent } from '@app/file-manager/warning-modal/warning-modal.component';
import { MatDialog } from '@angular/material';

@Injectable()
export class GcsApiService extends GcsService {

  constructor(private http: HttpClient,
              private electronService: ElectronService,
              private store: Store<any>,
              private dialog: MatDialog) {
    super();
  }

  public getBucketFiles(bucketName: String): Observable<any> {
    const url = environment.GOOGLE_URL + 'storage/v1/b/' + bucketName + '/o';
    return this.http.get(url);
  }

  public getBucketFilesWithMaxResult(bucketName: String, delimiter: String, pageToken: String): Observable<any> {
    let url = environment.GOOGLE_URL + 'storage/v1/b/' + bucketName + '/o?maxResults=' + environment.BUCKETS_MAX_RESULT
              + '&delimiter=' + '/';
    url =  pageToken !== null ? url.concat('&pageToken=' + pageToken) : url;
    url =  delimiter !== '/' ? url.concat('&prefix=' + delimiter) : url;
    return this.http.get(url);
  }


  public uploadFiles(bucketName: String, files: any[]) {
    if (files !== null && files.length > 0) {
      this.electronService.ipcRenderer.send('start-upload', bucketName, files, SecurityService.getAccessToken());
    }
  }

  public downloadFiles(files: Item[]) {
    this.electronService.ipcRenderer.send('start-download', files, SecurityService.getAccessToken());
  }

  public cancelAll() {
    const itemsToDownload = this.getDownloadingFiles();
    const itemsToUpload = this.getUploadingFiles();
    if (itemsToDownload.length > 0) {
      this.electronService.ipcRenderer.send('download-cancel');
      this.cancelItemsStatus(itemsToDownload);
    }
    if (itemsToUpload.length > 0) {
      this.electronService.ipcRenderer.send('upload-cancel');
      this.cancelItemsStatus(itemsToUpload);
    }
  }

  public cancelDownloads(): Promise<boolean> {
    const items = this.getDownloadingFiles();
    if (items.length > 0) {
      this.openModal('download-cancel', items, 'cancelAllDownloads');
      return Promise.resolve(true);
    }
  }

  public cancelUploads(): Promise<boolean> {
    const items = this.getUploadingFiles();
    if (items.length > 0) {
      this.openModal('upload-cancel', items, 'cancelAllUploads');
      return Promise.resolve(true);
    }
  }

  openModal(action: string, items: Item[], type: string) {
    const dialogRef = this.dialog.open(WarningModalComponent, {
      width: '500px',
      disableClose: false,
      data: type
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result.exit) {
        this.electronService.ipcRenderer.send(action);
        this.cancelItemsStatus(items);        }
    });
  }
  cancelItemsStatus(items: Item []) {
    items.forEach(item => {
      this.store.dispatch(new Transferables.UpdateItemCanceled(item));
    });
  }

  getDownloadingFiles() {
    const items = new FilesDatabase(this.store).data.
    filter(item => item.status === ItemStatus.DOWNLOADING ||
      (item.status === ItemStatus.PENDING && item.type === Type.DOWNLOAD));
    return items;
  }

  getUploadingFiles() {
    const items = new FilesDatabase(this.store).data.
    filter(item => item.status === ItemStatus.UPLOADING ||
          (item.status === ItemStatus.PENDING && item.type === Type.UPLOAD));
    return items;
  }

}
