import { Injectable, OnInit, OnDestroy } from '@angular/core';

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

import { ItemStatus } from '@app/file-manager/models/item-status';
import { EntityStatus } from '@app/file-manager/models/entity-status';
import { GcsService } from '@app/file-manager/services/gcs.service';
import { Type } from '@app/file-manager/models/type';
import { environment } from '@env/environment';
import { S3ExportService } from '@app/file-manager/services/s3-export.service';

import { Observable } from 'rxjs/Observable';
import { ISubscription } from 'rxjs/Subscription';

import { DownloadState } from '@app/file-manager/reducers/downloads.reducer';
import { UploadState } from '@app/file-manager/reducers/uploads.reducer';
import { ExportToGCSState } from '@app/file-manager/reducers/export-to-gcs.reducer';
import { ExportToS3State } from '@app/file-manager/reducers/export-to-s3.reducer';

@Injectable()
export class LimitTransferablesService implements OnInit, OnDestroy {

  downloadsPendingCount = 0;
  downloadsInProgressCount = 0;
  downloadPendingItems: { [id: string]: DownloadItem };

  downSubscription: ISubscription;
  upSubscription: ISubscription;
  gcsSubscription: ISubscription;
  s3Subscription: ISubscription;

  downPendingCount = 0;
  downInProgressCount = 0;
  downPendingItems: { [id: string]: DownloadItem };

  upPendingCount = 0;
  upInProgressCount = 0;
  upPendingItems: { [id: string]: UploadItem };

  gcsPendingCount = 0;
  gcsInProgressCount = 0;
  gcsPendingItems: { [id: string]: ExportToGCSItem };

  s3PendingCount = 0;
  s3InProgressCount = 0;
  s3PendingItems: { [id: string]: ExportToS3Item };

  constructor(
    public gcsService: GcsService,
    private store: Store<AppState>,
    private s3ExportService: S3ExportService,
  ) {
    this.downSubscription = this.store.select('downloads').subscribe(
      data => {
        this.downPendingCount = data.pending.count;
        this.downInProgressCount = data.inProgress.count;
        this.downPendingItems = data.pending.items;
      }
    );

    this.upSubscription = this.store.select('uploads').subscribe(
      data => {
        this.upPendingCount = data.pending.count;
        this.upInProgressCount = data.inProgress.count;
        this.upPendingItems = data.pending.items;
      }
    );

    this.gcsSubscription = this.store.select('exportToGCS').subscribe(
      data => {
        this.gcsPendingCount = data.pending.count;
        this.gcsInProgressCount = data.inProgress.count;
        this.gcsPendingItems = data.pending.items;
      }
    );

    this.s3Subscription = this.store.select('exportToS3').subscribe(
      data => {
        this.s3PendingCount = data.pending.count;
        this.s3InProgressCount = data.inProgress.count;
        this.s3PendingItems = data.pending.items;
      }
    );
  }

  ngOnInit() {

  }

  public start(files: any[]): void {
    if (files !== undefined && files !== null && files.length > 0) {
      let maxFiles: DownloadItem[] = [];
      this.store.dispatch(new downloadActions.Reset());
      this.store.dispatch(new downloadActions.AddItems({ items: files }));
      maxFiles = files.length > environment.LIMIT_DOWNLOADS ? files.slice(0, environment.LIMIT_DOWNLOADS) : files;
      this.gcsService.downloadFiles(maxFiles);
    }
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
    const items: DownloadItem[] = [];
    if (this.downPendingCount > 0 && this.downInProgressCount < environment.LIMIT_DOWNLOADS) {
      const item: DownloadItem = Object.values(this.downPendingItems)[0];
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
    const items: UploadItem[] = [];
    if (this.upPendingCount > 0 && this.upInProgressCount < environment.LIMIT_UPLOADS) {
      const uploadBucket = localStorage.getItem('uploadBucket');
      const item = Object.values(this.upPendingItems)[0];
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
    let items: ExportToGCSItem[] = [];
    if (this.gcsPendingCount > 0 && this.gcsInProgressCount === 0) {
      const destinationBucket = localStorage.getItem('destinationBucket');
      const batchSize = environment.LIMIT_GCS_EXPORTABLES;
      items = Object.values(this.gcsPendingItems).slice(0, batchSize);
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
    const items: ExportToS3Item[] = [];
    if (this.s3PendingCount > 0 && this.s3InProgressCount < environment.LIMIT_S3_EXPORTABLES) {
      const item = Object.values(this.s3PendingItems)[0];
      items.push(item);
      this.s3ExportService.exportToS3(items);
    }
  }

  ngOnDestroy() {
    this.downSubscription.unsubscribe();
    this.upSubscription.unsubscribe();
    this.gcsSubscription.unsubscribe();
    this.s3Subscription.unsubscribe();
  }

}
