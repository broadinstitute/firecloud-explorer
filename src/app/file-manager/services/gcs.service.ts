import { Observable } from 'rxjs/Observable';
import { Item } from '../models/item';

export abstract class GcsService {

   abstract getBucketFiles(bucketName: String): Observable<any>;

   abstract uploadFiles(bucketName: String, files: any[]);

   abstract downloadFiles(files: Item[]);

}
