/** 19112020 - Gaurav - Init version: Module to handle App Module providers. That is,
 * those services and interceptors which are not self-injected at root level */
import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

/** Custom Interceptors:
 * AuthInterceptor to intercept outgoing HTTP requests
 * ErrorInterceptor to intercept incoming HTTP response errors */
import { AuthInterceptor } from './shared/interceptors/auth.interceptor';
import { ErrorInterceptor } from './shared/interceptors/error.interceptor';

@NgModule({
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ],
})
export class CoreModule {}
