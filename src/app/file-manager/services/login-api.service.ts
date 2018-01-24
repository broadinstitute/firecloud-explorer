import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Store } from '@ngrx/store';
import { login } from '@app/core';
import { SecurityService } from '../services/security.service';
import { LoginService } from '@app/file-manager/services/login.service';
import { ElectronIpcApiService } from '@app/file-manager/services/electron-ipc.api.service';
import { FirecloudApiService } from '@app/file-manager/services/firecloud-api.service';

const constants = require('../../../../electron_app/helpers/enviroment').constants;

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
export class LoginApiService extends LoginService {
  constructor(
    private electronIpc: ElectronIpcApiService,
    private store: Store<any>,
    private firecloudService: FirecloudApiService) {
    super();
  }

  public googleLogin(): Promise<Response> {
    this.electronIpc.configureGoogleAccount(googleConfig, googleOptions);
    this.electronIpc.removeAllListeners(constants.IPC_GOOGLE_LOGIN);
    this.electronIpc.googleOAuth(googleConfig, googleOptions);
    return this.userRegistrationStatus();
  }

  private userRegistrationStatus(): Promise<Response> {
    return new Promise<Response>((resolve, reject) => {
      this.electronIpc.googleTokenLogin().subscribe(props => {
        SecurityService.setAccessToken(props.result.access_token);
        // Verifies if usr is registerd to FireCloud
        this.firecloudService.getUserRegistrationStatus().subscribe(
          registered => {
            this.store.dispatch(login());
            console.log(JSON.stringify(registered));
            resolve(registered.userInfo.userEmail);
          },
          notRegistered => {
            console.log(JSON.stringify(notRegistered));
            SecurityService.removeAccessToken();
            reject(notRegistered);
          });
      });
    });
  }

  public isLogged(): boolean {
    let logged = false;
    if (SecurityService.getAccessToken() !== null) {
      this.store.dispatch(login());
      logged = true;
    } return logged;
  }
}
