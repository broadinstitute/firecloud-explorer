import { Component, OnInit } from '@angular/core';
import { environment } from '@env/environment';
import { SecurityService } from '../services/security.service';
import { Router } from '@angular/router';
import { LoginService } from '../services/login.service';
import { Message } from 'primeng/components/common/api';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [LoginService, LoginService]
})
export class LoginComponent implements OnInit {

  msgs: Message[] = [];
  fireCloudURL = environment.FIRECLOUD_URL;

  constructor(private loginService: LoginService,
    private router: Router) { }

  ngOnInit() {
    localStorage.clear();
  }

  showError() {
    this.msgs = [];
    // 401 error
    this.msgs.push({
      severity: 'warn',
      summary: 'Sorry, your FireCloud account is not authorized yet.',
      detail: 'Please try again later.'
    });

    // 403 error
    // this.msgs.push({
    //   severity:'warn',
    //   summary:'Sorry, your FireCloud account has not been activated yet.',
    //   detail:'Please look for a "FireCloud Account Activation" email in your inbox and follow the instructions to activate your account.'
    // });

    // 404 error
    // this.msgs.push({
    //   severity:'warn',
    //   summary:'Sorry, your Google account is not associated with FireCloud.',
    //   detail:'Sorry, your Google account is not associated with FireCloud. Please go to ' + this.fireCloudURL + 'to create one.'
    // });

    // 500 and 503 error
    // this.msgs.push({
    //   severity:'warn',
    //   summary:'Sorry, something went wrong.',
    //   detail:'Please try again later.'
    // });
  }
}