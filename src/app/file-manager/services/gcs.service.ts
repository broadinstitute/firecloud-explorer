import { Observable } from 'rxjs/Observable';
import { Item } from '../models/item';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

export abstract class GcsService {

  exportItemCompleted: BehaviorSubject<Boolean> = new BehaviorSubject(false);

  cancelGCPExports = false;

  abstract getBucketFiles(bucketName: String): Observable<any>;

  abstract uploadFiles(bucketName: String, files: any[]);

  abstract downloadFiles(files: Item[]);

  abstract cancelAll();

  abstract cancelDownloads(): Promise<boolean>;

  abstract cancelExportsToGCP();

  abstract cancelUploads(): Promise<boolean>;

  abstract getBucketFilesWithMaxResult(bucketName: String, delimiter: String, token: String, useDelimiter: Boolean): Observable<any>;

  abstract exportToGCPFiles(destinationBucket: String, files: any[]);

  abstract checkBucketPermissions(bucketName: String): Observable<any>;

}
