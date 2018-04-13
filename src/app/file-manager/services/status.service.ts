import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { Observable } from 'rxjs/Observable';
import { Item } from '../models/item';
import { DownloadItem } from '../models/download-item';
import * as Transferables from '../actions/transferables.actions';
import * as downloadActions from '../actions/download-item.actions';
import * as uploadActions from '../actions/upload-item.actions';
import * as exportToGCSActions from '../actions/export-to-gcs-item.actions';
import * as exportToS3Actions from '../actions/export-to-s3-item.actions';

import { Store } from '@ngrx/store';
import { AppState } from '@app/file-manager/reducers';
import { FilesDatabase } from '../dbstate/files-database';
import { Type } from '@app/file-manager/models/type';
import { LimitTransferablesService } from '@app/file-manager/services/limit-transferables.service';
import { ItemStatus } from '@app/file-manager/models/item-status';
import { S3ExportService } from '@app/file-manager/services/s3-export.service';

const constants = require('../../../../electron_app/helpers/environment').constants;

/**
 * Download progress information service
 */
@Injectable()
export class StatusService {

  constructor(private store: Store<AppState>,
    private limitTransferables: LimitTransferablesService,
    private s3Service: S3ExportService,
    private electronService: ElectronService) {

    /**
     * Download progress listeners
     */
    this.electronService.ipcRenderer.on(constants.IPC_DOWNLOAD_STATUS, (event, item) => {
      this.store.dispatch(new downloadActions.UpdateProgress(item));
    });

    this.electronService.ipcRenderer.on(constants.IPC_DOWNLOAD_COMPLETE, (event, item) => {
      this.store.dispatch(new downloadActions.CompleteItem(item));
      this.limitTransferables.pendingDownloadItem();
    });

    this.electronService.ipcRenderer.on(constants.IPC_DOWNLOAD_FAILED, (event, item) => {
      this.store.dispatch(new downloadActions.FailItem(item));
      // TODO: must start next batch, if any
      this.limitTransferables.pendingDownloadItem();
    });

    /**
     * Upload progress listeners
     */
    this.electronService.ipcRenderer.on(constants.IPC_UPLOAD_STATUS, (event, item) => {
      this.store.dispatch(new uploadActions.UpdateProgress(item));
    });

    this.electronService.ipcRenderer.on(constants.IPC_UPLOAD_COMPLETE, (event, item) => {
      this.store.dispatch(new uploadActions.CompleteItem(item));
      // TODO: must start next batch, if any
      this.limitTransferables.pendingUploadItem();
    });

    this.electronService.ipcRenderer.on(constants.IPC_UPLOAD_FAILED, (event, item) => {
      this.store.dispatch(new uploadActions.FailItem({items: item }));
      // continue wih next, if any
      this.limitTransferables.pendingUploadItem();
    });

    /**
     * Export To GCS progress listeners
     */
    this.electronService.ipcRenderer.on(constants.IPC_EXPORT_TO_GCP_STATUS, (event, item) => {
      this.store.dispatch(new exportToGCSActions.UpdateProgress(item));
    });

    this.electronService.ipcRenderer.on(constants.IPC_EXPORT_TO_GCP_COMPLETE, (event, items) => {
      this.store.dispatch(new exportToGCSActions.CompleteItems({items : items}));
      this.limitTransferables.pendingGCSItem();
    });

    this.electronService.ipcRenderer.on(constants.IPC_EXPORT_TO_GCP_FAILED, (event, items) => {
      this.store.dispatch(new exportToGCSActions.FailItems({items: items }));
      // continue wih next, if any
      this.limitTransferables.pendingGCSItem();
    });

    /**
     * Export To S3 progress listeners
     */
    this.electronService.ipcRenderer.on(constants.IPC_EXPORT_TO_S3_STATUS, (event, item) => {
      this.store.dispatch(new exportToS3Actions.UpdateProgress(item));
    });

    this.electronService.ipcRenderer.on(constants.IPC_EXPORT_TO_S3_COMPLETE, (event, item) => {
      this.store.dispatch(new exportToS3Actions.CompleteItem(item));
      this.limitTransferables.pendingS3Item();
    });

    this.electronService.ipcRenderer.on(constants.IPC_EXPORT_TO_S3_FAILED, (event, items) => {
      this.store.dispatch(new exportToS3Actions.FailItems({items: items }));
      // continue wih next, if any
      this.limitTransferables.pendingS3Item();
    });

  }
}
