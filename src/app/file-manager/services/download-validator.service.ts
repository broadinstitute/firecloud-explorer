import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { DiskStatus } from '../models/diskStatus';

@Injectable()
export class DownloadValidatorService {
  constructor(private electronService: ElectronService) { }
  public diskStatus: DiskStatus;

  public verifyDisk(destination: String, totalfilesSize: Number): Promise<DiskStatus> {
    return new Promise((result, reject) => {

      this.electronService.ipcRenderer.send('verify-before-download', destination, totalfilesSize);
      try {
        this.electronService.ipcRenderer.once('verify-before-download', (event, error, errorMessage) => {
          this.diskStatus = { hasErr: error, errMsg: errorMessage };
          result(this.diskStatus);
        });
      } catch (err) {
        reject(this.diskStatus = { hasErr: true, errMsg: err });
      }
    });
  }
}
