import { Injectable } from '@angular/core';
import { environment } from '@env/environment';

@Injectable()
export class LoginMockService {
  constructor( ) { }

  public googleLogin(): Promise<Response> {
    return new Promise<Response>((resolve, reject) => {
      if (environment.testing) {
        const resp = new Response(
          {
          'userInfo':
            {
              'userSubjectId': '112826433216950074192',
              'userEmail': 'triveros@broadinstitute.org'
            },
          'enabled':
            {
              'google': true,
              'ldap': true,
              'allUsersGroup': true
            }
        });
        resolve(resp);
      } else {
        const resp = new Response(
          {
            'headers':
              {
                'normalizedNames': {},
                'lazyUpdate': null
              },
            'status': 404,
            'statusText': 'OK',
            'url': 'https://api.firecloud.org/me',
            'ok': false,
            'name': 'HttpErrorResponse',
            'message': 'Http failure response for https://api.firecloud.org/me: 404 OK',
            'error': {
              'statusCode': 404,
              'source': 'FireCloud',
              'timestamp': 1516430257842,
              'causes': [],
              'stackTrace': [],
              'message': 'FireCloud user registration not found'
            }
          });
        reject(resp);
      }
    });
  }

  public isLogged(): boolean {
    return true;
  }
}
