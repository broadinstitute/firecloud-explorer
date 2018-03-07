import { Component, Inject, Output, NgZone, OnInit, EventEmitter } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Item } from '@app/file-manager/models/item';
import * as Transferables from '../actions/transferables.actions';
import { Store } from '@ngrx/store';
import { AppState } from '../dbstate/app-state';
import { Message } from 'primeng/components/common/api';
import { DiskStatus } from '../models/diskStatus';
import { DownloadValidatorService } from '@app/file-manager/services/download-validator.service';
import { Type } from '@app/file-manager/models/type';
import { Router } from '@angular/router';
import { ItemStatus } from '@app/file-manager/models/item-status';
import { TransferablesGridComponent } from '@app/file-manager/transferables-grid/transferables-grid.component';
import { BucketService } from '../services/bucket.service';
import { FilterSizePipe } from '../filters/filesize-filter';

import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Component({
  selector: 'app-file-download-modal',
  templateUrl: './file-download-modal.component.html'
})
export class FileDownloadModalComponent implements OnInit {
  @Output('done') done: EventEmitter<any> = new EventEmitter();

  preserveStructure = true;
  directory = 'Choose Directory...';
  isValid = false;
  msgs: Message[] = [];
  verify: DiskStatus;

  selectedFiles: Item[] = [];

  fileCount = 0;
  totalSize = 0;
  totalFiles = 0;

  loadingFiles = false;
  loadingFolders = 0;
  downloadFiles: Item[] = [];
  filesMap: Map<String, Item>;

  fileCountObservable: BehaviorSubject<number> = new BehaviorSubject(this.fileCount);
  totalSizeObservable: BehaviorSubject<number> = new BehaviorSubject(this.totalSize);

  myFiles: Item[] = [];

  constructor(
    private downloadValidator: DownloadValidatorService,
    private transferablesGridComponent: TransferablesGridComponent,
    private store: Store<AppState>,
    private zone: NgZone,
    public dialogRef: MatDialogRef<FileDownloadModalComponent>,
    public router: Router,
    public bucketService: BucketService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.filesMap = new Map();

    const storedDirectory = localStorage.getItem('directory');
    if (storedDirectory !== null) {
      this.directory = storedDirectory;
      this.isValid = true;
    }
  }

  ngOnInit() {
    this.processFilesToDownload();
  }

  processFilesToDownload() {

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
    const sortedItems = this.data.selectedFiles
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
            this.addToSelectedFiles(item);
          } else {
            this.getFiles(item);
          }
        });

    this.loadingFiles = false;
  }

  getFiles(folderItem: Item) {
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
                this.addToSelectedFiles(child);
              });
          this.loadingFolders--;
        }
      );
  }

  isLoading() {
    return this.loadingFiles || this.loadingFolders > 0;
  }

  addToSelectedFiles(item: Item) {
    const found: Item = this.selectedFiles.find(x => x.mediaLink === item.mediaLink);
    if (found === undefined) {
      this.selectedFiles.push(item);
      this.fileCount++;
      this.totalSize += Number(item.size);
      this.fileCountObservable.next(this.fileCount);
      this.totalSizeObservable.next(this.totalSize);
    }
  }

  startDownload() {
    this.downloadValidator.verifyDisk(this.directory, this.totalSize).then(
      diskVerification => {
        this.verify = diskVerification;
        if (!this.verify.hasErr) {
          this.setItems();
          this.transferablesGridComponent.startDownload(this.downloadFiles);
          this.dialogRef.close();
          this.router.navigate(['/status']);
        } else {
          this.msgs = [];
          this.createWarningMsg(this.verify.errMsg);
        }
      });
  }

  cancel(): void {
    this.dialogRef.close();
  }

  selectionChanged(event) {
    this.preserveStructure = event.checked;
  }

  directoryChanged(event) {
    if (event.target.files[0] !== undefined) {
      this.directory = event.target.files[0].path;
      this.isValid = true;
      localStorage.setItem('directory', this.directory);
    }
  }

  setItems() {
    this.selectedFiles.filter(file => file.type === 'File')
      .forEach(file => {
        if (!this.filesMap.has(file.id)) {
          this.filesMap.set(file.id, file);
          const dataFile: Item = new Item(file.id, file.name, file.updated, file.created,
            file.size, file.mediaLink, file.path, this.directory,
            Type.DOWNLOAD, ItemStatus.PENDING, '', '', '', this.preserveStructure, false, '', file.displayName, '');
          this.downloadFiles.push(dataFile);
          this.store.dispatch(new Transferables.AddItem(dataFile));
          this.done.emit(true);
          this.router.navigate(['/status']);
        }
      });
  }

  createWarningMsg(warnMessage) {
    this.msgs.push({
      severity: 'warn',
      summary: warnMessage,
    });
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
      item.namespace);
  }
}
