import { Observable } from 'rxjs/Observable';
import { Workspace } from '@app/file-manager/models/workspace';


export abstract class FirecloudService {

  public getWorkspaceData(item, optional) {
    let workspace: Workspace = null;
    if (optional === false) {
      if (item.public === false) {
        workspace = this.createWorkspace(item);
      }
    } else {
      workspace = this.createWorkspace(item);
    }
    return workspace;
  }

  private createWorkspace(item): Workspace {
    return {
      public: item.public,
      accessLevel: item.accessLevel,
      bucketName: item.workspace.bucketName,
      name: item.workspace.name,
    };

  }
  abstract getUserFirecloudWorkspaces(optional: boolean): Observable<any>;

  abstract getUserRegistrationStatus(): Observable<any>;
}
