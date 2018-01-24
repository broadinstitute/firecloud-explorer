import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

@Injectable()
export abstract class ElectronIpcService {

  abstract configureGoogleAccount(googleConfig: any, googleOptions: any): void;

  abstract googleOAuth(googleConfig, googleOptions): void;

  abstract googleTokenLogin(): Observable<any>;

  abstract removeAllListeners(channel: string): void;

  abstract openExternalURL(URL: string): void;

}
