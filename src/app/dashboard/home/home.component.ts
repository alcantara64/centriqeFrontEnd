/** 11122020 - Gaurav - Listen to global holding org and set the menu logo accordingly in the template
 * 11122020 - Gaurav - Open Info Dialog for Support or Privacy Terms
 * 16022021 - Gaurav - infogram BI dashboard changes
 * 16032021 - Gaurav - JIRA-CA-237
 * 18022021 - Abhishek - JIRA-CA-167: Render dashboards on UI -> set iframe link based on modules.
 * 24032021 - Gaurav - handled browser refresh
 */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import {
  AuthService,
  NavigationData,
  SelectedMenuLevels,
} from 'src/app/auth/auth.service';
import {
  DashBoardConfigResponse,
  DashboardService,
  HoldingOrg,
  HomePageData,
} from '../dashboard.service';
import { InfoDialogType } from '../shared/components/dialog/dialog.model';
import { DialogService } from '../shared/components/dialog/dialog.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, OnDestroy {
  loginUserName: any;
  globalHoldingOrg!: HoldingOrg;
  dashboardConfigs!: DashBoardConfigResponse[];
  currentConfig!: DashBoardConfigResponse;
  infoDialogType = InfoDialogType;
  private _userInfoSub$!: Subscription;

  biDashboardValues!: any;
  currentModule!: string;

  constructor(
    private _dashboardService: DashboardService,
    private _dialogService: DialogService,
    private _authService: AuthService,
    private _route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.currentModule = this._route.snapshot.url[0]?.path;

    /** 16032021 - Gaurav - JIRA-CA-237: Dashboard home page is outsite the dashboard route auth guard ambit, since it is the default page on app load
     * set the navigation data when here
     * 24032021 - Gaurav - Since Home component is shared accross various feature modules for analytics, refactored to store current navigation within here */
    this._authService
      .getSelectedMenuLevelsListenerObs()
      .pipe(take(1))
      .subscribe((value: SelectedMenuLevels) => {
        /** Get and store the current selected menu level */
        let path = this._route.snapshot.routeConfig?.path;
        if (!path || path === '') {
          path = '/dashboard';
        } else if (!(path.search('dashboard/') > 0)) {
          path = `dashboard/${path}`;
        }

        this._authService.setCurrentNavigation(<NavigationData>{
          commands: [path],
          extras: undefined,
          selectedMenuLevels: {
            selectedMenu: value.selectedMenu,
            selectedChildMenu: value.selectedChildMenu,
            isCanDeactivateInitiated: true,
          },
        });
      });

    this._userInfoSub$ = this._dashboardService
      .getHomeDataListener()
      .pipe(
        switchMap((name: HomePageData) => {
          this.loginUserName = name;
          return this._dashboardService.getCurrentHoldingOrgListenerObs();
        })
      )
      .subscribe((orgData: HoldingOrg) => {
        this.dashboardConfigs = orgData.dashboardConfig;
        this.dashboardConfigs?.forEach(element => {
          if (this.currentModule) {
            if (element.module === this.currentModule) {
              this.currentConfig = element;
            }
          } else {
            if (element.module === 'home') {
              this.currentConfig = element;
          }
          }
          // else {
          //   if (element.module === 'home') {
          //     this.currentConfig = element;
          //   }
          //   this.currentConfig = {
          //     dashboardLink: 'https://e.infogram.com/_/koGsqQVM6afPqihneHKx?src=embed',
          //   }
          // }
        });
        this.globalHoldingOrg = orgData;
      });

    this.biDashboardValues = {
      src: 'https://e.infogram.com/_/koGsqQVM6afPqihneHKx?src=embed',
      title: 'FANCY-ALL',
      width: '100%',
      height: '916',
    };
  }

  ngOnDestroy(): void {
    this._userInfoSub$.unsubscribe();
  }

  openInfoDialog(dialogType: InfoDialogType): void {
    this._dialogService.openInfoDialog(dialogType);
  }
}
