import { Component, OnInit } from '@angular/core';
import { environment } from '@env/environment';
import { Router } from '@angular/router';
import { Message } from 'primeng/components/common/api';
import { AppComponent } from '../../app.component';
import { ElectronIpcApiService } from '@app/file-manager/services/electron-ipc.api.service';
import { LoginApiService } from '@app/file-manager/services/login-api.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {

  msgs: Message[] = [];
  fireCloudURL = environment.FIRECLOUD_URL;
  hasError = false;
  redirect = '/file-download';
  isSubmitted = false;

  constructor(
    private electronIpcService: ElectronIpcApiService,
    private loginService: LoginApiService,
    private router: Router
  ) { }

  ngOnInit() {
    localStorage.clear();
  }

  logIn() {
    this.hasError = false;
    this.isSubmitted = true;
    this.loginService.googleLogin().then(

      registered => {
        AppComponent.updateUserEmail.next(registered.toString());
        this.router.navigate([this.redirect]);
      },
      err => {
        this.hasError = true;
        this.isSubmitted = false;
        this.showError(err.status);
      }
    );
  }

  openFcOnBrowser() {
      this.electronIpcService.openExternalURL(this.fireCloudURL);
  }

  showError(errorCode: number) {
    this.msgs = [];
    switch (errorCode) {
      case 401:
        this.msgs.push({
          severity: 'warn',
          summary: 'Sorry, your FireCloud account is not authorized yet.',
          detail: 'Please try again later.'
        });
        break;
      case 403:
        this.msgs.push({
          severity: 'warn',
          summary: 'Sorry, your FireCloud account has not been activated yet.',
          detail: 'Please look for a "FireCloud Account Activation"' +
            'email in your inbox and follow the instructions to activate your account.'
        });
        break;
      case 404:
        this.msgs.push({
          severity: 'warn',
          summary: 'Sorry, your Google account is not associated with FireCloud.',
          detail: 'Please go to ' + this.fireCloudURL + ' to create one.'
        });
        break;
      default:
        this.msgs.push({
          severity: 'warn',
          summary: 'Sorry, something went wrong.',
          detail: 'Please try again later.'
        });
    }
  }
}
