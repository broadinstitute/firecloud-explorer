import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { Item } from '@app/file-manager/models/item';
const constants = require('../../../../electron_app/helpers/environment').constants;

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
      this.electronService.ipcRenderer.send(constants.IPC_GET_NODE_CONTENT, nodePath);
    }
  }

  public async getRecursiveNodeContent(nodePath) {
    if (this.electronService.isElectronApp) {
      this.electronService.ipcRenderer.send(constants.IPC_GET_RECURSIVE_NODE_CONTENT, nodePath);
    }
  }
}
