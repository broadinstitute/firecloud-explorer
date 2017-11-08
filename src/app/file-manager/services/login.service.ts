import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Store } from '@ngrx/store';
import { login} from '@app/core';
import { ElectronService } from 'ngx-electron';
import { SecurityService } from '../services/security.service';

const googleConfig = {
  clientId: environment.CLIENT_ID,
  clientSecret: environment.CLIENT_SECRET,
  authorizationUrl: environment.AUTHORIZATION_URL,
  tokenUrl: environment.TOKEN_URL,
  useBasicAuthorizationHeader: false,
  redirectUri: environment.REDIRECT_URI
};

const googleOptions = {
  scope: ['email',
          'profile',
          'https://www.googleapis.com/auth/compute',
          'https://www.googleapis.com/auth/devstorage.full_control'].join(' '),
  accessType: 'offline'
};

@Injectable()
export class LoginService {
  constructor(private electronService: ElectronService,
              private store: Store<any>) {}

  public googleLogin(): Promise<void> {
     if (this.electronService.isElectronApp) {
      const promise = new Promise<void>((resolve, reject) => {
        this.electronService.ipcRenderer.send('google-oauth', googleConfig, googleOptions);
        this.electronService.ipcRenderer.on('sendRendererMessage', (event, props) => {
          SecurityService.setAccessToken(props.result.access_token);
          this.store.dispatch(login());
          resolve();
        });
      });
      return promise;
    } else {
      alert('Implement web login');
      return null;
    }
  }

  public isLogged(): boolean {
    let logged = false;
    if (SecurityService.getAccessToken() !== null) {
      this.store.dispatch(login());
      logged = true;
    } return logged;
  }
}
