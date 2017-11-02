import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
// import 'rxjs/add/operator/throw';

@Injectable()
export class RequestInterceptor implements HttpInterceptor {

    token = '';

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        // this.token = localStorage.getItem('token');

        if (request.method === 'OPTIONS') {
            const authReq = request.clone({
                headers: request.headers
                    .set('Access-Control-Allow-Origin', '*')
                });
            return next.handle(authReq);
        }

        if (request.method === 'POST') {
            const authReq = request.clone({
                headers: request.headers
                    .set('Accept', 'application/json')
                    .set('Content-Type', 'application/json')
                    .set('Access-Control-Allow-Origin', '*')
                });
            return next.handle(authReq);
        }

        const customReq = request.clone({
            headers: request.headers
                .set('Authorization', 'Token ' + this.token)
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .set('Access-Control-Allow-Origin', '*')
        });

        return next
            .handle(customReq)
            .do((ev: HttpEvent<any>) => {
                if (ev instanceof HttpResponse) {
                    console.log('ṕrocessing response ...', JSON.stringify(ev));
                }
                return ev;
            })
            .catch(response => {
                if (response instanceof HttpErrorResponse) {
                    const keys: string[] = JSON.parse(response.error).errorKeys;
                    console.log('processing error response', JSON.stringify(response, null, 2));
                }
                return Observable.throw(response);
            });
    }
}
