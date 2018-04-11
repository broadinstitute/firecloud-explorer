import { Injectable, OnInit } from '@angular/core';

import * as Transferables from '../actions/transferables.actions';
import * as downloadActions from '../actions/download-item.actions';
import * as uploadActions from '../actions/upload-item.actions';
import * as exportToGCSActions from '../actions/export-to-gcs-item.actions';
import * as exportToS3Actions from '../actions/export-to-s3-item.actions';

import { Item } from '../models/item';
import { DownloadItem } from '../models/download-item';
import { ExportToGCSItem } from '../models/export-to-gcs-item';
import { ExportToS3Item } from '../models/export-to-s3-item';

import { Store } from '@ngrx/store';
import { AppState } from '@app/file-manager/reducers';
import { FilesDatabase } from '../dbstate/files-database';
import { ItemStatus } from '@app/file-manager/models/item-status';
import { EntityStatus } from '@app/file-manager/models/entity-status';
import { GcsService } from '@app/file-manager/services/gcs.service';
import { Type } from '@app/file-manager/models/type';
import { environment } from '@env/environment';
import { S3ExportService } from '@app/file-manager/services/s3-export.service';


@Injectable()
export class LimitTransferablesService implements OnInit {

  downloadsPendingCount = 0;
  downloadsInProgressCount = 0;
  downloadPendingItems: { [id: string]: DownloadItem };

  constructor(
    public gcsService: GcsService,
    private store: Store<AppState>,
    private s3TransferService: S3ExportService,
  ) {
    this.store.select('downloads').subscribe(
      data => {
        this.downloadsPendingCount = data.pending.count;
        this.downloadsInProgressCount = data.inProgress.count;
        this.downloadPendingItems = data.pending.items;
      }
    );
  }

  ngOnInit() {

  }

  public pendingDownloadItem(): void {
    const pendingItems = new FilesDatabase(this.store).downloadsChange.getValue().pending.items;
    const pendingCount = new FilesDatabase(this.store).downloadsChange.getValue().pending.count;
    const inProgressCount = new FilesDatabase(this.store).downloadsChange.getValue().inProgress.count;
    const items: DownloadItem[] = [];
    console.log('------ pendingItems ------- ', pendingItems);
    if (pendingCount > 0 && inProgressCount < environment.LIMIT_TRANSFERABLES) {
      const item = Object.values(pendingItems)[0];
      console.log('---- new item to process --- ', item);
      items.push(item);
      this.gcsService.downloadFiles(items);
    }
  }

  public pendingItem(type: Type, status: ItemStatus): void {
    let items = new FilesDatabase(this.store).data;
    if (!this.maxDownloadsAtSameTime(items, status)) {
      items = items.filter(item => item.type === type && item.status === ItemStatus.PENDING);
      this.proceedNextItem(items, type, status);
    }
  }

  private maxDownloadsAtSameTime(items: Item[], status: ItemStatus): boolean {
    let max = 0;
    items.forEach(item => {
      if (item.status === status) {
        max++;
      }
    });

    if (max === environment.LIMIT_TRANSFERABLES) {
      return true;
    }
    return false;
  }

  public controlDownloadItemLimits(files: DownloadItem[]): void {
    if (files === undefined || files === null || files.length <= 0) {
      console.log('---------------------controlDownloadItemLimits - files empty --------------------------', files);
      return;
    }

    let maxFiles = [];
    console.log('---------- files --------------', files);
    this.store.dispatch(new downloadActions.AddItems({ items: files }));

    if (files.length > environment.LIMIT_TRANSFERABLES) {
      maxFiles = files.splice(0, environment.LIMIT_TRANSFERABLES);
    } else {
      maxFiles = files;
    }
    this.gcsService.downloadFiles(maxFiles);
  }

  public controlExportToGCSItemLimits(files: ExportToGCSItem[]): void {
    if (files === undefined || files === null || files.length <= 0) {
      console.log('---------------------controlExportToGCSItemLimits - files empty --------------------------', files);
      return;
    }

    let maxFiles = [];
    console.log('---------- files --------------', files);
    this.store.dispatch(new exportToGCSActions.AddItems({ items: files }));

    if (files.length > environment.LIMIT_EXPORTABLES) {
      maxFiles = files.splice(0, environment.LIMIT_EXPORTABLES);
    } else {
      maxFiles = files;
    }
    this.gcsService.exportToGCSFiles(maxFiles, '');
  }

  public controlLimitItems(files: Item[], type: Type, status: ItemStatus): void {
    let maxFiles = [];

    if (files.length > environment.LIMIT_TRANSFERABLES) {
      maxFiles = files.splice(0, environment.LIMIT_TRANSFERABLES);
    } else {
      maxFiles = files;
    }

    maxFiles.forEach(item => {
      if (item.type !== Type.EXPORT_S3) {
        item.status = status;
        this.store.dispatch(new Transferables.UpdateItem(item));
      }
    });

    if (type === Type.DOWNLOAD) {
      this.gcsService.downloadFiles(maxFiles);
    } else if (type === Type.UPLOAD) {
      this.gcsService.uploadFiles(maxFiles, localStorage.getItem('uploadBucket'));
    } else if (type === Type.EXPORT_S3) {
      // Because the export S3 process works with one item at a time it's necessary to take the first one
      maxFiles[0].status = ItemStatus.EXPORTING_S3;
      this.store.dispatch(new Transferables.UpdateItem(maxFiles[0]));
      this.s3TransferService.startFileExportToS3(maxFiles[0]);
    }
  }


  public exportItems(files: Item[]): void {
    const maxFiles = files.splice(0, environment.LIMIT_EXPORTABLES);
    this.gcsService.exportToGCSFiles(maxFiles, localStorage.getItem('destinationBucket'));
  }

  private proceedNextItem(files: Item[], type: Type, status: ItemStatus): void {
    let item: Item;

    if (files.length > 1 || files.length === 1) {
      item = files.splice(0, 1)[0];

      item.status = status;
      this.store.dispatch(new Transferables.UpdateItem(item));

      if (type === Type.DOWNLOAD) {
        this.gcsService.downloadFiles([item]);
      } else if (type === Type.UPLOAD) {
        // this.gcsService.uploadFiles( [item], localStorage.getItem('uploadBucket'));
      } else if (type === Type.EXPORT_S3) {
        this.s3TransferService.startFileExportToS3(item);
      }
    }
  }
}
