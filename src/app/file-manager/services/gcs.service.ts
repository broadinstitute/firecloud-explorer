import { Observable } from 'rxjs/Observable';


export abstract class GcsService {

   abstract getBucketFiles(bucketName: String): Observable<any>;

}
