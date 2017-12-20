import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Store } from '@ngrx/store';
import { login } from '@app/core';
import { ElectronService } from 'ngx-electron';
import { SecurityService } from '../services/security.service';
import { FirecloudService } from '../services/firecloud.service';
import { Observable } from 'rxjs/Observable';

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
    private store: Store<any>,
    private firecloudService: FirecloudService) {
    this.electronService.ipcRenderer.send('configure-gaccount', googleConfig, googleOptions);
  }

  public googleLogin(): Promise<Response> {
    this.electronService.ipcRenderer.removeAllListeners('sendRendererMessage');
    if (this.electronService.isElectronApp) {
      return new Promise<Response>((resolve, reject) => {
        this.electronService.ipcRenderer.send('google-oauth', googleConfig, googleOptions);
        this.electronService.ipcRenderer.on('sendRendererMessage', (event, props) => {
          SecurityService.setAccessToken(props.result.access_token);
          // Verifies if usr is registerd to FireCloud
          this.firecloudService.getUserRegistrationStatus().subscribe(
            registered => {
              this.store.dispatch(login());
              resolve(registered.userInfo.userEmail);
            },
            notRegistered => {
              SecurityService.removeAccessToken();
              reject(notRegistered);
            });
        });
      });
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
