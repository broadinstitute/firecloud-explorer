import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { Observable } from 'rxjs/Observable';
import { SecurityService } from './security.service';
import { GcsService } from './gcs.service';
import { ElectronService } from 'ngx-electron';
import { Item } from '../models/item';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/retry';
import * as Transferables from '../actions/transferables.actions';
import { Store } from '@ngrx/store';
import { AppState } from '../dbstate/app-state';
import { FilesDatabase } from '../dbstate/files-database';

@Injectable()
export class GcsApiService extends GcsService {

  constructor(private http: HttpClient,
              private store: Store<AppState>,
              private electronService: ElectronService) {
    super();
  }

  public getBucketFiles(bucketName: String): Observable<any> {
    const url = environment.GOOGLE_URL + 'storage/v1/b/' + bucketName + '/o';
    return this.http.get(url);
  }

  public uploadFiles(bucketName: String, files: any[]) {
      if (files !== null && files.length > 0) {
        this.electronService.ipcRenderer.send('start-upload', bucketName, files, SecurityService.getAccessToken());
      }
  }

  public downloadFiles(files: Item[]) {
    let maxFiles = [];
    if (files.length < 10) {
      maxFiles = files.splice(0, 9);
    }

    maxFiles.forEach(item => {
      this.store.dispatch(new Transferables.UpdateItemDownloading(item));
    });

    this.electronService.ipcRenderer.send('start-download', maxFiles, SecurityService.getAccessToken());
  }

}
