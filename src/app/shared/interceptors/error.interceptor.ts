/** 19112020 - Gaurav - Init version: Error Interceptor Service to intercept incoming http response errors,
 * and show them in the app all from one place. */

import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { SnackbarService } from '../components/snackbar.service';
import { consoleLog, ConsoleTypes } from '../util/common.util';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private _snackbarService: SnackbarService) {}
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    /** catchError in the observable pipe before returning to the subscriber */
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        /** 1. Get API error and
         * 2. Show a snackbar to the user for this error */
        consoleLog({ consoleType: ConsoleTypes.error, valuesArr: [error] });
        let errorMessage =
          'Either the server may be down or restarting or you may be facing network issues, please refresh page after some time. If issue persists, please contact this webpage administrator or your network provider.';

        let showErrorMessage =
          error?.error?.message ?? error?.error ?? errorMessage;

        !navigator.onLine &&
          (showErrorMessage =
            'Please check your network connection and try again');

        this._snackbarService.showError(showErrorMessage);

        return throwError(error);
      })
    );
  }
}
