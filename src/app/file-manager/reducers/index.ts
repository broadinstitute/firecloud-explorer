import {
  createSelector,
  createFeatureSelector,
  ActionReducerMap
} from '@ngrx/store';

import * as fromDownloads from './downloads.reducer';
import * as fromUploads from './uploads.reducer';
import * as fromExportToGCS from './export-to-gcs.reducer';
import * as fromExportToS3 from './export-to-s3.reducer';

export const reducers: ActionReducerMap<any> = {
  downloads: fromDownloads.DownloadsReducer,
  uploads: fromUploads.UploadsReducer,
  exportToGCS: fromExportToGCS.ExportToGCSReducer,
  exportToS3: fromExportToS3.exportToS3InitialState
};

export interface AppState {
  downloads: fromDownloads.DownloadState;
  uploads: fromUploads.UploadState;
  exportToGCS: fromExportToGCS.ExportToGCSState;
  exportToS3: fromExportToS3.ExportToS3State;
}

export const selectDownloadsState = createFeatureSelector<fromDownloads.DownloadState>('downloads');
export const selectUploadsState = createFeatureSelector<fromUploads.UploadState>('uploads');
export const selectExportToGCSState = createFeatureSelector<fromExportToGCS.ExportToGCSState>('exportToGCS');
export const selectExportToS3State = createFeatureSelector<fromExportToS3.ExportToS3State>('exportToS3');

