/** 18112020 - Gaurav - Init version: Service for Authentication related actions in the app
 * 16032021 - Gaurav - JIRA-CA-237: User is forced to dashboard 'home' page on page refresh, fixed to load last navigation before refresh
 * 06042021 - Gaurav - JIRA-CA-340: Show offline status of user in the header
 */
import { IUser } from './../core/models/user';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NavigationExtras, Router } from '@angular/router';
import {
  BehaviorSubject,
  fromEvent,
  Observable,
  Observer,
  of,
  ReplaySubject,
} from 'rxjs';
import { map, mergeAll } from 'rxjs/operators';

import { environment } from '../../environments/environment';

const BACKEND_URL = `${environment.apiUrlV1}/user`;

export interface AuthStatusData {
  isAuthenticated: boolean;
  userInfo: any;
  token: string;
  isResetPasswordOnLogon: boolean;
}

export interface NavigationData {
  commands: any[];
  extras?: NavigationExtras | undefined;
  selectedMenuLevels: SelectedMenuLevels;
}

export interface SelectedMenuLevels {
  selectedMenu: number;
  selectedChildMenu: number;
  isCanDeactivateInitiated?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _isUserAuthenticated = false;

  private _authStatusListener = new BehaviorSubject<AuthStatusData>({
    isAuthenticated: false,
    userInfo: null,
    token: '',
    isResetPasswordOnLogon: false,
  });
  private _tokenTimer: any;
  isResetPasswordOnLogon: boolean = false;

  private _clearCanDeactivate = new BehaviorSubject<boolean>(false);

  private _selectedMenuLevelsListener = new ReplaySubject<SelectedMenuLevels>(
    1
  );

  constructor(private _http: HttpClient, private _router: Router) {}

  isOnline$() {
    return of(
      fromEvent(window, 'offline').pipe(map(() => false)),
      fromEvent(window, 'online').pipe(map(() => true)),
      new Observable((sub: Observer<boolean>) => {
        sub.next(navigator.onLine);
        sub.complete();
      })
    ).pipe(mergeAll());
  }

  setSelectedMenuLevelsListener(value: SelectedMenuLevels): void {
    this._selectedMenuLevelsListener.next(value);
    /** 19032021 - Gaurav - Removed setTimeout() and used delay() rxjs operator in the dashboard component instead */
    this._clearCanDeactivate.next(false);
  }

  getSelectedMenuLevelsListenerObs(): Observable<SelectedMenuLevels> {
    return this._selectedMenuLevelsListener.asObservable();
  }

  getClearCanDeactivateListener() {
    return this._clearCanDeactivate.asObservable();
  }

  getAuthStatusListener() {
    /** Return a copy of the observable to avoid any next() calls from outside here */
    return this._authStatusListener.asObservable();
  }
  checkIfToResetPasswordOnNextLogon(): boolean {
    const localStorageItem = localStorage.getItem('userInfo');
    let isResetPasswordOnLogon = false;
    if (localStorageItem) {
      const userInfo = JSON.parse(localStorageItem);
      isResetPasswordOnLogon = userInfo.resetPasswordNextLogon;
    }
    return isResetPasswordOnLogon;
  }

  isUserAuthenticated(): boolean {
    return this._isUserAuthenticated;
  }

  login(userId: string, password: string) {
    return this._http
      .post<{ token: string; userDetails: IUser }>(`${BACKEND_URL}/sign_in`, {
        userId,
        password,
        holdOrgCode: this.getCodeFromUrl(),
      })
      .pipe(
        /** Expected to get token always from the API on success */
        map((response) => {
          const { token, userDetails } = response;

          this._isUserAuthenticated = true;
          /** Use JS atob() instead of 3rd party decoder to decode JWT token */
          const parsedToken = JSON.parse(atob(token.split('.')[1]));
          this.isResetPasswordOnLogon =
            userDetails.resetPasswordNextLogon || false;
          /** Set auto-logoff timer based on token expiry seconds */
          this._setAuthTimer(parsedToken.exp);
          /** Save auth data in local storage till token expiry, and to persis user session */
          this._saveAuthData(token, userDetails);

          /** Update observers */
          this._authStatusListener.next({
            isAuthenticated: this._isUserAuthenticated,
            userInfo: userDetails,
            token,
            isResetPasswordOnLogon: this.isResetPasswordOnLogon,
          });

          return { isResetPasswordOnLogon: this.isResetPasswordOnLogon };
        })
      );
  }

  forgotPassword(email: string) {
    return this._http
      .post<{ message: string }>(`${environment.apiUrlV1}/forgot_password`, {
        email,
        holdOrgCode: this.getCodeFromUrl(),
      })
      .toPromise();
  }

  logout(): void {
    this._cleanUp();
    this._isUserAuthenticated = false;
    this._authStatusListener.next({
      isAuthenticated: this._isUserAuthenticated,
      userInfo: null,
      token: '',
      isResetPasswordOnLogon: false,
    });
    this.setSelectedMenuLevelsListener(<SelectedMenuLevels>{
      selectedMenu: 0,
      selectedChildMenu: 0,
      isCanDeactivateInitiated: false,
    });
    this._router.navigate(['/login']);
  }

  resetPassword(payload: { password: string }) {
    return this._http
      .post<{ message: string }>(
        `${BACKEND_URL}/users/update_password`,
        payload
      )
      .toPromise();
  }

  /** Called in App Component */
  autoLogin(): void {
    const authInformation = this._getAuthData();
    // No token found in localStorage cache
    if (!authInformation || !authInformation.token || !authInformation.userInfo)
      return;

    const parsedToken = JSON.parse(atob(authInformation.token.split('.')[1]));
    const expirationDate = new Date(0);
    expirationDate.setUTCSeconds(parsedToken.exp);
    const expiresIn = expirationDate.getTime();
    const now = new Date().getTime();

    /** If the token is yet to expire:
     * 1. set user info in JS memory,
     * 2. reset the timer to the remaining seconds, and
     * 3. update observers!
     *
     * else logout */
    if (expiresIn > now) {
      this._isUserAuthenticated = true;
      this._setAuthTimer(parsedToken.exp);
      this._authStatusListener.next({
        isAuthenticated: this._isUserAuthenticated,
        userInfo: JSON.parse(authInformation.userInfo),
        token: authInformation.token,
        isResetPasswordOnLogon: false,
      });

      /** 16032021 - Gaurav - JIRA-CA-237 */
      const currentNavigationData: NavigationData = this._getCurrentNavigation();
      console.log('authService: autoLogin', { currentNavigationData });

      /** Navigate to Route */
      this._router.navigate(
        currentNavigationData.commands,
        currentNavigationData?.extras &&
          Object.entries(currentNavigationData?.extras).length > 0
          ? {
              ...currentNavigationData.extras,
            }
          : undefined
      );

      /** Set last selected menu */
      this.setSelectedMenuLevelsListener({
        ...currentNavigationData.selectedMenuLevels,
      });

      /** 16032021 - Gaurav - JIRA-CA-237 - Ends */
    } else {
      this.logout();
    }
  }

  /** 16032021 - Gaurav - JIRA-CA-237 */
  public setCurrentNavigation(navigationData: NavigationData): void {
    localStorage.setItem(
      'currentNavigationData',
      JSON.stringify(navigationData)
    );
  }

  public setCurrentSelectedHoldingOrgId(holdingOrgId: string): void {
    localStorage.setItem('ho', holdingOrgId);
  }

  public getCurrentStoredHoldingOrgId(): string | null {
    return localStorage.getItem('ho');
  }

  private _getCurrentNavigation(): NavigationData {
    const currentNavigationData = localStorage.getItem('currentNavigationData');
    if (!currentNavigationData) {
      // default to dashboard
      return <NavigationData>{
        commands: ['/dashboard'],
        selectedMenuLevels: {
          selectedMenu: 0,
          selectedChildMenu: 0,
          isCanDeactivateInitiated: false,
        },
      };
    }

    return JSON.parse(currentNavigationData);
  }
  /** 16032021 - Gaurav - JIRA-CA-237 - Ends */

  private _setAuthTimer(seconds: number) {
    this._tokenTimer = setTimeout(() => {
      this.logout();
    }, seconds);
  }

  private _saveAuthData(token: string, userData: any): void {
    localStorage.setItem('token', token);
    localStorage.setItem('userInfo', JSON.stringify(userData));
  }

  private _getAuthData() {
    return {
      token: localStorage.getItem('token'),
      userInfo: localStorage.getItem('userInfo'),
    };
  }

  /** Clean-up before logout */
  private _cleanUp(): void {
    if (this._tokenTimer) clearTimeout(this._tokenTimer);
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    /** 16032021 - Gaurav - JIRA-CA-237 */
    localStorage.removeItem('currentNavigationData');
    localStorage.removeItem('ho');
  }

  public getCodeFromUrl(): string {
    const hostName = location.hostname;
    let code = '';
    if (hostName === 'localhost') {
      code = '';
    }
    if (hostName && hostName !== 'localhost') {
      const indexOfDot = hostName.indexOf('.');
      code = hostName.substring(0, indexOfDot);
      if (code === 'app') {
        code = '';
      }
    }
    return code;
  }
}
