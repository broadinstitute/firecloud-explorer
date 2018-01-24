import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { Observable } from 'rxjs/Observable';
import { FirecloudService } from './firecloud.service';

@Injectable()
export class FirecloudApiService extends FirecloudService {

  constructor(private http: HttpClient) {
    super();
  }

  public getUserFirecloudWorkspaces(optional: boolean) {
    const workspaceAPI = 'api/workspaces';
    return this.http.get(environment.FIRECLOUD_API + workspaceAPI)
    .map((resp: any) => {
      const workspaces: any[] = new Array();
       resp.forEach(item => {
        const workspace = super.getWorkspaceData(item, optional);
        if (workspace !== null) {
          workspaces.push(workspace);
        }
      });
      return workspaces;
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
