import { Injectable } from '@angular/core';
import { HttpRequest, HttpEvent, HttpHandler, HttpInterceptor, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap, retry } from 'rxjs/operators';
import { AuthenticationService } from '../shared/authentication/authentication.service';

@Injectable()
export class TrafficInterceptor implements HttpInterceptor {
  constructor(private readonly router: Router, private readonly authenticationService: AuthenticationService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!request.headers.get('Authorization') && !request.headers.get('x-registry-key')) {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'x-auth-token': this.authenticationService.getToken() || ''
      });
      request = request.clone({ headers });
    }

    return next.handle(request).pipe(
      retry(1),
      tap(
        (event: HttpEvent<any>) => {},
        (err: any) => {
          if (err instanceof HttpErrorResponse) {
            if (err.status === 401) {
              console.log(`Unauthorized`);
              this.authenticationService.clearStorage();
              this.router.navigate(['login']);
            }
          }
        }
      )
    );
  }
}
