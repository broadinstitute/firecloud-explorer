import { Injectable, NgZone } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '@env/environment';
import { Observable } from 'rxjs/Observable';
import { SecurityService } from './security.service';
import { GcsService } from './gcs.service';
import { LimitTransferablesService } from './limit-transferables.service';
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
import { MatDialog } from '@angular/material';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class GcsApiService extends GcsService {
  modalResponse = false;
  modalObservable: BehaviorSubject<boolean> = new BehaviorSubject(this.modalResponse);

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
    const itemsToDownload = this.getDownloadingFiles();
    const itemsToUpload = this.getUploadingFiles();
    const itemsToExport = this.getExportPendingFiles();
    if (itemsToDownload.length > 0) {
      this.electronService.ipcRenderer.send('download-cancel');
      this.cancelItemsStatus(itemsToDownload);
    }
    if (itemsToUpload.length > 0) {
      this.electronService.ipcRenderer.send('upload-cancel');
      this.cancelItemsStatus(itemsToUpload);
    }
    if (itemsToExport.length > 0) {
      this.electronService.ipcRenderer.send('export-gcp-cancel');
      this.cancelItemsStatus(itemsToExport);
    }
  }

  public cancelDownloads(): Promise<boolean> {
    const items = this.getDownloadingFiles();
    if (items.length > 0) {
      this.openModal('download-cancel', 'cancelAllDownloads', Type.DOWNLOAD);
      return Promise.resolve(true);
    }
  }

  public cancelUploads(): Promise<boolean> {
    const items = this.getUploadingFiles();
    if (items.length > 0) {
      this.openModal('upload-cancel', 'cancelAllUploads', Type.UPLOAD);
      return Promise.resolve(true);
    }
  }

  public cancelExportsToGCP(): Observable<boolean> {
    const items = this.getExportPendingFiles();
    if (items.length > 0) {
      this.openModal('export-gcp-cancel', 'cancelAllExportsToGCP', Type.EXPORT_GCP);
      return this.modalObservable;
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
        this.cancelItemsStatus(this.getFiles(type));
        this.modalObservable.next(result.exit);
      }
    });
  }

  cancelItemsStatus(items: Item[]) {
    items.forEach(item => {
      this.store.dispatch(new Transferables.UpdateItemCanceled(item));
    });
  }

  getFiles(type: String): Item[] {
    switch (type) {
      case Type.EXPORT_GCP:
        return this.getExportingFiles();
      case Type.DOWNLOAD:
        return this.getDownloadingFiles();
      default:
        return this.getUploadingFiles();
    }
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

  getExportingFiles() {
    const items = new FilesDatabase(this.store).data.
      filter(item => item.status === ItemStatus.EXPORTING_GCP ||
        (item.status === ItemStatus.PENDING && item.type === Type.EXPORT_GCP));
    return items;
  }

  getExportPendingFiles() {
    const items = new FilesDatabase(this.store).data.
    filter(item => item.type === Type.EXPORT_GCP && item.status === ItemStatus.PENDING);
    return items;
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

  public getExportItemCompleted(): Observable<Boolean> {
    return this.exportItemCompleted;
  }

}
