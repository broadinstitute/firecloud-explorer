import { Injectable } from '@angular/core';

@Injectable()
export class SecurityService {

  constructor() { }

  public static ACCESS_TOKEN = 'access_token';
  public static S3_ACCESS_KEY = 's3_access_key';
  public static S3_SECRET_KEY = 's3_secret_key';

  public static getAccessToken(): string {
    return localStorage.getItem(SecurityService.ACCESS_TOKEN);
  }

  public static setAccessToken(ddpToken: string): void {
    localStorage.setItem(SecurityService.ACCESS_TOKEN, ddpToken);
  }

  public static removeAccessToken(): void {
    localStorage.removeItem(SecurityService.ACCESS_TOKEN);
  }

  public static setS3AccessKey(accessKey: string): void {
    localStorage.setItem(SecurityService.S3_ACCESS_KEY, accessKey);
  }

  public static getS3AccessKey(): string {
    return localStorage.getItem(SecurityService.S3_ACCESS_KEY);
  }

  public static setS3SecretKey(secretKey: string): void {
    localStorage.setItem(SecurityService.S3_SECRET_KEY, secretKey);
  }

  public static getS3SecretKey(): string {
    return localStorage.getItem(SecurityService.S3_SECRET_KEY);
  }

}
