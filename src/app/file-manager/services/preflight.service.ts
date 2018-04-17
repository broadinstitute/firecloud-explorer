import { Injectable } from '@angular/core';
import { Item } from '@app/file-manager/models/item';
import { BucketService } from '@app/file-manager/services/bucket.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Type } from '@app/file-manager/models/type';
import { ItemStatus } from '@app/file-manager/models/item-status';
import { Store } from '@ngrx/store';
import { AppState } from '@app/file-manager/reducers';
import * as Transferables from '@app/file-manager/actions/transferables.actions';

@Injectable()
export class PreflightService {

  fileCount = 0;
  totalSize = 0;
  totalFiles = 0;


  loadingFiles = false;
  loadingFolders = 0;

  fileCountObservable: BehaviorSubject<number> = new BehaviorSubject(this.fileCount);
  totalSizeObservable: BehaviorSubject<number> = new BehaviorSubject(this.totalSize);

  selectedFiles: Item[] = [];
  constructor(private bucketService: BucketService,
    private store: Store<AppState>) { }

  processFiles(data, itemType) {
    this.initializeValues();
    /**
     * we filter incoming files to remove some unwanted, aux, files
     * We are removing a dummy file named 'workspaces' used in the
     * selection page to hold N workspaces / buckets as childs of
     * this file.
     * After removing it, files are sorted by name to be able to
     * detect parent folders and fully selected childs folders to
     * remove. Fully selected child folder can be removed since
     * we'll make a request to get all the files under a folder
     * and that includes the files under those childs.
     * That is perfored in filterFolderItems.
     */
    const sortedItems = data.selectedFiles
      .filter(item => item.id !== 'workspaces')
      .map(
      item => {
          /**
           * if item.path === '', it means the item is not really a bucket object
           * but a reference to the bucket itself in order to be included in first
           * page table, where all workspaces / buckets are shown.
           * Since we are using same table / breadcrumb structure to show items
           * obtained from FireCloud (workspaces) and from GCS (files per bucket)
           * we are using some tricks like this to make data models behaves equal.
           */
          if (item.path === '') {
            /*
            * We need to return a cloned and modified object here
            * to not "spoil" the original object since object usage
            * is not the same:
            * Object usage in Selection and breadcrumbs is different
            * than the one in Downloading.
            */
            return this.cloneItem(item);
          }
          return item;
        }
      )
      .sort((itemA, itemB) => itemA.path.localeCompare(itemB.path));

    this.totalFiles = 0;
    this.selectedFiles = [];

    const cleanedItems = this.filterFolderItems(sortedItems);

    this.loadingFiles = true;
    this.loadingFolders = 0;

    cleanedItems
      .forEach(
      item => {
        if (item.type === 'File') {
          this.addToSelectedFiles(item, itemType);
        } else {
          this.getFiles(item, itemType);
        }
      });

    this.loadingFiles = false;
  }


  getFiles(folderItem: Item, itemType) {
    let retrievedItems: Item[] = [];

    this.loadingFolders++;
    this.bucketService.getBucketData(folderItem, null, false, false)
      .subscribe(
        elements => {
          retrievedItems = elements;
        },
        error => {
          console.log('error: ' + JSON.stringify(error, null, 2));
        },
        () => {
          retrievedItems
            .forEach(
              child => {
                this.addToSelectedFiles(child, itemType);
              });
          this.loadingFolders--;
        }
      );
  }

  addToSelectedFiles(item: Item, itemType) {
    const found: Item = this.selectedFiles.find(x => x.mediaLink === item.mediaLink);
    if (found === undefined) {
/* TODO
      if (itemType === Type.EXPORT_GCP) {
        item.type = Type.EXPORT_GCP;
        item.status = ItemStatus.PENDING;
        this.store.dispatch(new Transferables.AddItem(item));
      }
*/
      this.selectedFiles.push(item);
      this.fileCount++;
      this.totalSize += Number(item.size);
      this.fileCountObservable.next(this.fileCount);
      this.totalSizeObservable.next(this.totalSize);
    }
  }

  /**
   * This function filters repeated folders when a parent
   * is all-selected and there are sub-folders in the list,
   * Items with indeterminate === true must be removed because
   * selected content is included as other items.
   * All this extra, non relevante here, items are required
   * in the selection process.
   */
  filterFolderItems(sortedItems: Item[]): Item[] {

    const folderItems = sortedItems.filter(item => item.indeterminate === false);

    const singleItems = [];

    for (let i = 0; i < folderItems.length;) {
      const parent = folderItems[i];

      if (!singleItems.includes(parent)) {
        singleItems.push(parent);
      }
      if (parent.isParentOf(folderItems[i + 1])) {
        folderItems.splice(i + 1, 1);
      } else {
        i++;
      }
    }
    return singleItems;
  }

  cloneItem(item: Item): Item {
    return new Item(
      item.id,
      item.name,
      item.created,
      item.updated,
      item.size,
      item.mediaLink,
      /*
      * Former item.path is replaced with item.workspace + '/'.
      * This is required by downloading approach to detect parent
      * and childs folders.
      * Eventually, we may review the approach to avoid
      * the need to do this.
      *
      */
      item.workspaceName + '/',
      item.destination,
      item.type,
      item.status,
      item.bucketName,
      item.prefix,
      item.delimiter,
      item.preserveStructure,
      item.open,
      item.workspaceName,
      item.displayName,
      item.namespace,
      false,
      item.itype,
      item.istatus);
  }

  initializeValues() {
    this.fileCount = 0;
    this.totalSize = 0;
    this.totalFiles = 0;
    this.loadingFolders = 0;
  }

}
