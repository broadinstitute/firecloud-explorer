import { Injectable } from '@angular/core';

@Injectable()
export class SecurityService {

  constructor() { }

  public static ACCESS_TOKEN: string = 'access_token';
  private authUrl: string;

  public static getAccessToken(): string {
    return localStorage.getItem(SecurityService.ACCESS_TOKEN);
  }

  public static setAccessToken(ddpToken: string): void {
    localStorage.setItem(SecurityService.ACCESS_TOKEN, ddpToken);
  }

  public static removeAccessToken(): void {
    localStorage.removeItem(SecurityService.ACCESS_TOKEN);
  }

}
