import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { Item } from '../models/item';

import { DownloadItem } from '../models/download-item';
import { UploadItem } from '../models/upload-item';
import { ExportToGCSItem } from '../models/export-to-gcs-item';
import { ExportToS3Item } from '../models/export-to-s3-item';

import { DownloadsReducer, DownloadState, downloadInitialState } from '../reducers/downloads.reducer';
import { UploadsReducer, UploadState, uploadInitialState } from '../reducers/uploads.reducer';
import { ExportToGCSReducer, ExportToGCSState, exportToGCSInitialState } from '../reducers/export-to-gcs.reducer';
import { ExportToS3Reducer, ExportToS3State, exportToS3InitialState } from '../reducers/export-to-s3.reducer';

import { AppState } from '@app/file-manager/reducers';
import { Dictionary } from '@ngrx/entity/src/models';

@Injectable()
export class FilesDatabase {

  downloads: Observable<DownloadState>;
  uploads: Observable<UploadState>;
  exportsToGCS: Observable<ExportToGCSState>;
  exportsToS3: Observable<ExportToS3State>;
  totalCount = 0;

  dataChange: BehaviorSubject<Item[]> = new BehaviorSubject<Item[]>([]);
  selectionChange: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  downloadsChange: BehaviorSubject<DownloadState> = new BehaviorSubject<DownloadState>(downloadInitialState);
  uploadsChange: BehaviorSubject<UploadState> = new BehaviorSubject<UploadState>(uploadInitialState);
  exportToGCSChange: BehaviorSubject<ExportToGCSState> = new BehaviorSubject<ExportToGCSState>(exportToGCSInitialState);
  exportToS3Change: BehaviorSubject<ExportToS3State> = new BehaviorSubject<ExportToS3State>(exportToS3InitialState);

  data(): Item[] {
    return this.dataChange.value;
  }

  selectedCount(): number {
    return this.selectionChange.value;
  }

  downloadedCount(): number {
    return this.downloadsChange.getValue().completed.count;
  }

  uploadedCount(): number {
    return this.uploadsChange.getValue().completed.count;
  }

  exportedToGCSCount(): number {
    return this.exportToGCSChange.getValue().completed.count;
  }

  exportedToS3Count(): number {
    return this.exportToS3Change.getValue().completed.count;
  }

  toDownloadCount(): number {
    return this.downloadsChange.getValue().cancelled.count +
      this.downloadsChange.getValue().completed.count +
      this.downloadsChange.getValue().failed.count +
      this.downloadsChange.getValue().inProgress.count +
      this.downloadsChange.getValue().paused.count +
      this.downloadsChange.getValue().pending.count;
  }

  toUploadCount(): number {
    return this.uploadsChange.getValue().cancelled.count +
      this.uploadsChange.getValue().completed.count +
      this.uploadsChange.getValue().failed.count +
      this.uploadsChange.getValue().inProgress.count +
      this.uploadsChange.getValue().paused.count +
      this.uploadsChange.getValue().pending.count;
  }

  toExportS3Count(): number {
    return this.exportToS3Change.getValue().cancelled.count +
      this.exportToS3Change.getValue().completed.count +
      this.exportToS3Change.getValue().failed.count +
      this.exportToS3Change.getValue().inProgress.count +
      this.exportToS3Change.getValue().paused.count +
      this.exportToS3Change.getValue().pending.count;
  }

  toExportGCSCount(): number {
    return this.exportToGCSChange.getValue().cancelled.count +
      this.exportToGCSChange.getValue().completed.count +
      this.exportToGCSChange.getValue().failed.count +
      this.exportToGCSChange.getValue().inProgress.count +
      this.exportToGCSChange.getValue().paused.count +
      this.exportToGCSChange.getValue().pending.count;
  }

  downloadProgress(): number {
    let progress = 100.0 * (this.downloadedCount() / this.toDownloadCount());
    return progress;
  }
  
  uploadProgress(): number {
    let progress = 100.0 * (this.uploadedCount() / this.toUploadCount());
    return progress;
  }

  exportToGCSProgress(): number {
    let progress = 100.0 * (this.exportedToGCSCount() / this.toExportGCSCount());
    return progress;
  }

  exportToS3Progress(): number {
    let progress = 100.0 * (this.exportedToS3Count() / this.toExportS3Count());
    return progress;
  }

  constructor(private store: Store<AppState>) {
    this.downloads = store.select('downloads');
    this.uploads = store.select('uploads');
    this.exportsToGCS = store.select('exportToGCS');
    this.exportsToS3 = store.select('exportToS3');

    this.downloads.subscribe(data => { this.downloadsChange.next(data); });
    this.uploads.subscribe(data => { this.uploadsChange.next(data); });
    this.exportsToGCS.subscribe(data => { this.exportToGCSChange.next(data); });
    this.exportsToS3.subscribe(data => { this.exportToS3Change.next(data); });

    // this.dataChange.next(data.entities);
    // this.selectionChange.next(data.selectedCount);
    // this.stateChange.next(data);
    // this.totalCount = data.count;
  }
}
