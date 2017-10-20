import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '@env/environment';
import { Observable } from 'rxjs/Observable';
import { TreeNode } from 'primeng/primeng';
import { SecurityService } from './security.service';
import { GcsService } from './gcs.service';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/retry';

@Injectable()
export class GcsApiService extends GcsService {

  constructor(private http: HttpClient) {
    super();
  }

  public getBucketFiles(bucketName: String): Observable<any> {
    const url = environment.GOOGLE_URL + 'storage/v1/b/' + bucketName + '/o';
    return this.http.get(url);
  }

}
