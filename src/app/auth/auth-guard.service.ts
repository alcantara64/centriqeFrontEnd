/** 19112020 - Gaurav - Init version: Auth Guard to prevent unauthenticated users from accessing
 *  the angular routes directly from the browser */
import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';

import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuardService implements CanActivate {
  private _isUserAuthenticated = false;
  private _isResetPasswordOnNextLogon: boolean = false;

  constructor(private _authService: AuthService, private _router: Router) {}

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    /** Need to find a better way than using isUserAuthenticated()
     * Move user to login page if user is somehow unauthenticated
     */

    this._isUserAuthenticated = this._authService.isUserAuthenticated();
    this._isResetPasswordOnNextLogon = this._authService.checkIfToResetPasswordOnNextLogon();
    (!this._isUserAuthenticated) &&
    this._router.navigate(['/login']);
    ( this._isResetPasswordOnNextLogon && this._router.navigate(['/changePassword']));
    return this._isUserAuthenticated;
  }
}
