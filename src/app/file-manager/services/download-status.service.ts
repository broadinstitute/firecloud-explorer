import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { Observable } from 'rxjs/Observable';

/**
 * Toma los datos de la descarga para conocer su estado
 */
@Injectable()
export class DownloadStatusService {

  constructor(private electronService: ElectronService) {}

  getStatus(): any {
    this.electronService.ipcRenderer.on('download-status', (event, props) => {
      console.log(props);
    });
  }
}
