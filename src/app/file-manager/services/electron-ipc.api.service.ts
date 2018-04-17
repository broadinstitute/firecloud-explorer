import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { ElectronIpcService } from '@app/file-manager/services/electron-ipc.service';
import { Observable } from 'rxjs/Observable';
import { SecurityService } from '@app/file-manager/services/security.service';
const constants = require('../../../../electron_app/helpers/environment').constants;

@Injectable()
export class ElectronIpcApiService extends ElectronIpcService {

  constructor(private electronService: ElectronService) {
    super();
  }

  public configureGoogleAccount(googleConfig, googleOptions): void {
    this.electronService.ipcRenderer.send(constants.IPC_CONFIGURE_ACCOUNT, googleConfig, googleOptions);
  }

  public googleOAuth(googleConfig, googleOptions): void {
    this.electronService.ipcRenderer.send(constants.IPC_GOOGLE_AUTH, googleConfig, googleOptions);
  }

  public googleTokenLogin(): Observable<any> {
    return Observable.create(obs => {
      this.electronService.ipcRenderer.on(constants.IPC_GOOGLE_LOGIN, (event, props) => {
        obs.next(props);
      });
    });
  }

  public removeAllListeners(channel: string): void {
    this.electronService.ipcRenderer.removeAllListeners(channel);
  }

  public openExternalURL(URL: string): void {
    this.electronService.shell.openExternal(URL);
  }

  public logout(): void {
    this.electronService.ipcRenderer.send(constants.IPC_GOOGLE_LOGOUT);
  }

  public exportS3(dataTransfer: any): void {
    this.electronService.ipcRenderer.send(constants.IPC_EXPORT_TO_S3_START, dataTransfer);
  }

  public setCredentials(credentials): void {
    this.electronService.ipcRenderer.send(constants.IPC_AWS_HANDLE_CREDENTIALS, credentials);
  }

  public awsTestCredentials(): Promise<any> {
    this.electronService.ipcRenderer.removeAllListeners(constants.IPC_AWS_HANDLE_CREDENTIALS);
    return new Promise<Response>((resolve, reject) => {
      this.electronService.ipcRenderer.on(constants.IPC_AWS_HANDLE_CREDENTIALS, (event, message) => {
        if (message) {
          reject(message);
        } else {
          resolve();
        }
      });
    });
  }
}
