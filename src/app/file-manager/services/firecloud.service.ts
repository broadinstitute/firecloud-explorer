import { Observable } from 'rxjs/Observable';
import { Workspace } from '@app/file-manager/models/workspace';
import { UUID } from 'angular2-uuid';
import { Item } from '@app/file-manager/models/item';


export abstract class FirecloudService {

  public getItemsFromWorkspaces(item, optional): Item {
    let element: Item = null;
    if (optional === false) {
      if (item.public === false) {
        element = this.createItem(item);
      }
    } else {
      element = this.createItem(item);
    }
    return element;
  }

  public getWorkspaces(item, optional): Workspace {
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
      namespace: item.workspace.namespace
    };

  }

  private createItem(item): Item {
    return new Item(item.workspace.name +  item.workspace.bucketName, item.workspace.name, null, null, NaN, '', '', '',
    'Folder', '', item.workspace.bucketName, '/' +  item.workspace.name, '/', true, item.public, item.workspace.namespace);
  }
  abstract getUserFirecloudWorkspaces(optional: boolean): Observable<any>;

  abstract getUserRegistrationStatus(): Observable<any>;
}
