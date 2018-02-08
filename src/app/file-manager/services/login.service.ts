import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

@Injectable()
export abstract class LoginService {

  abstract googleLogin(): Promise<Response>;

  abstract isLogged();

  abstract logOut(): void;
}
