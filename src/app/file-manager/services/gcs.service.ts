import { Injectable } from '@angular/core';
import { Http } from '@angular/http'
import { HttpClient } from '@angular/common/http';
import { } from '@types/gapi.client.storage';
import { environment } from '@env/environment';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/retry';

@Injectable()
export class GcsService {

  CLIENT_ID: string;
  CLIENT_SECRET: string;
  BUCKET_NAME: string;

  CALLBACK = 'http://localhost:4200';
  DOWNLOAD_URL = 'https://storage-download.googleapis.com/';

  public bucket_scopes = [
    'https://www.googleapis.com/auth/devstorage.read_only'
  ];

  production = false;

  constructor(private http: HttpClient) {
    this.CLIENT_ID = environment.CLIENT_ID;
    this.CLIENT_SECRET = environment.CLIENT_SECRET;
    this.BUCKET_NAME = environment.BUCKET_NAME;
  }

  private authorize() {
    const immediate = false;
    gapi.auth.authorize(
      { client_id: this.CLIENT_ID, 
        scope: this.bucket_scopes, 
        immediate: immediate 
      }, 
      authResult => {
        console.log(JSON.stringify(authResult));
      if (authResult && !authResult.error) {
          gapi.auth.setToken(authResult);
          return this.executeQuery();
      }
    });
  }

  private executeQuery() {
    let request = gapi.client['storage'].objects.list({
      bucket: this.BUCKET_NAME
    });
    request.execute(function(resp){
      if(resp.items !== null && resp.items !== undefined){
        console.log(resp.items);
        return JSON.stringify(resp.items);
      }
     return null;
    });
  }

  public getBucketFiles() {
    gapi.load('client', () => {
      gapi.client.load('storage', 'v1', () => {
        this.authorize();        
      });
    });
  }

}