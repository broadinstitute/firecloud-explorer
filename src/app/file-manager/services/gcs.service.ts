import { Observable } from 'rxjs/Observable';
import { Item } from '../models/item';
import { DownloadItem } from '../models/download-item';
import { UploadItem } from '../models/upload-item';
import { ExportToGCSItem } from '../models/export-to-gcs-item';
import { ExportToS3Item } from '../models/export-to-s3-item';


import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { WarningModalComponent } from '@app/file-manager/warning-modal/warning-modal.component';
import { MatDialogRef } from '@angular/material';

export abstract class GcsService {
  cancelGCPExports = false;
  exportToS3Canceled = false;

  abstract getBucketFiles(bucketName: String): Observable<any>;

  abstract downloadFiles(files: DownloadItem[]);

  abstract uploadFiles( files: UploadItem[], bucketName: String);

  abstract exportToGCSFiles(files: ExportToGCSItem[], destinationBucket: String);

  abstract exportToS3Files(files: ExportToS3Item[], destinationBucket: String);

  abstract cancelAll();

  abstract cancelDownloads(): MatDialogRef<WarningModalComponent, any>;

  abstract cancelExportToS3();

  abstract cancelExportsToGCP();

  abstract cancelUploads(): MatDialogRef<WarningModalComponent, any>;

  abstract getBucketFilesWithMaxResult(bucketName: String, delimiter: String, token: String, useDelimiter: Boolean): Observable<any>;


  abstract checkBucketPermissions(bucketName: String): Observable<any>;

}
