import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { Item } from '@app/file-manager/models/item';

import { DownloadItem } from '@app/file-manager/models/download-item';
import { UploadItem } from '@app/file-manager/models/upload-item';
import { ExportToGCSItem } from '@app/file-manager/models/export-to-gcs-item';
import { ExportToS3Item } from '@app/file-manager/models/export-to-s3-item';

import { DownloadsReducer, DownloadState, downloadInitialState } from '@app/file-manager/reducers/downloads.reducer';
import { UploadsReducer, UploadState, uploadInitialState } from '@app/file-manager/reducers/uploads.reducer';
import { ExportToGCSReducer, ExportToGCSState, exportToGCSInitialState } from '@app/file-manager/reducers/export-to-gcs.reducer';
import { ExportToS3Reducer, ExportToS3State, exportToS3InitialState } from '@app/file-manager/reducers/export-to-s3.reducer';

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
    return this.downloadsChange.getValue().totalCount;
  }

  toUploadCount(): number {
    return this.uploadsChange.getValue().totalCount;
  }

  toExportS3Count(): number {
    return this.exportToS3Change.getValue().totalCount;
  }

  toExportGCSCount(): number {
    return this.exportToGCSChange.getValue().totalCount;
  }

  downloadProgress(): number {
    return this.downloadsChange.getValue().totalProgress;
  }

  uploadProgress(): number {
    return this.uploadsChange.getValue().totalProgress;
  }

  exportToGCSProgress(): number {
    return this.exportToGCSChange.getValue().totalProgress;
  }

  exportToS3Progress(): number {
    return this.exportToS3Change.getValue().totalProgress;
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
  }
}
