import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { Item } from '../models/item';

@Injectable()
export class RegisterUploadService {

  constructor(private electronService: ElectronService) { }

  public getFileSystem(folderPath) {
    if (this.electronService.isElectronApp) {
      this.electronService.ipcRenderer.send('get-filesystem', folderPath);
    }
  }

  public async getLazyNodeContent(nodePath) {
    if (this.electronService.isElectronApp) {
      this.electronService.ipcRenderer.send('get-node-content', nodePath);
    }
  }
}
