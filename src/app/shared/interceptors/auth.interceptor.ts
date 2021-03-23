/** 19112020 - Gaurav - Init version: Auth Interceptor Service to intercept outgoing http requests to add auth token.
 * 24112020 - Gaurav - Added auth token in the header
 */

import {
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { take, map, exhaustMap } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private _authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    return this._authService.getAuthStatusListener().pipe(
      take(1),
      map((authStatus) => {
        return {
          isUserAuthenticated: authStatus.isAuthenticated,
          token: authStatus.token,
        };
      }),
      exhaustMap(({ isUserAuthenticated, token }) => {
        if (!isUserAuthenticated) return next.handle(req);

        const modifiedReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
            'x-auth-token': token,
          },
        });

        return next.handle(modifiedReq);
      })
    );
  }
}
