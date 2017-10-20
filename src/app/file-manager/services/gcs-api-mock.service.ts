import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GcsService } from './gcs.service';
import { Observable } from 'rxjs/Observable';
import * as buckets from 'assets/demo/buckets-content';
import 'rxjs/add/observable/of';

@Injectable()
export class GcsApiMockService extends GcsService {

  constructor() {
    super();
  }

  public getBucketFiles(bucketName: String) {
    return Observable.of(buckets.default.content(bucketName));
  }

}
