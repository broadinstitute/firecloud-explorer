import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { Observable } from 'rxjs/Observable';
import { SecurityService } from './security.service';
import { GcsService } from './gcs.service';
import { ElectronService } from 'ngx-electron';

import { Item } from '@app/file-manager/models/item';
import { DownloadItem } from '@app/file-manager/models/download-item';
import { ExportToGCSItem } from '@app/file-manager/models/export-to-gcs-item';
import { ExportToS3Item } from '@app/file-manager/models/export-to-s3-item';

import * as Transferables from '@app/file-manager/actions/transferables.actions';
import * as downloadActions from '@app/file-manager/actions/download-item.actions';
import * as uploadActions from '@app/file-manager/actions/upload-item.actions';
import * as exportToGCSActions from '@app/file-manager/actions/export-to-gcs-item.actions';
import * as exportToS3Actions from '@app/file-manager/actions/export-to-s3-item.actions';

import { Store } from '@ngrx/store';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/retry';
import { Type } from '@app/file-manager/models/type';
import { ItemStatus } from '@app/file-manager/models/item-status';
import { MatDialog } from '@angular/material';
import { AppState } from '@app/file-manager/reducers';


const constants = require('../../../../electron_app/helpers/environment').constants;

@Injectable()
export class GcsApiService extends GcsService {

  constructor(private http: HttpClient,
    private electronService: ElectronService,
    private store: Store<AppState>,
    private dialog: MatDialog) {
    super();

  }

  public getBucketFiles(bucketName: String): Observable<any> {
    const url = environment.GOOGLE_URL + 'storage/v1/b/' + bucketName + '/o';
    return this.http.get(url);
  }

  public getBucketFilesWithMaxResult(bucketName: String, prefix: String, pageToken: String, useDelimiter: Boolean): Observable<any> {
    let url = environment.GOOGLE_URL + 'storage/v1/b/'
      + bucketName + '/o?maxResults=' + environment.BUCKETS_MAX_RESULT
      + '&fields=nextPageToken,prefixes,items(id,name,bucket,timeCreated,updated,size,mediaLink,metadata)';

    url = useDelimiter ? url.concat('&delimiter=' + '/') : url;
    url = pageToken !== null ? url.concat('&pageToken=' + pageToken) : url;
    url = prefix !== '/' ? url.concat('&prefix=' + prefix) : url;
    return this.http.get(url);
  }

  public uploadFiles(files: any[], bucketName: String) {
    if (files !== null && files.length > 0) {
      this.store.dispatch(new uploadActions.ProcessItems({ items: files }));
      this.electronService.ipcRenderer.send(constants.IPC_UPLOAD_START, bucketName, files, SecurityService.getAccessToken());
    }
  }

  public downloadFiles(files: DownloadItem[]) {
    if (files === undefined || files === null || files.length <= 0) {
      return;
    }

    this.store.dispatch(new downloadActions.ProcessItems({ items: files }));

    this.electronService.ipcRenderer.send(constants.IPC_DOWNLOAD_START, files, SecurityService.getAccessToken());
  }


  public resumeDownload(file: Item) {
    this.electronService.ipcRenderer.send('resume-download', file, SecurityService.getAccessToken());
  }

  public cancelAll() {
    this.electronService.ipcRenderer.send(constants.IPC_DOWNLOAD_CANCEL);
    this.cancelDownloads();
    this.cancelExportToS3();
    this.cancelUploads();
    this.cancelExportsToGCP();

    this.store.dispatch(new downloadActions.Reset());
    this.store.dispatch(new exportToS3Actions.Reset());
    this.store.dispatch(new exportToGCSActions.Reset());
    this.store.dispatch(new uploadActions.Reset());
  }

  public cancelDownloads(): void {
    this.store.dispatch(new downloadActions.CancelAllItems());
    this.electronService.ipcRenderer.send(constants.IPC_DOWNLOAD_CANCEL);
  }

  public cancelUploads() {
    this.electronService.ipcRenderer.send(constants.IPC_UPLOAD_CANCEL);
    this.store.dispatch(new uploadActions.CancelAllItems());
  }

  public cancelExportsToGCP() {
    this.store.dispatch(new exportToGCSActions.CancelAllItems());
  }

  public cancelExportToS3() {
    this.electronService.ipcRenderer.send('export-s3-cancel');
    this.store.dispatch(new exportToS3Actions.CancelAllItems());
  }

  public checkBucketPermissions(bucketName: String): Observable<any> {
    const url = environment.GOOGLE_URL + 'storage/v1/b/' + bucketName + '/iam/testPermissions?permissions=storage.objects.create';
    return this.http.get(url);
  }

  public exportToGCSFiles(files: ExportToGCSItem[], destinationBucket: string) {
    if (files !== undefined && files === null && files.length > 0) {
      this.store.dispatch(new exportToGCSActions.ProcessItems({ items: files }));
      this.electronService.ipcRenderer.send(constants.IPC_EXPORT_TO_GCP_START, destinationBucket, files, SecurityService.getAccessToken());
    }
  }

}
