import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { SecurityService } from './security.service';
import { Item } from '../models/item';

@Injectable()
export class RegisterDownloadService {

  constructor(private electronService: ElectronService) { }

  public startDownload(items: Item[]) {
    if (this.electronService.isElectronApp) {
      this.electronService.ipcRenderer.send('start-download', items, SecurityService.getAccessToken());
    }
  }
}
