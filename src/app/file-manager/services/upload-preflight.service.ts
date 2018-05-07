import { Injectable, NgZone } from '@angular/core';
import { Item } from '@app/file-manager/models/item';
import { ElectronService } from 'ngx-electron';
import { RegisterUploadService } from '@app/file-manager/services/register-upload.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Type } from '@app/file-manager/models/type';
import { ItemStatus } from '@app/file-manager/models/item-status';
import { Store } from '@ngrx/store';
import { AppState } from '@app/file-manager/reducers';
import * as Transferables from '@app/file-manager/actions/transferables.actions';
import { UploadItem } from '@app/file-manager/models/upload-item';
import { EntityStatus } from '@app/file-manager/models/entity-status';
const constants = require('../../../../electron_app/helpers/environment').constants;

@Injectable()
export class UploadPreflightService {

  selectedFiles = [];

  fileCount = 0;
  totalSize = 0;
  totalFiles = 0;

  loadingFiles = false;
  loadingFolders = 0;

  fileCountObservable: BehaviorSubject<number> = new BehaviorSubject(this.fileCount);
  totalSizeObservable: BehaviorSubject<number> = new BehaviorSubject(this.totalSize);

  constructor(private electronService: ElectronService,
    private registerUploadService: RegisterUploadService,
    private zone: NgZone,
    private store: Store<AppState>) { }

  processFiles(data) {

    this.loadingFiles = false;
    this.selectedFiles = [];

    this.initializeValues();

    /**
     * store already selected files
     */
    this.zone.run(() => {
      this.selectedFiles = data.selectedFiles
        .filter(item => item.type === 'File' && this.isNotMTD(item.data.name))
        .map(item => {
          this.fileCount++;
          this.totalSize += item.data.size;
          return {
            name: item.name,
            path: item.data.path,
            size: item.data.size
          };
        });
    });

    /**
     * need to sort folders before removing nested folders
     */
    const cleanedItems = this.filterFolderItems(data.selectedFiles
      .filter(item => item.type === 'Folder')
      .filter(item => item.data.expanded === undefined)
      .sort((f1, f2) => {
        if (f1.data.path > f2.data.path) {
          return 1;
        } else if (f1.data.path < f2.data.path) {
          return -1;
        }
        return 0;
      }));

    const sortedItems = cleanedItems
      .forEach(
        item => {

          // should expande recursivelly and select all
          this.electronService.ipcRenderer.once(constants.IPC_GET_RECURSIVE_NODE_CONTENT, (event, nodeFiles) => {

            nodeFiles.result
              .filter(child => this.isNotMTD(child.name))
              .forEach(child => {
                this.fileCount++;
                this.totalSize += child.size;

                this.addFile({
                  name: child.name,
                  path: child.path,
                  size: child.size
                });
              });

          }
          );
          this.registerUploadService.getRecursiveNodeContent(item.data.path);
        }
      );
    this.loadingFiles = false;
  }

  addFile(fileNode) {
    this.selectedFiles.push(fileNode);
  }

  /**
   * This function filters repeated folders when a parent
   * is all-selected and there are sub-folders in the list.
   */
  filterFolderItems(items: any[]): any[] {

    const singleItems = [];
    const folderItems = items.filter(item => item.type === 'Folder');

    for (let i = 0; i < folderItems.length;) {
      const parent = folderItems[i];

      if (!singleItems.includes(parent)) {
        singleItems.push(parent);
      }

      if (this.isParentOf(parent, folderItems[i + 1])) {
        folderItems.splice(i + 1, 1);
      } else {
        i++;
      }
    }
    return singleItems;
  }

  isParentOf(parent, child): boolean {

    if (parent.type === 'File') {
      return false;
    }

    if (child === undefined) {
      return false;
    }
    return child.data.path.startsWith(parent.data.path);
  }

  isNotMTD(name: string) {
    return !name.toLowerCase().endsWith('.mtd');
  }

  initializeValues() {
    this.fileCount = 0;
    this.totalSize = 0;
    this.totalFiles = 0;
    this.loadingFolders = 0;
  }

}
