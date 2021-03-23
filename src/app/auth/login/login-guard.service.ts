/** 19112020 - Gaurav - Init version: Auth Guard to prevent showing user the login page */
import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';

import { AuthService } from '../auth.service';

@Injectable({ providedIn: 'root' })
export class LoginGuardService implements CanActivate {
  private _isUserAuthenticated = false;

  constructor(private _authService: AuthService, private _router: Router) {}

  async canActivate(): Promise<boolean> {
    this._isUserAuthenticated = this._authService.isUserAuthenticated();
    return !this._isUserAuthenticated;
  }
}
