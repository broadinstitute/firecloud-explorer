import { Component, OnInit } from '@angular/core';
import { environment } from '@env/environment';
import { SecurityService } from '../services/security.service';
import { Router } from '@angular/router';
import { LoginService } from '../services/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [LoginService, LoginService]
})
export class LoginComponent implements OnInit {

  constructor(private loginService: LoginService ,
              private router: Router) {}

  ngOnInit() {
    localStorage.clear();
   }
}
