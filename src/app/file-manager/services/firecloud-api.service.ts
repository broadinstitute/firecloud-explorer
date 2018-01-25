import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { Observable } from 'rxjs/Observable';
import { FirecloudService } from './firecloud.service';
import { UUID } from 'angular2-uuid';
import { Workspace } from '@app/file-manager/models/workspace';
import { Item } from '@app/file-manager/models/item';

@Injectable()
export class FirecloudApiService extends FirecloudService {

  public static workspaces: Map<String, String>;
  constructor(private http: HttpClient) {
    super();
  }

  public getUserFirecloudWorkspaces(optional: boolean) {
    const workspaceAPI = 'api/workspaces';
    FirecloudApiService.workspaces = new Map();
    return this.http.get(environment.FIRECLOUD_API + workspaceAPI)
      .map((resp: any) => {
        const items: Item[] = new Array();
        const workspaces: Workspace[] = new Array();
        resp.forEach(firecloudWorkspace => {
          const item: Item = super.getItemsFromWorkspaces(firecloudWorkspace, optional);
          const workspace: Workspace = super.getWorkspaces(firecloudWorkspace, optional);
          if (workspace !== null) {
            FirecloudApiService.workspaces.set(workspace.name, workspace.bucketName);
            items.push(item);
            workspaces.push(workspace);
          }
        });
        localStorage.setItem('workspaces', JSON.stringify(workspaces));
        return items;
      });
  }

  public getUserRegistrationStatus(): Observable<any> {
    const statusAPI = 'me';
    return this.http.get(environment.FIRECLOUD_API + statusAPI)
      .map((resp: Response) => {
        return resp;
      });
  }
}
