import { Injectable, OnInit } from '@angular/core';

import * as Transferables from '@app/file-manager/actions/transferables.actions';
import * as downloadActions from '@app/file-manager/actions/download-item.actions';
import * as uploadActions from '@app/file-manager/actions/upload-item.actions';
import * as exportToGCSActions from '@app/file-manager/actions/export-to-gcs-item.actions';
import * as exportToS3Actions from '@app/file-manager/actions/export-to-s3-item.actions';

import { Item } from '@app/file-manager/models/item';
import { DownloadItem } from '@app/file-manager/models/download-item';
import { UploadItem } from '@app/file-manager/models/upload-item';
import { ExportToGCSItem } from '@app/file-manager/models/export-to-gcs-item';
import { ExportToS3Item } from '@app/file-manager/models/export-to-s3-item';

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

  public startDownloading(files: DownloadItem[]): void {
    if (files !== undefined && files !== null && files.length > 0) {
      let maxFiles: DownloadItem[] = [];
      this.store.dispatch(new downloadActions.Reset());
      this.store.dispatch(new downloadActions.AddItems({ items: files }));
      maxFiles = files.length > environment.LIMIT_DOWNLOADS ? files.slice(0, environment.LIMIT_DOWNLOADS) : files;
      this.gcsService.downloadFiles(maxFiles);
    }
  }

  public continueDownloading(): void {
    const pendingItems = new FilesDatabase(this.store).downloadsChange.getValue().pending.items;
    const pendingCount = new FilesDatabase(this.store).downloadsChange.getValue().pending.count;
    const inProgressCount = new FilesDatabase(this.store).downloadsChange.getValue().inProgress.count;
    const items: DownloadItem[] = [];
    if (pendingCount > 0 && inProgressCount < environment.LIMIT_DOWNLOADS) {
      const item = Object.values(pendingItems)[0];
      items.push(item);
      this.gcsService.downloadFiles(items);
    }
  }

  public startUploading(files: UploadItem[]): void {
    if (files !== undefined && files !== null && files.length > 0) {
      const uploadBucket = localStorage.getItem('uploadBucket');
      let maxFiles: UploadItem[] = [];
      this.store.dispatch(new uploadActions.Reset());
      this.store.dispatch(new uploadActions.AddItems({ items: files }));
      maxFiles = files.length > environment.LIMIT_UPLOADS ? files.slice(0, environment.LIMIT_UPLOADS) : files;
      this.gcsService.uploadFiles(maxFiles, uploadBucket);
    }
  }

  public continueUploading(): void {
    const pendingItems = new FilesDatabase(this.store).uploadsChange.getValue().pending.items;
    const pendingCount = new FilesDatabase(this.store).uploadsChange.getValue().pending.count;
    const inProgressCount = new FilesDatabase(this.store).uploadsChange.getValue().inProgress.count;
    const items: UploadItem[] = [];
    if (pendingCount > 0 && inProgressCount < environment.LIMIT_UPLOADS) {
      const uploadBucket = localStorage.getItem('uploadBucket');
      const item = Object.values(pendingItems)[0];
      items.push(item);
      this.gcsService.uploadFiles(items, uploadBucket);
    }
  }

  public startExportingToGCS(files: ExportToGCSItem[]): void {
    if (files !== undefined && files !== null && files.length > 0) {
      const destinationBucket = localStorage.getItem('destinationBucket');
      let maxFiles = [];
      this.store.dispatch(new exportToGCSActions.Reset());
      this.store.dispatch(new exportToGCSActions.AddItems({ items: files }));
      maxFiles = files.length > environment.LIMIT_GCS_EXPORTABLES ? files.slice(0, environment.LIMIT_GCS_EXPORTABLES) : files;
      this.gcsService.exportToGCSFiles(maxFiles, destinationBucket);
    }
  }

  public continueExportingToGCS(): void {
    const pendingItems = new FilesDatabase(this.store).exportToGCSChange.getValue().pending.items;
    const pendingCount = new FilesDatabase(this.store).exportToGCSChange.getValue().pending.count;
    const inProgressCount = new FilesDatabase(this.store).exportToGCSChange.getValue().inProgress.count;
    let items: ExportToGCSItem[] = [];

    if (pendingCount > 0 && inProgressCount === 0) {
      const destinationBucket = localStorage.getItem('destinationBucket');
      const batchSize = environment.LIMIT_GCS_EXPORTABLES;
      items = Object.values(pendingItems).slice(0, batchSize);
      this.gcsService.exportToGCSFiles(items, destinationBucket);
    }
  }

  public startExportingToS3(files: ExportToS3Item[]): void {
    if (files !== undefined && files !== null && files.length > 0) {
      let maxFiles = [];
      this.store.dispatch(new exportToS3Actions.Reset());
      this.store.dispatch(new exportToS3Actions.AddItems({ items: files }));
      maxFiles = files.length > environment.LIMIT_S3_EXPORTABLES ? files.slice(0, environment.LIMIT_S3_EXPORTABLES) : files;
      this.s3ExportService.exportToS3(maxFiles);
    }
  }

  public continueExportingToS3(): void {
    const pendingItems = new FilesDatabase(this.store).exportToS3Change.getValue().pending.items;
    const pendingCount = new FilesDatabase(this.store).exportToS3Change.getValue().pending.count;
    const inProgressCount = new FilesDatabase(this.store).exportToS3Change.getValue().inProgress.count;
    const items: ExportToS3Item[] = [];
    if (pendingCount > 0 && inProgressCount < environment.LIMIT_S3_EXPORTABLES) {
      const item = Object.values(pendingItems)[0];
      items.push(item);
      this.s3ExportService.exportToS3(items);
    }
  }

}
