import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse, HttpEventType } from '@angular/common/http';
import { environment } from '@env/environment';
import { Observable } from 'rxjs/Observable';
import { TreeNode } from 'primeng/primeng';
import { SecurityService } from './security.service';
import { GcsService } from './gcs.service';
import { ElectronService } from 'ngx-electron';
import { Item } from '../models/item';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/retry';

@Injectable()
export class GcsApiService extends GcsService {

  constructor(private http: HttpClient, private electronService: ElectronService) {
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
      this.electronService.ipcRenderer.send('start-download', files, SecurityService.getAccessToken());
  }

}
