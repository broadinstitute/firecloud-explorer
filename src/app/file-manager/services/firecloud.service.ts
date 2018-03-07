import { Observable } from 'rxjs/Observable';
import { Workspace } from '@app/file-manager/models/workspace';
import { Item } from '@app/file-manager/models/item';
import { SelectionService } from '@app/file-manager/services/selection.service';

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
  // id,
  // name,
  // created,
  // updated,
  // size,
  // mediaLink,
  // path,
  // destination,
  // type,
  // status,
  // bucketName,
  // prefix,
  // delimiter,
  // preserveStructure,
  // open,
  // workspaceName
  private createItem(item): Item {

    return new Item(
      item.workspace.name + item.workspace.bucketName, // id
      item.workspace.name, // name
      null, // created
      null, // updated
      NaN, // size
      '', // mediaLink
      item.workspace.name + '/', // path
      '', // destination
      'Folder', // type
      '', // status
      item.workspace.bucketName, // bucketName
      '/', // + item.workspace.name, // prefix
      '/', // delimiter
      true, // preserveStructure
      item.public, // open
      item.workspace.name, // workspaceName
      item.workspace.name,
      item.workspace.namespace
    );
  }
  abstract getUserFirecloudWorkspaces(item: Item, optional: boolean): Observable<any>;

  abstract getUserRegistrationStatus(): Observable<any>;
}
