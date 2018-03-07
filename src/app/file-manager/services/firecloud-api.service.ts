import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { Observable } from 'rxjs/Observable';
import { FirecloudService } from './firecloud.service';
import { Workspace } from '@app/file-manager/models/workspace';
import { Item } from '@app/file-manager/models/item';
import { SelectionService } from '@app/file-manager/services/selection.service';

@Injectable()
export class FirecloudApiService extends FirecloudService {

  public static workspaces: Map<String, String>;
  public isResponseComplete = false;

  constructor(private http: HttpClient,
    private selectionService: SelectionService) {
    super();
  }

  public getUserFirecloudWorkspaces(parentNode: Item, optional: boolean) {
    const workspaceAPI = 'api/workspaces';
    this.isResponseComplete = false;
    FirecloudApiService.workspaces = new Map();

    return this.http.get(environment.FIRECLOUD_API + workspaceAPI)
      .map(
        (resp: any) => {
          const items: Item[] = [];
          const workspaces: Workspace[] = [];

          resp.forEach(wspc => {

            const item: Item = super.getItemsFromWorkspaces(wspc, optional);

            this.processSelection(parentNode, item);

            const workspace: Workspace = super.getWorkspaces(wspc, optional);

            if (workspace !== null) {
              FirecloudApiService.workspaces.set(workspace.name, workspace.bucketName);
              items.push(item);
              workspaces.push(workspace);
            }
          });
          localStorage.setItem('workspaces', JSON.stringify(workspaces));
          this.isResponseComplete = true;
          return items;
        },
        error => {
          console.log('ERROR: ' + error);
        });
  }

  public getUserRegistrationStatus(): Observable<any> {
    const statusAPI = 'me';
    return this.http.get(environment.FIRECLOUD_API + statusAPI)
      .map((resp: Response) => {
        return resp;
      });
  }

  public getIsResponseComplete() {
    return this.isResponseComplete;
  }

  processSelection(parentRow: Item, row: Item) {

    if (parentRow === null || parentRow === undefined) {
      return;
    }

    if (row === null || row === undefined) {
      return;
    }

    if (parentRow.indeterminate === true) {
      // it is selected ?
      const ix = this.selectionService.findSelectionIndex(row);
      if (ix >= 0) {
        const found = this.selectionService.selectedItemByIndex(ix);
        // if so, update incomming item with existing selection state
        row.selected = found.selected;
        row.indeterminate = found.indeterminate;
      }
    } else {
      if (parentRow.selected === true) {
        row.selected = true;
        row.indeterminate = false;
        this.selectionService.selectRow(row);
      } else if (parentRow.selected === false) {
        row.selected = false;
        row.indeterminate = false;
        this.selectionService.deselectRow(row);
      }
    }
  }
}
