/** 25112020 - Gaurav - Init version: CanActivate route only if privileged, safeguard privileged routes!!!
 * 16032021 - Gaurav - JIRA-CA-237 */
import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { take, map } from 'rxjs/operators';

import {
  AuthService,
  NavigationData,
  SelectedMenuLevels,
} from 'src/app/auth/auth.service';
import { dashboardRouteLinks } from './components/menu/constants.routes';

@Injectable()
export class DashboardRouteGuard implements CanActivate {
  constructor(private _authService: AuthService, private _router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | Promise<boolean | UrlTree> | Observable<boolean | UrlTree> {
    return this._authService.getAuthStatusListener().pipe(
      take(1),
      map((userData) => {
        /** Get the dashboardRouteLinks object key for the current URL path */
        const objectKey = Object.keys(dashboardRouteLinks).find(
          (key: string) =>
            (<any>dashboardRouteLinks)[key]?.routerLink ===
            route.routeConfig?.path
        );

        /** If object key does not exist in dashboardRouteLinks, then the URL should not exist as well!! */
        if (objectKey) {
          const requiredPrivilege = (<any>dashboardRouteLinks)[objectKey]
            .requiredPrivilege;

          // console.log(requiredPrivilege);

          if (requiredPrivilege) {
            /** Check user has the required privilege for this route, if not move to dashboard home */
            if (userData.userInfo?.privileges?.includes(requiredPrivilege)) {
              this._setCurrentNavigation(route, true);

              return true;
            } else {
              this._setCurrentNavigation(route, false);
              return this._router.createUrlTree(['/dashboard']);
            }
          } else {
            // No privilege noted as required for this route
            return true;
          }
        }
        return false;
      })
    );
  }

  /** 16032021 - Gaurav - JIRA-CA-237 */
  private _setCurrentNavigation(
    route: ActivatedRouteSnapshot,
    userAllowed: boolean
  ): void {
    let currentNavigationData: NavigationData;

    if (userAllowed) {
      this._authService
        .getSelectedMenuLevelsListenerObs()
        .pipe(take(1))
        .subscribe((value: SelectedMenuLevels) => {
          /** set the commands parameter to [route.routeConfig.path, spread of route.params values (from key:value)]
           * set the extras to { route.queryParams } */
          let path = route.routeConfig?.path ?? '/dashboard';
          if (!(path.search('dashboard/') > 0)) {
            path = `dashboard/${path}`;
          }

          /** Currently checks for only one parameter at the end of path, per the current state of the app as on 2021-Mar-16 */
          const searchLocation = path.search(':');
          path =
            searchLocation > 0
              ? path.slice(0, searchLocation - 1)
              : path.slice(0);

          const params = route.params;

          let paramValues: string[] = [];
          for (const param in params) {
            paramValues.push(params[param]);
          }

          const queryParams = route.queryParams;
          let extras = {};
          queryParams &&
            Object.entries(queryParams).length > 0 &&
            (extras = { ...extras, queryParams });

          // TODO 16032021 - Gaurav - handle params in future for add/edit/view/copy modes of a record
          /** Currently if the params are sent, the last opened record in add/edit/copy/view mode would open but without any data and prone to errors
           * because it uses the cached data (listener) which is being cached by its parents list.
           *
           * We can refresh the cache for some simple parent setup list (like roles, users, etc.) but other setup components are fetched on conditional and
           * complex logic which cannot use simple parent setup fetch logic from the child component.
           *
           * For NOW, ignoring any params and queryParams when the path has any of the add/edit/view/copy mode keywords. Need to discuss this with Frank. */
          const keys = ['/add', '/edit', '/copy', '/view'];

          for (const key of keys) {
            if (path.endsWith(key)) {
              path = path.substring(0, path.length - key.length);
              paramValues = [];
              extras = {};
              break;
            }
          }

          currentNavigationData = {
            commands: [path, ...paramValues],
            extras: undefined,
            selectedMenuLevels: {
              ...value,
              isCanDeactivateInitiated: true,
            },
          };

          Object.entries(extras).length > 0 &&
            (currentNavigationData = { ...currentNavigationData, extras });

          // console.log(
          //   { route },
          //   { path },
          //   { paramValues },
          //   { queryParams },
          //   { currentNavigationData }
          // );

          /** set the current navigation */
          this._authService.setCurrentNavigation(currentNavigationData);
        });
    } else {
      /** set the commands parameter to ['/dashboard'] */
      currentNavigationData = {
        commands: ['/dashboard'],
        extras: undefined,
        selectedMenuLevels: <SelectedMenuLevels>{
          isCanDeactivateInitiated: false,
          selectedChildMenu: 0,
          selectedMenu: 0,
        },
      };

      /** set the current navigation */
      this._authService.setCurrentNavigation(currentNavigationData);
    }
  }
}

/**Resolved by Frank by adding a type prefix before use as (<any>dashboardRouteLinks)
 *
 * Need Frank's help in resolving this compiler error:
 * error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'Readonly<{ PROGRESS: { routerLink: string; requiredPrivilege: null; linkName: string; }; CONFIGURATION: { routerLink: string; requiredPrivilege: null; linkName: string; }; VIEW: { routerLink: string; requiredPrivilege: null; linkName: string; }; ... 34 more ...; BILLING_PAYMENT_HISTORY: { ...; }; }>'.
      No index signature with a parameter of type 'string' was found on type 'Readonly<{ PROGRESS: { routerLink: string; requiredPrivilege: null; linkName: string; }; CONFIGURATION: { routerLink: string; requiredPrivilege: null; linkName: string; }; VIEW: { routerLink: string; requiredPrivilege: null; linkName: string; }; ... 34 more ...; BILLING_PAYMENT_HISTORY: { ...; }; }>'.
 */
