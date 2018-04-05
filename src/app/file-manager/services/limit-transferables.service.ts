import { Injectable } from '@angular/core';
import * as Transferables from '../actions/transferables.actions';
import { Item } from '../models/item';
import { Store } from '@ngrx/store';
import { AppState } from '../dbstate/app-state';
import { FilesDatabase } from '../dbstate/files-database';
import { ItemStatus } from '@app/file-manager/models/item-status';
import { GcsService } from '@app/file-manager/services/gcs.service';
import { Type } from '@app/file-manager/models/type';
import { environment } from '@env/environment';
import { S3ExportService } from '@app/file-manager/services/s3-export.service';

@Injectable()
export class LimitTransferablesService {

  constructor(
    public gcsService: GcsService,
    private store: Store<AppState>,
    private s3TransferService: S3ExportService,
  ) { }

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
      this.gcsService.uploadFiles(localStorage.getItem('uploadBucket'), maxFiles);
    } else if (type === Type.EXPORT_S3) {
      // Because the export S3 process works with one item at a time it's necessary to take the first one
      maxFiles[0].status = ItemStatus.EXPORTING_S3;
      this.store.dispatch(new Transferables.UpdateItem(maxFiles[0]));
      this.s3TransferService.startFileExportToS3(maxFiles[0]);
    }
  }


  public exportItems(files: Item[]): void {
    const maxFiles = files.splice(0, environment.LIMIT_EXPORTABLES);
    this.gcsService.exportToGCPFiles(localStorage.getItem('destinationBucket'), maxFiles);
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
        this.gcsService.uploadFiles(localStorage.getItem('uploadBucket'), [item]);
      } else if (type === Type.EXPORT_S3) {
        this.s3TransferService.startFileExportToS3(item);
      }
    }
  }
}
