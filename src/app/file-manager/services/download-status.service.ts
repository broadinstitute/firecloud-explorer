import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { Observable } from 'rxjs/Observable';
import { FilesDatabase } from '../transferables-grid/transferables-grid.component';

/**
 * Toma los datos de la descarga para conocer su estado
 */
@Injectable()
export class DownloadStatusService {
  filesDatabase: FilesDatabase;
  allItemsStatus = Observable;
  itemsStatus = [];

  constructor(private electronService: ElectronService) {
  }

  getStatus(): Observable<any> {
    this.electronService.ipcRenderer.removeAllListeners('download-status');
    const allItemsStatus = Observable.create((observer) => {
      this.electronService.ipcRenderer.on('download-status', (event, data) => {
        observer.next(data);
      });
    });
    return allItemsStatus;
  }

  updateItemProgess(): any {
  }

  generalProgress(): any {
    
  }

  private ifNotExist(targetArray: Array<any>, element: any): Array<any> {
    return;
  }
}
