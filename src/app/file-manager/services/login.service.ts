import { Injectable } from '@angular/core';

@Injectable()
export abstract class LoginService {

  abstract googleLogin(): Promise<Response>;

  abstract isLogged();
}
