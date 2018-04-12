import { Injectable } from '@angular/core';
import { Item } from '@app/file-manager/models/item';
import { SecurityService } from '@app/file-manager/services/security.service';
import { ElectronIpcApiService } from '@app/file-manager/services/electron-ipc.api.service';
import { AppState } from '@app/file-manager/reducers';
import { Store } from '@ngrx/store';
import { ExportToS3Item } from '@app/file-manager/models/export-to-s3-item';
import * as exportToS3Actions from '@app/file-manager/actions/export-to-s3-item.actions';

@Injectable()
export class S3ExportService {

  constructor(
    private store: Store<AppState>,
    private electronService: ElectronIpcApiService,
  ) { }

  public startFileExportToS3(items: ExportToS3Item[]) {
     this.store.dispatch(new exportToS3Actions.ProcessItems({ items: items }))
    items.forEach(item => {
      const dataTransfer = {
        'preserveStructure': JSON.parse(localStorage.getItem('preserveStructure')),
        'gcsToken': SecurityService.getAccessToken(),
        'bucketName': localStorage.getItem('S3BucketName'),
        'item': item
      };

      this.electronService.exportS3(dataTransfer);
    });
  }

  public testCredentials() {
    const dataTransfer = {
      'accessKey': SecurityService.getS3AccessKey(),
      'secretKey': SecurityService.getS3SecretKey(),
      'bucketName': localStorage.getItem('S3BucketName'),
    };
    this.electronService.setCredentials(dataTransfer);
  }

}
