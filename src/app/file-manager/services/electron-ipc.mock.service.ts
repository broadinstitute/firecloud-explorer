import { Injectable } from '@angular/core';
import { ElectronIpcService } from '@app/file-manager/services/electron-ipc.service';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ElectronIpcMockService extends ElectronIpcService {

  constructor() {
    super();
  }

  public configureGoogleAccount(googleConfig, googleOptions): void { }

  public googleOAuth(googleConfig, googleOptions): void { }

  public googleTokenLogin(): Observable<any> {
    return Observable.create(obs => {
      obs.next({'result':
          {
            'access_token': '1111111111111',
            'expires_in': 800,
            'id_token': '22222222222222',
            'token_type': 'Bearer'
          }
      });
    });
  }

  public removeAllListeners(channel: string): void { }

  public openExternalURL(URL: string): void { }
}
