
import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { SecurityService } from './security.service';
import { Item } from '../models/item';
import { Response } from '@angular/http/src/static_response';
import { DiskStatus } from '../models/diskStatus';

@Injectable()
export class RegisterDownloadService {
  constructor(private electronService: ElectronService) { }
  public diskStatus: DiskStatus;

  public startDownload(items: Item[]) {
    if (this.electronService.isElectronApp) {
      this.electronService.ipcRenderer.send('start-download', items, SecurityService.getAccessToken());
    }
  }

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
