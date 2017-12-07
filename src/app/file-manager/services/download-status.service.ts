import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

/**
 * Toma los datos de la descarga para conocer su estado
 */
@Injectable()
export class DownloadStatusService {

  constructor() { }

  getStatus(): any {
    http.get()
  }
}
