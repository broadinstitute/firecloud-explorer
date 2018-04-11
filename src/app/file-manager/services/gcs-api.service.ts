import { Injectable, NgZone } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '@env/environment';
import { Observable } from 'rxjs/Observable';
import { SecurityService } from './security.service';
import { GcsService } from './gcs.service';
import { ElectronService } from 'ngx-electron';

import { Item } from '@app/file-manager/models/item';
import { DownloadItem } from '@app/file-manager/models/download-item';
import { UploadItem } from '@app/file-manager/models/upload-item';
import { ExportToGCSItem } from '@app/file-manager/models/export-to-gcs-item';
import { ExportToS3Item } from '@app/file-manager/models/export-to-s3-item';

import * as Transferables from '@app/file-manager/actions/transferables.actions';
import * as downloadActions from '@app/file-manager/actions/download-item.actions';
import * as exportToGCSActions from '@app/file-manager/actions/export-to-gcs-item.actions';

import { Store } from '@ngrx/store';
import { FilesDatabase } from '@app/file-manager/dbstate/files-database';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/retry';
import { Type } from '@app/file-manager/models/type';
import { ItemStatus } from '@app/file-manager/models/item-status';
import { WarningModalComponent } from '@app/file-manager/warning-modal/warning-modal.component';
import { MatDialog, MatDialogRef } from '@angular/material';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { concatMap } from 'rxjs/operators';
import { UpdateItemProgress } from '@app/file-manager/actions/transferables.actions';


const constants = require('../../../../electron_app/helpers/environment').constants;

@Injectable()
export class GcsApiService extends GcsService {

  constructor(private http: HttpClient,
    private electronService: ElectronService,
    private store: Store<any>,
    private dialog: MatDialog,
    private zone: NgZone) {
    super();

    // this.store.select('downloads').subscribe(
    //   data => {
    //     console.log('----------- GcsApiService store -------------------');
    //       if (data.inProgress.count < 3 && data.pending.count > 0) {
    //         console.log('---- inProgress.count: ' + data.inProgress.count + ' ---- pending.count: ' + data.pending.count);
    //         for (var first in data.pending.items) break;
    //         let nextItems = [];
    //         nextItems.push(Object(first).value);
    //           this.downloadFiles(nextItems);
    //       }
    //   }
    // )
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

  public uploadFiles(files: any[], bucketName: String) {
    if (files !== null && files.length > 0) {
      this.electronService.ipcRenderer.send(constants.IPC_START_UPLOAD, bucketName, files, SecurityService.getAccessToken());
    }
  }

  public downloadFiles(files: DownloadItem[]) {
    if (files === undefined || files === null || files.length <= 0) {
      console.log('---------------------downloadFiles - files empty --------------------------', files);
      return;
    }

    console.log('------------------ gcs-service downloadFiles ------- ', files);
    this.store.dispatch(new downloadActions.ProcessItems({ items: files }));

    this.electronService.ipcRenderer.send(constants.IPC_START_DOWNLOAD, files, SecurityService.getAccessToken());
  }


  public resumeDownload(file: Item) {
    this.electronService.ipcRenderer.send('resume-download', file, SecurityService.getAccessToken());
  }

  public cancelAll() {
    if (new FilesDatabase(this.store).data().filter(item =>
      item.status === ItemStatus.PENDING
      || item.status === ItemStatus.DOWNLOADING
      || item.status === ItemStatus.UPLOADING
      || item.status === ItemStatus.EXPORTING_GCP
      || item.status === ItemStatus.EXPORTING_S3).length > 0) {

      this.electronService.ipcRenderer.send(constants.IPC_DOWNLOAD_CANCEL);
      this.cancelItemsStatus(Type.DOWNLOAD);

      this.electronService.ipcRenderer.send(constants.IPC_UPLOAD_CANCEL);
      this.cancelItemsStatus(Type.UPLOAD);

      this.cancelItemsStatus(Type.EXPORT_S3);

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

  public cancelExportToS3(): MatDialogRef<WarningModalComponent, any> {
    return this.openModal('export-s3-cancel', 'cancelAllExportsToS3', Type.EXPORT_S3);
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
      case Type.EXPORT_S3:
        return new FilesDatabase(this.store).data().filter(item => (item.status === ItemStatus.PENDING && item.type === Type.EXPORT_S3));
      case Type.UPLOAD:
        currentStatus = ItemStatus.UPLOADING;
        break;
    }
    return new FilesDatabase(this.store).data().filter(item => item.status === currentStatus ||
      (item.status === ItemStatus.PENDING && item.type === type));
  }

  public checkBucketPermissions(bucketName: String): Observable<any> {
    const url = environment.GOOGLE_URL + 'storage/v1/b/' + bucketName + '/iam/testPermissions?permissions=storage.objects.create';
    return this.http.get(url);
  }

  // public exportToGCP(destinationBucket: string, file: ExportToGCSItem): Observable<any> {
  //   const sourceObject = file.path.substring(file.path.indexOf('/') + 1, file.path.length);
  //   const destinationObject = localStorage.getItem('preserveStructure') === 'true' ? sourceObject : file.displayName;
  //   const url = environment.GOOGLE_URL + 'storage/v1/b/' + file.bucketName + '/o/' +
  //     encodeURIComponent(sourceObject) + '/rewriteTo/b/' + encodeURIComponent(destinationBucket) +
  //     '/o/' + encodeURIComponent('Imports/' + destinationObject) + '?fields=done,totalBytesRewritten,resource.id';
  //   const httpOptions = {
  //     headers: new HttpHeaders({
  //       'Authorization': 'Bearer ' + SecurityService.getAccessToken()
  //     })
  //   };

  //   return this.http.post(url, null, httpOptions).retry(1);
  // }

  public exportToGCSFiles(files: ExportToGCSItem[], destinationBucket: string) {
    console.log('gcs-api-service' , files, destinationBucket);
    if (files === undefined || files === null || files.length <= 0) {
      console.log('---------------------exportToGCSFiles - files empty --------------------------', files);
      return;
    }

    console.log('------------------ gcs-service exportToGCSFiles ------- ', files);
    this.store.dispatch(new exportToGCSActions.ProcessItems({ items: files }));
    this.electronService.ipcRenderer.send(constants.IPC_EXPORT_GCP, destinationBucket, files, SecurityService.getAccessToken());
  }

  //     const reqs = [];
  //     const responseCompleted = 0;

  //     // // fileList.forEach(file => {
  //     // //   reqs.push(this.exportToGCP(destinationBucket, file).map(r => {
  //     //     return { id: r.id, data: r };
  //     //   })));
  //     // // });

  //     const rq2 = Observable.from(fileList).
  //       pipe(
  //         concatMap(file => this.exportToGCP(destinationBucket, file)));

  //     // forkJoin(reqs).subscribe(
  //     //   data => {
  //     //     console.log('------------------------- before -----------------------');
  //     //     console.log(JSON.stringify(data, null, 2));
  //     //     console.log('------------------------- after  -----------------------');
  //     //   },
  //     //   err => {
  //     //     console.log(err);
  //     //   },
  //     //   () => {
  //     //     //this.exportItemCompleted.next(true);
  //     //   });

  //     rq2.subscribe(
  //       res => {
  // //        this.store.dispatch(new exportToGCSActions.CompleteItems({ items:  }));
  //       },
  //       err => {
  //         console.log(err);
  //       },
  //       () => {
  //         console.log('-------------- termine --------------');
  //       }
  //     );
  //   }


  public exportToS3Files(fileList: ExportToS3Item[], destinationBucket: string) {
    const reqs = [];
    const responseCompleted = 0;
  }

}
