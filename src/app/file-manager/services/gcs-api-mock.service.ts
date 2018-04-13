import { Injectable } from '@angular/core';
import { GcsService } from './gcs.service';
import { Observable } from 'rxjs/Observable';
import { Item } from '../models/item';
import { DownloadItem } from '../models/download-item';
import { UploadItem } from '../models/upload-item';
import { ExportToGCSItem } from '../models/export-to-gcs-item';
import { ExportToS3Item } from '../models/export-to-s3-item';

import * as buckets from 'assets/demo/buckets-content';
import 'rxjs/add/observable/of';
import { WarningModalComponent } from '@app/file-manager/warning-modal/warning-modal.component';
import { MatDialogRef } from '@angular/material';

@Injectable()
export class GcsApiMockService extends GcsService {

  constructor() {
    super();
  }

  public getBucketFiles(bucketName: String) {
    return Observable.of(buckets.default.content(bucketName));
  }

  public uploadFiles(files: any[], bucketName) { }

  public downloadFiles(files: Item[]) { }

  public cancelAll() { }

  public cancelDownloads(): MatDialogRef<WarningModalComponent, any> { return; }

  public cancelUploads(): MatDialogRef<WarningModalComponent, any> { return; }

  public cancelExportsToGCP() { }

  public cancelExportToS3() { return; }

  public getBucketFilesWithMaxResult(bucketName: String, delimiter: String, token: String, useDelimiter: Boolean) {
    return Observable.of();
  }

  public exportToGCSFiles(files: ExportToGCSItem[], destinationBucket: String) { }

  public exportToS3Files(files: ExportToS3Item[], destinationBucket: String) { }

  public checkBucketPermissions(bucketName: String): Observable<any> { return; }

}
