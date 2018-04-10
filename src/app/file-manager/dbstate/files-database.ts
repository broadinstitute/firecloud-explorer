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
import { UploadsReducer, UploadsState, uploadInitialState } from '../reducers/uploads.reducer';
import { ExportToGCSReducer, ExportToGCSState, exportToGCSinitialState } from '../reducers/export-to-gcs.reducer';
import { ExportToS3Reducer, ExportToS3State, exportToS3InitialState } from '../reducers/export-to-s3.reducer';

import { AppState } from '@app/file-manager/reducers';
import { Dictionary } from '@ngrx/entity/src/models';

// const initialState: TransferableState = {
//   count: 0,
//   selectedCount: 0,
//   downloadingCount: 0,
//   uploadingCount: 0,
//   exportingGCPCount: 0,
//   toDownloadCount: 0,
//   toUploadCount: 0,
//   toExportS3Count: 0,
//   exportingS3Count: 0,
//   toExportGCPCount: 0,
//   counter: [
//     [0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0]
//   ],
//   items: [],
//   itemsMap: []
// };

@Injectable()
export class FilesDatabase {

  downloads: Observable<DownloadState>;
  uploads: Observable<UploadsState>;
  exportsToGCS: Observable<ExportToGCSState>;
  exportsToS3: Observable<ExportToS3State>;
  totalCount = 0;

  dataChange: BehaviorSubject<Item[]> = new BehaviorSubject<Item[]>([]);
  selectionChange: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  downloadsChange: BehaviorSubject<DownloadState> = new BehaviorSubject<DownloadState>(downloadInitialState);
  uploadsChange: BehaviorSubject<UploadsState> = new BehaviorSubject<UploadsState>(uploadInitialState);
  exportToGCSChange: BehaviorSubject<ExportToGCSState> = new BehaviorSubject<ExportToGCSState>(exportToGCSinitialState);
  exportToS3Change: BehaviorSubject<ExportToS3State> = new BehaviorSubject<ExportToS3State>(exportToS3InitialState);

  get data(): Item[] {
    return this.dataChange.value;
  }

  get selectedCount(): number {
    return this.selectionChange.value;
  }

  get downloadingCount(): number {
    return 0; // return this.downloadsChange.value.completed.items.keyset.length;
  }

  get uploadingCount(): number {
    return 0; // return this.uploadsChange.value.entities;
  }

  get exportingCount(): number {
    return 0; //    return this.exportToGCSChange.value.exportingGCPCount;
  }

  get toDownloadCount(): number {
    return 10; // return this.downloadsChange.value.pending.items.keyset.length;
  }

  get toUploadCount(): number {
    return 0; //   return this.stateChange.value.toUploadCount;
  }

  get toExportS3Count(): number {
    return 0; //   return this.stateChange.value.toExportS3Count;
  }

  get exportingS3Count(): number {
    return 0; //   return this.stateChange.value.exportingS3Count;
  }

  get toExportGCPCount(): number {
    return 0; //    return this.stateChange.value.toExportGCPCount;
  }

  get exportingGCPCount(): number {
    return 0; //   return this.stateChange.value.exportingGCPCount;
  }

  constructor(private store: Store<AppState>) {
    this.downloads = store.select('downloads');
    this.uploads = store.select('uploads');
    this.exportsToGCS = store.select('exportToGCS');
    this.exportsToS3 = store.select('exportToS3');

    this.downloads
      .subscribe(
        data => {
          console.log(data);
          this.downloadsChange.next(data);
          // this.dataChange.next(data.entities);
          // this.selectionChange.next(data.selectedCount);
          // this.stateChange.next(data);
          // this.totalCount = data.count;
        });
  }
}
