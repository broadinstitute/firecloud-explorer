import { Injectable } from '@angular/core';
import { Item } from '@app/file-manager/models/item';
import { SecurityService } from '@app/file-manager/services/security.service';
import { ElectronIpcApiService } from '@app/file-manager/services/electron-ipc.api.service';
import { AppState } from '../dbstate/app-state';
import { Store } from '@ngrx/store';

@Injectable()
export class S3ExportService {

  constructor(
    private store: Store<AppState>,
    private electronService: ElectronIpcApiService,
  ) { }

  public startFileExportToS3(item: Item) {
    const dataTransfer = {
      'preserveStructure': JSON.parse(localStorage.getItem('preserveStructure')),
      'gcsToken': SecurityService.getAccessToken(),
      'bucketName': localStorage.getItem('S3BucketName'),
      'item': item
    };
    this.electronService.exportS3(dataTransfer);
  }

  public testCredentials() {
    const dataTransfer = {
      'accessKey': SecurityService.getS3AccessKey(),
      'secretKey': SecurityService.getS3SecretKey(),
      'bucketName': localStorage.getItem('S3BucketName'),
    };
    this.electronService.setCredentials(dataTransfer);
  }

  public startUpload(item) {
    const dataTransfer = {
      'preserveStructure': JSON.parse(localStorage.getItem('preserveStructure')),
      'gcsToken': SecurityService.getAccessToken(),
      'bucketName': localStorage.getItem('S3BucketName'),
      'item': item,
    };
    this.electronService.exportS3(dataTransfer);
  }

}
