import { Observable } from 'rxjs/Observable';


export abstract class GcsService {

   abstract getBucketFiles(bucketName: String): Observable<any>;

   abstract uploadFiles(bucketName: String, files: any[]);

}
