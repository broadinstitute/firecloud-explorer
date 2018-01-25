import { Observable } from 'rxjs/Observable';
import { Item } from '../models/item';

export abstract class GcsService {

  abstract getBucketFiles(bucketName: String): Observable<any>;

  abstract uploadFiles(bucketName: String, files: any[]);

  abstract downloadFiles(files: Item[]);

  abstract cancelAll();

  abstract cancelDownloads();

  abstract cancelUploads();

  abstract getBucketFilesWithMaxResult(bucketName: String, delimiter: String, token: String): Observable<any>;

}
