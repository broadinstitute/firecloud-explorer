import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpHeaders} from '@angular/common/http';


export abstract class FirecloudService {

    public getWorkspaceData(item, optional) {
        let workspace = null;
        if (optional === false) {
            if (item.public === false) {
              workspace = {public: item.public, accessLevel: item.accessLevel,
                bucketName: item.workspace.bucketName, name: item.workspace.name
              };
            }
        } else {
          workspace = {
                public: item.public,
                accessLevel: item.accessLevel,
                bucketName: item.workspace.bucketName,
                name: item.workspace.name
            };
          }
        return workspace;
    }

    abstract getUserFirecloudWorkspaces(optional: boolean): Observable<any>;

}
