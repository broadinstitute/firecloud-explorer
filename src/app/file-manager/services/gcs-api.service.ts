import { Injectable, NgZone } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '@env/environment';
import { Observable } from 'rxjs/Observable';
import { SecurityService } from './security.service';
import { GcsService } from './gcs.service';
import { ElectronService } from 'ngx-electron';
import { Item } from '../models/item';
import * as Transferables from '../actions/transferables.actions';
import { Store } from '@ngrx/store';
import { FilesDatabase } from '../dbstate/files-database';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/retry';
import { Type } from '@app/file-manager/models/type';
import { ItemStatus } from '@app/file-manager/models/item-status';
import { WarningModalComponent } from '@app/file-manager/warning-modal/warning-modal.component';
import { MatDialog, MatDialogRef } from '@angular/material';
const constants = require('../../../../electron_app/helpers/enviroment').constants;

@Injectable()
export class GcsApiService extends GcsService {
  constructor(private http: HttpClient,
    private electronService: ElectronService,
    private store: Store<any>,
    private dialog: MatDialog,
    private zone: NgZone) {
    super();
  }

  public getBucketFiles(bucketName: String): Observable<any> {
    const url = environment.GOOGLE_URL + 'storage/v1/b/' + bucketName + '/o';
    return this.http.get(url);
  }

  public getBucketFilesWithMaxResult(bucketName: String, prefix: String, pageToken: String, useDelimiter: Boolean): Observable<any> {
    let url = environment.GOOGLE_URL + 'storage/v1/b/'
      + bucketName + '/o?maxResults=' + environment.BUCKETS_MAX_RESULT
      + '&fields=nextPageToken,prefixes,items(id,name,bucket,timeCreated,updated,size,mediaLink)';

    url = useDelimiter ? url.concat('&delimiter=' + '/') : url;
    url = pageToken !== null ? url.concat('&pageToken=' + pageToken) : url;
    url = prefix !== '/' ? url.concat('&prefix=' + prefix) : url;
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
    if (new FilesDatabase(this.store).data.filter(item =>
           item.status === ItemStatus.PENDING
        || item.status === ItemStatus.DOWNLOADING
        || item.status === ItemStatus.UPLOADING
        || item.status === ItemStatus.EXPORTING_GCP).length > 0) {

      this.electronService.ipcRenderer.send(constants.IPC_DOWNLOAD_CANCEL);
      this.cancelItemsStatus(Type.DOWNLOAD);

      this.electronService.ipcRenderer.send(constants.IPC_UPLOAD_CANCEL);
      this.cancelItemsStatus(Type.UPLOAD);

      this.cancelItemsStatus(Type.EXPORT_GCP);
    }
  }

  public cancelDownloads(): MatDialogRef<WarningModalComponent, any> {
    if (this.getFiles(Type.DOWNLOAD).length > 0) {
      return this.openModal(constants.IPC_DOWNLOAD_CANCEL, 'cancelAllDownloads', Type.DOWNLOAD);
    }
  }

  public cancelUploads(): MatDialogRef<WarningModalComponent, any> {
    if (this.getFiles(Type.UPLOAD).length > 0) {
      return this.openModal(constants.IPC_UPLOAD_CANCEL, 'cancelAllUploads', Type.UPLOAD);
    }
  }

  public cancelExportsToGCP() {
    this.cancelGCPExports = true;
    if (this.getFiles(Type.EXPORT_GCP).length > 0) {
      this.cancelItemsStatus(Type.EXPORT_GCP);
    }
  }

  openModal(action: string, data: string, type: string) {
    const dialogRef = this.dialog.open(WarningModalComponent, {
      width: '500px',
      disableClose: true,
      data: data
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.exit) {
        this.electronService.ipcRenderer.send(action);
        this.cancelItemsStatus(type);
      }
    });
    return dialogRef;
  }

  cancelItemsStatus(type: string) {
    this.getFiles(type).forEach(item => {
      this.store.dispatch(new Transferables.UpdateItemCanceled(item));
    });
  }

  getFiles(type: String): Item[] {
    let currentStatus = null;
    switch (type) {
      case Type.EXPORT_GCP:
        currentStatus = ItemStatus.EXPORTING_GCP;
        break;
      case Type.DOWNLOAD:
        currentStatus = ItemStatus.DOWNLOADING;
        break;
      default:
        currentStatus = ItemStatus.UPLOADING;
    }
    return new FilesDatabase(this.store).data.filter(item => item.status === currentStatus ||
      (item.status === ItemStatus.PENDING && item.type === type));
  }

  public checkBucketPermissions(bucketName: String): Observable<any> {
    const url = environment.GOOGLE_URL + 'storage/v1/b/' + bucketName + '/iam/testPermissions?permissions=storage.objects.create';
    return this.http.get(url);
  }

  public exportToGCP(destinationBucket: string, file: Item): Observable<any> {
    const sourceObject = file.path.substring(file.path.indexOf('/') + 1, file.path.length);
    const destinationObject =  localStorage.getItem('preserveStructure') === 'true' ? sourceObject : file.displayName;
    const url = environment.GOOGLE_URL + 'storage/v1/b/' + file.bucketName + '/o/' +
      encodeURIComponent(sourceObject) + '/rewriteTo/b/' + encodeURIComponent(destinationBucket) +
      '/o/' + encodeURIComponent('Imports/' + destinationObject) + '?fields=done';
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + SecurityService.getAccessToken()
      })
    };
    return this.http.post(url, null, httpOptions);
  }

  public exportToGCPFiles(destinationBucket: string, fileList: Item[]) {
    let responseCompleted = 0;
    fileList.forEach(file => {
      this.exportToGCP(destinationBucket, file)
        .subscribe(
        data => {
          this.zone.runOutsideAngular(() => {
            if (data.done) {
              responseCompleted++;
              file.status = ItemStatus.COMPLETED;
              file.progress = 100;
              if (responseCompleted === fileList.length) {
                this.exportItemCompleted.next(true);
              }
            }
          });
        },
        err => {
          console.log(err);
        });
    });
  }
}
