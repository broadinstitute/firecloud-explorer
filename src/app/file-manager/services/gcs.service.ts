import { Observable } from 'rxjs/Observable';
import { Item } from '../models/item';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { WarningModalComponent } from '@app/file-manager/warning-modal/warning-modal.component';
import { MatDialogRef } from '@angular/material';

export abstract class GcsService {

  exportItemCompleted: BehaviorSubject<Boolean> = new BehaviorSubject(false);

  cancelGCPExports = false;
  exportToS3Canceled = false;

  abstract getBucketFiles(bucketName: String): Observable<any>;

  abstract uploadFiles(bucketName: String, files: any[]);

  abstract downloadFiles(files: Item[]);

  abstract cancelAll();

  abstract cancelDownloads(): MatDialogRef<WarningModalComponent, any>;

  abstract cancelExportToS3(): MatDialogRef<WarningModalComponent, any>;

  abstract cancelExportsToGCP();

  abstract cancelUploads(): MatDialogRef<WarningModalComponent, any>;

  abstract getBucketFilesWithMaxResult(bucketName: String, delimiter: String, token: String, useDelimiter: Boolean): Observable<any>;

  abstract exportToGCPFiles(destinationBucket: String, files: any[]);

  abstract checkBucketPermissions(bucketName: String): Observable<any>;

}
