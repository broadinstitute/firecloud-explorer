import { Injectable } from '@angular/core';
import { FirecloudService } from './firecloud.service';
import { Observable } from 'rxjs/Observable';
import { Item } from '../models/item';
import * as workspaces from 'assets/demo/workspaces';
import { SelectionService } from '@app/file-manager/services/selection.service';

@Injectable()
export class FirecloudApiMockService extends FirecloudService {

  constructor() {
    super();
  }

  public getUserFirecloudWorkspaces(parentItem: Item, optional: boolean) {
    return Observable.of(workspaces.default.content())
      .map((resp: any) => {
        const workspacesList: any[] = new Array();
        resp.forEach(item => {
          const workspace = super.getWorkspaces(item, optional);
          if (workspace !== null) {
            workspacesList.push(workspace);
          }
        });
        return workspacesList;
      });
  }

  public getUserRegistrationStatus() {
    return Observable.of();
  }

}
