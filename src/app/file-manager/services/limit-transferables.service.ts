import { Injectable, OnInit } from '@angular/core';

import * as Transferables from '../actions/transferables.actions';
import * as downloadActions from '../actions/download-item.actions';
import * as uploadActions from '../actions/upload-item.actions';
import * as exportToGCSActions from '../actions/export-to-gcs-item.actions';
import * as exportToS3Actions from '../actions/export-to-s3-item.actions';

import { Item } from '../models/item';
import { DownloadItem } from '../models/download-item';
import { UploadItem } from '../models/upload-item';
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
    private s3ExportService: S3ExportService,
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
    if (pendingCount > 0 && inProgressCount < environment.LIMIT_TRANSFERABLES) {
      const item = Object.values(pendingItems)[0];
      items.push(item);
      this.gcsService.downloadFiles(items);
    }
  }

  public pendingUploadItem(): void {
    const pendingItems = new FilesDatabase(this.store).uploadsChange.getValue().pending.items;
    const pendingCount = new FilesDatabase(this.store).uploadsChange.getValue().pending.count;
    const inProgressCount = new FilesDatabase(this.store).uploadsChange.getValue().inProgress.count;
    const items: UploadItem[] = [];
    if (pendingCount > 0 && inProgressCount < environment.LIMIT_UPLOADS) {
      let destinationBucket = localStorage.getItem('destinationBucket');
      const item = Object.values(pendingItems)[0];
      items.push(item);
      this.gcsService.uploadFiles(items, destinationBucket);
    }
  }

  public pendingGCSItem(): void {
    const pendingItems = new FilesDatabase(this.store).exportToGCSChange.getValue().pending.items;
    const pendingCount = new FilesDatabase(this.store).exportToGCSChange.getValue().pending.count;
    const inProgressCount = new FilesDatabase(this.store).exportToGCSChange.getValue().inProgress.count;
    let items: ExportToGCSItem[] = [];

    if (pendingCount > 0 && inProgressCount === 0) { // < environment.LIMIT_GCS_EXPORTABLES) {
      let destinationBucket = localStorage.getItem('destinationBucket');
      let batchSize = environment.LIMIT_GCS_EXPORTABLES; // - inProgressCount;
      items = Object.values(pendingItems).slice(0, batchSize);
      this.gcsService.exportToGCSFiles(items, destinationBucket);
    }
  }

  public pendingS3Item(): void {
    const pendingItems = new FilesDatabase(this.store).exportToS3Change.getValue().pending.items;
    const pendingCount = new FilesDatabase(this.store).exportToS3Change.getValue().pending.count;
    const inProgressCount = new FilesDatabase(this.store).exportToS3Change.getValue().inProgress.count;
    const items: ExportToS3Item[] = [];
    if (pendingCount > 0 && inProgressCount < environment.LIMIT_S3_EXPORTABLES) {
      const item = Object.values(pendingItems)[0];
      items.push(item);
      this.s3ExportService.startFileExportToS3(items);
    }
  }

  // public pendingItem(type: Type, status: ItemStatus): void {
  //   let items = new FilesDatabase(this.store).data();
  //   if (!this.maxDownloadsAtSameTime(items, status)) {
  //     items = items.filter(item => item.type === type && item.status === ItemStatus.PENDING);
  //     this.proceedNextItem(items, type, status);
  //   }
  // }

  // private maxDownloadsAtSameTime(items: Item[], status: ItemStatus): boolean {
  //   let max = 0;
  //   items.forEach(item => {
  //     if (item.status === status) {
  //       max++;
  //     }
  //   });

  //   if (max === environment.LIMIT_TRANSFERABLES) {
  //     return true;
  //   }
  //   return false;
  // }

  public controlDownloadItemLimits(files: DownloadItem[]): void {
    if (files === undefined || files === null || files.length <= 0) {
      return;
    }

    let maxFiles = [];
    this.store.dispatch(new downloadActions.Reset());
    this.store.dispatch(new downloadActions.AddItems({ items: files, clear: false }));

    if (files.length > environment.LIMIT_TRANSFERABLES) {
      maxFiles = files.splice(0, environment.LIMIT_TRANSFERABLES);
    } else {
      maxFiles = files;
    }
    this.gcsService.downloadFiles(maxFiles);
  }

  public controlUploadItemLimits(files: UploadItem[]): void {
    if (files === undefined || files === null || files.length <= 0) {
      return;
    }

    let uploadBucket = localStorage.getItem('uploadBucket');
    let maxFiles = [];
    this.store.dispatch(new uploadActions.Reset());
    this.store.dispatch(new uploadActions.AddItems({ items: files, clear: false }));

    if (files.length > environment.LIMIT_UPLOADS) {
      maxFiles = files.splice(0, environment.LIMIT_UPLOADS);
    } else {
      maxFiles = files;
    }
    this.gcsService.uploadFiles(maxFiles, uploadBucket);
  }

  public controlExportToGCSItemLimits(files: ExportToGCSItem[]): void {
    if (files === undefined || files === null || files.length <= 0) {
      return;
    }
    let destinationBucket = localStorage.getItem('destinationBucket');
    let maxFiles = [];
    this.store.dispatch(new exportToGCSActions.Reset());
    this.store.dispatch(new exportToGCSActions.AddItems({ items: files }));

    if (files.length > environment.LIMIT_GCS_EXPORTABLES) {
      maxFiles = files.splice(0, environment.LIMIT_GCS_EXPORTABLES);
    } else {
      maxFiles = files;
    }
    this.gcsService.exportToGCSFiles(maxFiles, destinationBucket);
  }

  public controlExportToS3ItemLimits(files: ExportToS3Item[]): void {
    if (files === undefined || files === null || files.length <= 0) {
      return;
    }

    let maxFiles = [];
    this.store.dispatch(new exportToS3Actions.Reset());
    this.store.dispatch(new exportToS3Actions.AddItems({ items: files }));

    if (files.length > environment.LIMIT_S3_EXPORTABLES) {
      maxFiles = files.splice(0, environment.LIMIT_S3_EXPORTABLES);
    } else {
      maxFiles = files;
    }
    this.s3ExportService.startFileExportToS3(maxFiles);
  }

  // public controlLimitItems(files: Item[], type: Type, status: ItemStatus): void {
  //   let maxFiles = [];

  //   if (files.length > environment.LIMIT_TRANSFERABLES) {
  //     maxFiles = files.splice(0, environment.LIMIT_TRANSFERABLES);
  //   } else {
  //     maxFiles = files;
  //   }

  //   maxFiles.forEach(item => {
  //     if (item.type !== Type.EXPORT_S3) {
  //       item.status = status;
  //       this.store.dispatch(new Transferables.UpdateItem(item));
  //     }
  //   });

  //   if (type === Type.DOWNLOAD) {
  //     this.gcsService.downloadFiles(maxFiles);
  //   } else if (type === Type.UPLOAD) {
  //     this.gcsService.uploadFiles(maxFiles, localStorage.getItem('uploadBucket'));
  //   } else if (type === Type.EXPORT_S3) {
  //     // Because the export S3 process works with one item at a time it's necessary to take the first one
  //     maxFiles[0].status = ItemStatus.EXPORTING_S3;
  //     this.store.dispatch(new Transferables.UpdateItem(maxFiles[0]));
  //     this.s3ExportService.startFileExportToS3(maxFiles[0]);
  //   }
  // }

  // public exportItems(files: Item[]): void {
  //   const maxFiles = files.splice(0, environment.LIMIT_EXPORTABLES);
  //   this.gcsService.exportToGCSFiles(maxFiles, localStorage.getItem('destinationBucket'));
  // }

  // private proceedNextItem(files: Item[], type: Type, status: ItemStatus): void {
  //   let item: Item;

  //   if (files.length > 1 || files.length === 1) {
  //     item = files.splice(0, 1)[0];

  //     item.status = status;
  //     this.store.dispatch(new Transferables.UpdateItem(item));

  //     if (type === Type.DOWNLOAD) {
  //       this.gcsService.downloadFiles([item]);
  //     } else if (type === Type.UPLOAD) {
  //       // this.gcsService.uploadFiles( [item], localStorage.getItem('uploadBucket'));
  //     } else if (type === Type.EXPORT_S3) {
  //       this.s3ExportService.startFileExportToS3([item]);
  //     }
  //   }
  // }
}
