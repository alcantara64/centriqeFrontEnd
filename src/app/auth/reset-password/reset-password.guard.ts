import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root'
})
export class ResetPasswordGuard implements CanActivate {
  private _isUserAuthenticated: boolean = false;
  constructor(private _authService: AuthService, private _router: Router) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      this._isUserAuthenticated = this._authService.isUserAuthenticated();
       return this._isUserAuthenticated;
  }
  
}
