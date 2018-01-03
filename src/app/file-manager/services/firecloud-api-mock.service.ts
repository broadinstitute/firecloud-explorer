import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FirecloudService } from './firecloud.service';
import { Observable } from 'rxjs/Observable';
import * as workspaces from 'assets/demo/workspaces';

@Injectable()
export class FirecloudApiMockService extends FirecloudService {


  constructor() {
    super();
  }

  public getUserFirecloudWorkspaces(optional: boolean) {
    return Observable.of(workspaces.default.content())
      .map((resp: any) => {
        const workspacesList: any[] = new Array();
        resp.forEach(item => {
          const workspace = super.getWorkspaceData(item, optional);
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
