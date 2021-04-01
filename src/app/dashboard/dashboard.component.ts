/** 19112020 - Gaurav - Init version
 * 20112020 - Gaurav - Added UI - Sidenav, header, submenu
 * 26112020 - Gaurav - Added loading listenere from child components for progress-bar activation
 * 27112020 - Gaurav - Added menu levels event listener and set method for it on menu levels change (see Dashboard service comment for more info)
 * 11122020 - Gaurav - Listen to global holding org and set the menu logo accordingly in the template
 * 17022021 - Gaurav - JIRA CA-140: added more breakpoints and passed them to header
 */
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';

import { MatDrawer, MatDrawerMode } from '@angular/material/sidenav';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { delay } from 'rxjs/operators';

import {
  AuthService,
  AuthStatusData,
  SelectedMenuLevels,
} from '../auth/auth.service';
import { LoadingService } from '../shared/services/loading.service';
import { DashboardService, HoldingOrg } from './dashboard.service';
import { DashboardMenuEnum } from './shared/components/menu/constants.routes';
import {
  TwoLevelParentMenuItem,
  SelectedMenuItem,
  ThreeLevelParentMenuItem,
} from './shared/components/menu/menu.model';

import { MenuService } from './shared/components/menu/menu.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  /** Initial prop values */
  isLoading = false;
  userInfo: any;
  globalHoldingOrg!: HoldingOrg;

  /** Menu objects
   * Get the menu map and DO NOT create dup objects/arrays for each menu.
   * Use the already created hash map instead using get(enum) */
  menus!: Map<any, ThreeLevelParentMenuItem | TwoLevelParentMenuItem>;
  menuKeys = DashboardMenuEnum;

  /** Menu specific props - please change carefully!!! */
  selectedMenu = 0;
  selectedChildMenu = 0;
  isCanDeactivateProcess = false;

  /** Mat Drawer/Sidenav props
   * MatDrawerModes values: 'side', 'over' or 'push'
   */
  setDrawerPercent = '20%';
  hasBackdrop = true;
  mode: MatDrawerMode = 'over';
  drawerColor = '#3F51B5'; // CSS-COLORS
  lockMenu = false; // Lock Sidenav or Drawer
  breakpoints!: any;

  private _authStatusSub$!: Subscription;
  private _selectedMenuLevelsListenerSub$!: Subscription;
  private _clearCanDeactivateListenerSub$!: Subscription;
  private _globalHoldingOrgListenerSub$!: Subscription;
  private _layoutChangesObs!: Observable<BreakpointState>;
  private _layoutChangesSub$!: Subscription;
  /** Initial prop values - Ends */

  constructor(
    private _dashboardService: DashboardService,
    private _breakpointObserver: BreakpointObserver,
    private _router: Router,
    private _route: ActivatedRoute,
    private _menuService: MenuService,
    private _loadingService: LoadingService,
    private _authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this._initMenuDisplay();

    /** Get the user values */
    const getUserInfoObs: Observable<any> = this._dashboardService.getUserPrivilegesListener();

    this._authStatusSub$ = this._loadingService
      .showProgressBarUntilCompleted(getUserInfoObs, 'query')
      .subscribe((userData: AuthStatusData) => {
        if (userData.isAuthenticated) {
          this.userInfo = userData.userInfo;
          if(userData.userInfo?.resetPasswordNextLogon){
            this._router.navigate(['/changePassword']);
          }
          /** Get the applicable menus, pass the received privileges array after removing any dups */
          this.menus = this._menuService.getMenu(
            userData.userInfo?.privileges
              ? new Set(userData.userInfo?.privileges)
              : new Set()
          );
        }

        this._loadingService.loadingOff();
        this.isLoading = false;
      });

    /** 26112020 - Gaurav - Other components shall emit this listener whenever they are making API calls,
     * to let the progress-bar in dashboard know about the loading status
     *
     * Why delay(0) here? => Setting a subscription for the loading indicator value change triggered sync code, which resulted in the following error in the browser console  -
     * "core.js:4610 ERROR Error: NG0100: ExpressionChangedAfterItHasBeenCheckedError: Expression has changed after it was checked. Previous value: 'false'. Current value: 'true'."
     * Solution is to let Angular finish rendering the view template and reflect latest data changes on the screen, and let the JS VM turm complete.
     * After that moment, the delay is triggered and the subsequent subscription!
     * */
    this._selectedMenuLevelsListenerSub$ = this._authService
      .getSelectedMenuLevelsListenerObs()
      .pipe(delay(0))
      .subscribe((value: SelectedMenuLevels) => {
        // console.log('dashboard component', { value });

        if (value.isCanDeactivateInitiated) {
          this.setSelectedMenu(
            value.selectedMenu,
            true,
            value.selectedChildMenu
          );

          this.isCanDeactivateProcess = true;
        } else {
          this.isCanDeactivateProcess = false;
        }
      });

    /** 19032021 - Gaurav - Added delay() rxjs operator here and removed setTimeout() from auth service */
    this._clearCanDeactivateListenerSub$ = this._authService
      .getClearCanDeactivateListener()
      .pipe(delay(0))
      .subscribe((value: boolean) => (this.isCanDeactivateProcess = value));

    /** 11122020 - Gaurav - global holding org logo change */
    this._globalHoldingOrgListenerSub$ = this._dashboardService
      .getCurrentHoldingOrgListenerObs()
      .pipe(delay(0))
      .subscribe((orgData: HoldingOrg) => (this.globalHoldingOrg = orgData));

    //TEMP CODE TODO REMOVE - STARTS
    // this._router.navigate(
    //   [
    //     'responseAI/feedbackCampaignMasterView/viewSurveyResponses/60361c2298f9d30012e7d23c',
    //   ],
    //   {
    //     relativeTo: this._route,
    //   }
    // );

    // this._router.navigate(['sysAdmin/customerDataAttributes'], {
    //   relativeTo: this._route,
    // });

    // this._router.navigate(['sysAdmin/customerDataAttributeEnumsSetup'], {
    //   relativeTo: this._route,
    // });
    //TEMP CODE TODO REMOVE - ENDS
  }

  ngOnDestroy(): void {
    this._authStatusSub$.unsubscribe();
    this._layoutChangesSub$?.unsubscribe();
    this._selectedMenuLevelsListenerSub$.unsubscribe();
    this._clearCanDeactivateListenerSub$.unsubscribe();
    this._globalHoldingOrgListenerSub$?.unsubscribe();
  }

  /** Accordion related code below */
  setSelectedMenu(
    index: number,
    isCanDeactivateInProgress?: boolean,
    childMenuFromCanDeactivate?: number
  ) {
    // console.log(
    //   'setSelectedMenu',
    //   { index },
    //   { isCanDeactivateInProgress },
    //   { childMenuFromCanDeactivate }
    // );

    this.selectedMenu = index;
    this.setSelectedChildMenu(
      {
        menuItemLevelId: childMenuFromCanDeactivate ?? 0,
        routerLink: '',
      },
      isCanDeactivateInProgress
    );

    if (!isCanDeactivateInProgress) {
      this._authService.setSelectedMenuLevelsListener({
        selectedMenu: index,
        selectedChildMenu: 0,
      });
    }
  }

  setSelectedChildMenu(
    { menuItemLevelId, routerLink }: SelectedMenuItem,
    isCanDeactivateInProgress?: boolean
  ) {
    // console.log(
    //   'setSelectedChildMenu',
    //   { menuItemLevelId },
    //   { isCanDeactivateInProgress },
    //   { routerLink }
    // );

    this.selectedChildMenu = menuItemLevelId;

    if (routerLink && routerLink.length > 0)
      this._router.navigate([routerLink], { relativeTo: this._route });

    if (!isCanDeactivateInProgress) {
      this._authService.setSelectedMenuLevelsListener({
        selectedMenu: this.selectedMenu,
        selectedChildMenu: menuItemLevelId,
      });
    }
  }

  /** Side-drawer (menu) related code below */
  onToggleSideMenu(drawer: MatDrawer): void {
    if (this.lockMenu) {
      this.onToggleLockMenu();
    }
    drawer.toggle();
  }

  onToggleLockMenu(): void {
    this.lockMenu = !this.lockMenu;
    this.hasBackdrop = this.lockMenu ? false : true;
    this.mode = this.lockMenu ? 'side' : 'over';
  }

  onClickHome() {
    this.setSelectedMenu(0);
    this._router.navigate(['/dashboard']);
  }

  private _initMenuDisplay(): void {
    /** Load side-drawer in opened state,
     * in coordination with the starting property 'opened' set for mat-drawer in template */
    this.onToggleLockMenu();

    /** 17022021 - Gaurav - Added more breakpoints for logo on header */
    this._layoutChangesObs = this._breakpointObserver.observe([
      '(max-width: 900px)',
      '(max-width: 800px)',
      '(max-width: 650px)',
      '(max-width: 600px)',
      '(max-width: 450px)',
      '(max-width: 400px)',
      '(max-width: 350px)',
    ]);

    this._layoutChangesSub$ = this._layoutChangesObs.subscribe(
      ({ breakpoints }) => {
        /** 17022021 - Gaurav - Store to pass in header */
        this.breakpoints = breakpoints;

        //Set initial value again, if the screen is resized > 950px
        //Setting it to fixed value, otherwise the menu will get too large for higher resolutions
        this.setDrawerPercent = '250px';

        if (breakpoints['(max-width: 900px)']) {
          /** If menu is currently locked, unlock it and clear the lock pattern (side).
           * The lock button is already hidden from css file by media query */
          if (this.lockMenu) {
            this.onToggleLockMenu();
          }
          this.setDrawerPercent = '25%';
        }

        if (breakpoints['(max-width: 800px)']) this.setDrawerPercent = '30%';
        if (breakpoints['(max-width: 650px)']) this.setDrawerPercent = '40%';
        if (breakpoints['(max-width: 450px)']) this.setDrawerPercent = '60%';
        if (breakpoints['(max-width: 350px)']) this.setDrawerPercent = '70%';
      }
    );
  }
}
