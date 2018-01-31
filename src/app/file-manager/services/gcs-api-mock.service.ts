import { Injectable } from '@angular/core';
import { GcsService } from './gcs.service';
import { Observable } from 'rxjs/Observable';
import { Item } from '../models/item';
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

  public uploadFiles(bucketName, files: any[]) {}

  public downloadFiles(files: Item[]) {}

  public cancelAll() {}

  public cancelDownloads(): Promise<boolean> { return; }

  public cancelUploads(): Promise<boolean> { return; }

  public getBucketFilesWithMaxResult(bucketName: String, delimiter: String, token: String) {
    return Observable.of();
  }
}
