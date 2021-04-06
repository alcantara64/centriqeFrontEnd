/** 19112020 - Gaurav - Init version
 * 26112020 - Gaurav - Added menu options to select the Holding Org and call the listener
 * 28112020 - Gaurav - Emit selected holding org object than just its id
 * 04122020 - Gaurav - Changed to get holdingOrgs from a new field on the userInfo (get:/user/me )
 * 10122020 - Gaurav - Modified to add search/filter field for the holding orgs (if holdingOrgs[].length > 10)
 * 14122020 - Gaurav - Fix to hide holding org menu for non-admin users and where holdingOrgCount <=1
 * 22122020 - Ramesh - Added login user name in header section.
 * 23122020 - Gaurav - Change to keep Holding Org menu item enabled for allow-listed routes only
 * 23122020 - Gaurav - Removed listener/subscription used to show login user name and used the existing authStatus subscription
 * 29012021 - Abhishek - Added new route for customer detail view
 * 01022021 - Abhishek - Added system Config for customer detail view
 * 09022021 - Abhishek - Change logic for global org selector is also shown when canUseGlobalOrgSelector===true
 * 17022021 - Gaurav - JIRA CA-140: added new @Inputs()
 * 05032021 - Abhishek - Added new     dashboardRouteLinks.CLIENT_SETUP_DASHBOARD_ORG_CONFIGURATION
 * 09032021 - Gaurav - JIRA-CA-226: Adjust UI to work with new login and global selector routes
 * 16032021 - Gaurav - JIRA-CA-237: Persist selected global holding org on browser refresh
 * 25032021 - Gaurav - JIRA-CA-305: Whitelist global org selector for analytics submenus
 * 06042021 - Gaurav - JIRA-CA-340: Show offline status of user in the header */
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { fromEvent, Observable, Subscription } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  startWith,
} from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { LoadingService } from 'src/app/shared/services/loading.service';
import { consoleLog } from 'src/app/shared/util/common.util';
import { DashboardService, HoldingOrg } from '../dashboard.service';
import { dashboardRouteLinks } from '../shared/components/menu/constants.routes';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() isLoading = false;
  @Input() menuLocked = false;
  @Input() setDrawerPercent = '249px';
  @Input() drawerOpened!: boolean;
  @Input() breakpoints!: any;
  @Output() toggleSideMenu = new EventEmitter<void>();
  @ViewChild('holdingOrgFilter') holdingOrgFilter!: ElementRef<any>;

  private _routerEventsSub$!: Subscription;
  private _isEnabledHoldingOrgMenu = true;
  private _allowListRoutes = [
    { routerLink: '/dashboard' },
    dashboardRouteLinks.ASK_BUDDY_PROGRESS_ANALYTICS,
    dashboardRouteLinks.BILLING_CURRENT_BALANCE,
    dashboardRouteLinks.BILLING_PAYMENT_HISTORY,
    dashboardRouteLinks.CLIENT_SETUP_CUSTOMERLIST_VIEW,
    dashboardRouteLinks.CLIENT_SETUP_HOLDINGORG_VIEW,
    dashboardRouteLinks.CLIENT_SETUP_MANAGE_HOLDINGORG,
    dashboardRouteLinks.CLIENT_SETUP_MANAGE_LOAD_CUSTOMERDATA,
    dashboardRouteLinks.CLIENT_SETUP_DASHBOARD_ORG_CONFIGURATION,
    dashboardRouteLinks.CLIENT_SETUP_MANAGE_MEMBERORG,
    dashboardRouteLinks.CLIENT_SETUP_MEMBERORG_VIEW,
    dashboardRouteLinks.CLIENT_SETUP_UNSUBSCRIBED_VIEW,
    dashboardRouteLinks.COMMUNICATION_CAMPAIGN_MASTER_VIEW,
    dashboardRouteLinks.COMMUNICATION_CUSTOMERLIST_VIEW,
    dashboardRouteLinks.COMMUNICATION_CUSTOMERDETAIL_VIEW,
    dashboardRouteLinks.COMMUNICATION_LAUNCHED_CAMPAIGNS_VIEW,
    dashboardRouteLinks.COMMUNICATION_MANAGE_CAMPAIGN_MASTER,
    dashboardRouteLinks.COMMUNICATION_MANAGE_TEMPLATE,
    dashboardRouteLinks.COMMUNICATION_TEMPLATE_VIEW,
    dashboardRouteLinks.COMMUNICATION_UNSUBSCRIBED_VIEW,
    dashboardRouteLinks.COMMUNICATION_PROGRESS_ANALYTICS,
    dashboardRouteLinks.INSIGHT_BUSINESS_ANALYTICS,
    dashboardRouteLinks.INSIGHT_PROGRESS_ANALYTICS,
    dashboardRouteLinks.NPS_CUSTOMERLIST_VIEW,
    dashboardRouteLinks.NPS_MANAGE_NPS_CAMPAIGN,
    dashboardRouteLinks.NPS_MANAGE_NPS_MASTER,
    dashboardRouteLinks.NPS_MANAGE_NPS_SETUP,
    dashboardRouteLinks.NPS_NPS_CAMPAIGN_VIEW,
    dashboardRouteLinks.NPS_NPS_MASTER_VIEW,
    dashboardRouteLinks.NPS_NPS_SETUP_VIEW,
    dashboardRouteLinks.NPS_PAST_CAMPAIGNS_VIEW,
    dashboardRouteLinks.NPS_UNSUBSCRIBED_VIEW,
    dashboardRouteLinks.NPS_PROGRESS_ANALYTICS,
    dashboardRouteLinks.RESPONSE_CUSTOMERLIST_VIEW,
    dashboardRouteLinks.RESPONSE_FEEDBACK_CAMPAIGN_VIEW,
    dashboardRouteLinks.RESPONSE_FEEDBACK_SETUP_VIEW,
    dashboardRouteLinks.RESPONSE_MANAGE_FEEDBACK_CAMPAIGN,
    dashboardRouteLinks.RESPONSE_MANAGE_FEEDBACK_SETUP,
    dashboardRouteLinks.RESPONSE_MANAGE_RESPONSE_TYPES,
    dashboardRouteLinks.RESPONSE_PAST_CAMPAIGNS_VIEW,
    dashboardRouteLinks.RESPONSE_RESPONSE_TYPES_VIEW,
    dashboardRouteLinks.RESPONSE_UNSUBSCRIBED_VIEW,
    dashboardRouteLinks.RESPONSE_PROGRESS_ANALYTICS,
    dashboardRouteLinks.SYSTEM_ADMIN_MANAGE_MESSAGES,
    dashboardRouteLinks.SYSTEM_ADMIN_MANAGE_MESSAGE_EVENTS,
    dashboardRouteLinks.USER_MANAGEMENT_MANAGE_ROLES,
    dashboardRouteLinks.USER_MANAGEMENT_MANAGE_USERS,
    dashboardRouteLinks.USER_MANAGEMENT_ROLES_VIEW,
    dashboardRouteLinks.USER_MANAGEMENT_USERS_VIEW,
  ];

  isOnline = true;
  isUserAuthenticated = false;
  selectedHoldingOrg!: HoldingOrg;
  filteredHoldingOrgs!: HoldingOrg[];
  loginUserName: string = '';
  private _isUserAnAdmin = false;
  private _canUseGlobalOrgSelector = false;
  private _holdingOrgsList!: HoldingOrg[];
  private _firstHoldingOrgInListFromServer!: HoldingOrg;
  private _systemConfigData!: any;
  private _dashboardConfigData!: any;
  private _authStatusSub$!: Subscription;
  private _onlineStatusSub$!: Subscription;

  constructor(
    private _authService: AuthService,
    private _dashboardService: DashboardService,
    private _router: Router,
    private _loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    /** 23122020 - Gaurav - Get the current route and check with the allow-listed route to enable holding org menu */
    this._routerEventsSub$ = this._router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd
        )
      )
      .subscribe(({ url }) => {
        let currentRoute = url;

        if (currentRoute.indexOf('/dashboard/') !== -1) {
          currentRoute = currentRoute.slice(11);
        }

        this._isEnabledHoldingOrgMenu = this._allowListRoutes.some(
          (route) => route.routerLink === currentRoute
        );
      });

    this._onlineStatusSub$ = this._authService
      .isOnline$()
      .subscribe((online) => {
        this.isOnline = online;
        console.log({ online });
      });

    this._authStatusSub$ = this._authService
      .getAuthStatusListener()
      .subscribe((userData) => {
        this.isUserAuthenticated = userData.isAuthenticated;
        if (userData?.userInfo) {
          this._isUserAnAdmin = userData.userInfo?.isAdmin;
          this._canUseGlobalOrgSelector =
            userData.userInfo?.canUseGlobalOrgSelector;
          this.loginUserName = `${userData.userInfo?.firstName ?? ''} ${
            userData.userInfo?.lastName ?? ''
          }`;

          this._holdingOrgsList = <HoldingOrg[]>(
            userData.userInfo?.holdingOrgList
          );

          this.filteredHoldingOrgs = this._holdingOrgsList;

          this._firstHoldingOrgInListFromServer =
            <HoldingOrg>userData.userInfo?.holdingOrg ?? {};

          this._systemConfigData = userData.userInfo?.systemConfig;
          this._dashboardConfigData = userData.userInfo?.dashboardConfig;

          this.selectedHoldingOrg = {
            ...this._firstHoldingOrgInListFromServer,
            systemConfig: { ...this._systemConfigData },
            dashboardConfig: [...this._dashboardConfigData],
          };

          const storedHoldingOrgId = this._authService.getCurrentStoredHoldingOrgId();

          if (
            storedHoldingOrgId &&
            storedHoldingOrgId !== this._firstHoldingOrgInListFromServer._id
          ) {
            this.onSelectHoldingOrg(<HoldingOrg>{ _id: storedHoldingOrgId });
          } else {
            if (this.selectedHoldingOrg) {
              this._dashboardService.setSelectedHoldingOrg(
                this.selectedHoldingOrg
              );
            }
          }
        }
        consoleLog({ valuesArr: ['from the header', userData] });
      });
  }

  ngOnDestroy() {
    this._authStatusSub$.unsubscribe();
    this._routerEventsSub$.unsubscribe();
    this._onlineStatusSub$.unsubscribe();
  }

  /** 10122020 - Gaurav - Added Holding Org filter
   * Wait for 400ms before emitting the stable filter text (when the user pauses typing), and remove any dups */
  ngAfterViewInit() {
    /** 14122020 - Gaurav - Fix for angular error - ERROR TypeError: Cannot read property 'nativeElement' of undefined, check validity of filter input  */
    if (this.holdingOrgFilter) {
      const filterOrg$: Observable<string> = fromEvent<any>(
        this.holdingOrgFilter.nativeElement,
        'keyup'
      ).pipe(
        map((event) => event.target.value),
        startWith(''),
        debounceTime(400),
        distinctUntilChanged()
      );

      filterOrg$.subscribe((filterText) => {
        if (!filterText) {
          this.clearFilter();
        } else {
          this.filteredHoldingOrgs = this._holdingOrgsList.filter((org) =>
            org.name.toLowerCase().includes(filterText.toLowerCase())
          );
          /** The input element lost focus when the menu-items were rebuilt based on filtered content.
           * Set the focus back to the input element */
          this.holdingOrgFilter.nativeElement.focus();
        }
      });
    }
  }

  getHoldingOrgsCount(): number {
    return this._holdingOrgsList?.length ?? 0;
  }

  clearFilter(): void {
    this.filteredHoldingOrgs = this._holdingOrgsList;
  }
  /** 10122020 - Gaurav - Added Holding Org filter - Ends */

  /** 14122020 - Gaurav - pass a getter instead of variable to outside world */
  get isAdmin(): boolean {
    return this._isUserAnAdmin;
  }

  get canUseGlobalOrgSelector(): boolean {
    return this._canUseGlobalOrgSelector;
  }
  get isDisabled(): boolean {
    return !this._isEnabledHoldingOrgMenu || this.isLoading;
  }

  onLogout(): void {
    this._authService.logout();
  }

  onHamburger(): void {
    this.toggleSideMenu.emit();
  }

  onSelectHoldingOrg(selectedHoldingOrg: HoldingOrg): void {
    this._authService.setCurrentSelectedHoldingOrgId(selectedHoldingOrg._id);

    if (selectedHoldingOrg._id === this._firstHoldingOrgInListFromServer._id) {
      this._setGlobalHoldingOrg({
        ...this._firstHoldingOrgInListFromServer,
        dashboardConfig: [...this._dashboardConfigData],
      });
      return;
    }
    this._setLoading(true);
    // Get additional holding org data for the selected holding org from the server
    this._loadingService
      .showProgressBarUntilCompleted(
        this._dashboardService.getAdditionalHoldingOrgData(
          selectedHoldingOrg._id
        ),
        'query'
      )
      .subscribe(
        (response: any) => {
          this._setGlobalHoldingOrg(response?.holdingOrg);
          this._setLoading(false);
        },
        () => {
          this._setLoading(false);
        }
      );
  }

  private _setGlobalHoldingOrg(fetchedHoldingOrg: HoldingOrg): void {
    this.selectedHoldingOrg = {
      ...fetchedHoldingOrg,
      systemConfig: { ...this._systemConfigData },
    };
    console.log(
      'from the header globallySelectedHoldingOrg',
      this.selectedHoldingOrg
    );
    this._dashboardService.setSelectedHoldingOrg(this.selectedHoldingOrg);
  }

  private _setLoading(value: boolean): void {
    this.isLoading = value;
    if (!value) this._loadingService.loadingOff();
  }
}
