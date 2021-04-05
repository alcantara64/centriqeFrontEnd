/** 29122020 - Gaurav - Init
 * 30122020 - Gaurav - added external url ngMultiPurposeAppUrl
 * 04212021 - Gaurav - Added NPS related code, to reuse this object
 * 12012021 - Gaurav - Modified to use new Survey APIs
 * 22012021 - Gaurav - Modified for the Org DrDw
 * 08022021 - Gaurav - Added code for new progress-bar service
 * 31032021 - Gaurav - JIRA-CA-310: Componentize setup-list action buttons
 */
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortable } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import {
  DashboardService,
  HoldingOrg,
} from 'src/app/dashboard/dashboard.service';
import {
  DialogConditionType,
  SystemDialogReturnType,
  SystemDialogType,
} from 'src/app/dashboard/shared/components/dialog/dialog.model';
import { DialogService } from 'src/app/dashboard/shared/components/dialog/dialog.service';
import {
  dashboardRouteLinks,
  DataDomainConfig,
} from 'src/app/dashboard/shared/components/menu/constants.routes';
import { SnackbarService } from 'src/app/shared/components/snackbar.service';
import { consoleLog } from 'src/app/shared/util/common.util';
import { ResponseAIService } from '../response-ai.service';

import { environment } from '../../../../../environments/environment';
import { Observable, Subscription } from 'rxjs';
import { delay, map, switchMap, tap } from 'rxjs/operators';
import {
  CanFilterByOrg,
  OrgDrDwEmitStruct,
} from 'src/app/dashboard/shared/components/org-dropdownlist/org-dropdownlist.component';
import { ClientSetupService } from '../../client-setup/client-setup.service';
import { LoadingService } from 'src/app/shared/services/loading.service';
import { AppConfigService } from 'src/app/shared/services/app-config.service';
import {
  AppButtonTypes,
  ButtonRowClickedParams,
} from 'src/app/dashboard/shared/components/buttons/buttons.model';

@Component({
  selector: 'app-survey-setup',
  templateUrl: './survey-setup.component.html',
})
export class SurveySetupComponent implements OnInit, OnDestroy {
  isLoading = false;
  readonly appButtonType = AppButtonTypes;
  readonly dataDomainList = DataDomainConfig;
  readonly ngMultiPurposeAppUrl =
    'ngMultiPurposeAppUrl' in environment
      ? environment?.['ngMultiPurposeAppUrl']
      : '';
  private _showEditComponents = false;
  private _surveys!: any;
  private _selectedHoldingOrgData!: HoldingOrg;
  private listenerSub$!: Subscription;
  private _orgAccessInformation!: any;
  currentFeature!: DataDomainConfig;
  valuesFromOrgDrDw!: OrgDrDwEmitStruct;

  /** Cols chosen to be displayed on the table */
  displayedColumns: string[] = [
    'displayName',
    'org',
    'pages',
    'status',
    'updatedAt',
    'action_buttons',
  ];
  dataSource!: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private _dashboardService: DashboardService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _responseAIService: ResponseAIService,
    private _dialogService: DialogService,
    private _snackbarService: SnackbarService,
    private _clientSetupService: ClientSetupService,
    public appConfigService: AppConfigService,
    private _loadingService: LoadingService
  ) {
    /** Set current feature: nps OR response */
    switch (this._route.snapshot.routeConfig?.path) {
      case dashboardRouteLinks.NPS_MANAGE_NPS_SETUP.routerLink:
      case dashboardRouteLinks.NPS_NPS_SETUP_VIEW.routerLink:
        this.currentFeature = DataDomainConfig.nps;
        break;

      default:
        this.currentFeature = DataDomainConfig.response;
    }

    this._showEditComponents =
      this._route.snapshot.routeConfig?.path ===
        dashboardRouteLinks.RESPONSE_MANAGE_FEEDBACK_SETUP.routerLink ||
      this._route.snapshot.routeConfig?.path ===
        dashboardRouteLinks.NPS_MANAGE_NPS_SETUP.routerLink;
  }

  ngOnInit(): void {
    this._setLoading(true);
    this._loadSurveys();
  }

  ngOnDestroy(): void {
    this.listenerSub$.unsubscribe();
  }

  isShowEditComponents(): boolean {
    /** Secure any side-effect() to change this variable apart from those intended */
    return this._showEditComponents;
  }

  /** Action buttons */
  onButtonRowClicked(args: ButtonRowClickedParams) {
    console.log({ args });

    switch (args.appButtonType) {
      case AppButtonTypes.edit:
        return this.onEdit(args._id);
      case AppButtonTypes.copy:
        return this.onDuplicate(args._id, args?.name!);
      case AppButtonTypes.status:
        return this.onStatusChange(args?.status!, args._id, args?.name!);
      case AppButtonTypes.view:
        return this.onView(args._id);
      case AppButtonTypes.delete:
        return this.onDelete(args._id, args?.name!);
    }
  }

  onAdd(): void {
    this._router.navigate(['add'], {
      relativeTo: this._route,
      /** 22012021 - Gaurav - Pass query params to set the Org DrDw selected hol or mol org */
      queryParams: this.getQueryParams,
    });
  }

  onEdit(id: string): void {
    this._router.navigate(['edit', id], {
      relativeTo: this._route,
    });
  }

  onView(id: string): void {
    this._router.navigate(['view', id], { relativeTo: this._route });
  }

  onDuplicate(id: string, name: string): void {
    this._dialogService
      .openSystemDialog({
        alertType: SystemDialogType.warning_alert_yes_no,
        dialogConditionType: DialogConditionType.prompt_custom_data,
        title: `Duplicate ${
          this.currentFeature === DataDomainConfig.nps ? 'NPS' : 'Response AI'
        } Survey`,
        body: `Do you want to copy ${
          this.currentFeature === DataDomainConfig.nps ? 'nps' : 'response'
        } survey '${name}'?`,
      })
      .then((response) => {
        /** Only process confirmation requests */
        if (response === SystemDialogReturnType.continue_yes) {
          this._router.navigate(['copy', id], {
            relativeTo: this._route,
          });
        }
      });
  }

  onDelete(id: string, name: string): void {
    this._dialogService
      .openSystemDialog({
        alertType: SystemDialogType.warning_alert_yes_no,
        dialogConditionType: DialogConditionType.prompt_custom_data,
        title: `Delete ${
          this.currentFeature === DataDomainConfig.nps ? 'NPS' : 'Response AI'
        } Survey`,
        body: `Do you want to delete ${
          this.currentFeature === DataDomainConfig.nps ? 'nps' : 'response'
        } survey '${name}'?`,
      })
      .then((response) => {
        /** Only process confirmation requests */
        if (response === SystemDialogReturnType.continue_yes) {
          this._setLoading(true);

          this._responseAIService
            .deleteSurvey(this.currentFeature, id)
            .subscribe(
              (response) => {
                this._snackbarService.showSuccess(
                  `${
                    this.currentFeature === DataDomainConfig.nps
                      ? 'NPS'
                      : 'Response AI'
                  } Survey ${name} is deleted!`
                );

                /** Remove from local */
                const index = this._surveys.findIndex(
                  (survey: any) => survey._id === id
                );
                this.dataSource.data.splice(index, 1);
                this.dataSource._updateChangeSubscription();

                this._setLoading(false);
              },
              (error) => {
                this._setLoading(false);
              }
            );
        }
      });
  }

  onStatusChange(currentStatus: number, id: string, name: string): void {
    this._dialogService
      .openSystemDialog({
        alertType: SystemDialogType.warning_alert_yes_no,
        dialogConditionType: DialogConditionType.prompt_custom_data,
        title: `Status ${
          this.currentFeature === DataDomainConfig.nps ? 'NPS' : 'Response AI'
        } Survey`,
        body: `Do you want to ${
          currentStatus === 0 ? 'activate' : 'inactivate'
        } '${name}' ${
          this.currentFeature === DataDomainConfig.nps ? 'nps' : 'response'
        } survey?`,
      })
      .then((response) => {
        /** Only process confirmation requests */
        if (response === SystemDialogReturnType.continue_yes) {
          this._setLoading(true);

          /** Update status in backend */
          const status = currentStatus === 0 ? 1 : 0;

          this._responseAIService
            .updateSurvey(this.currentFeature, id, { status })
            .subscribe(
              (result) => {
                /** Show snackbar to user */
                this._snackbarService.showSuccess(
                  `${
                    this.currentFeature === DataDomainConfig.nps
                      ? 'NPS'
                      : 'Response AI'
                  } Survey ${name} is ${
                    status === 1 ? 'activated' : 'inactivated'
                  }!`
                );

                /** Instead of fetching all the response types again, just locally update the status of the
                 * successfully updated backend record. */
                const index = this._surveys.findIndex(
                  (resType: any) => resType._id === id
                );
                this._surveys[index].status = status;

                this._setLoading(false);
              },
              (error) => {
                /** Handled by Http Interceptor */
                this._setLoading(false);
              }
            );
        }
      });
  }

  get selectedHoldingOrgData(): any {
    return this._selectedHoldingOrgData;
  }

  get orgAccessInformation(): any {
    return this._orgAccessInformation;
  }

  get getQueryParams(): any {
    return this.valuesFromOrgDrDw.queryParamsForNewRecord;
  }

  private _loadSurveys(): void {
    const loadSurveysObs: Observable<any> = this._dashboardService
      .getCurrentHoldingOrgListenerObs()
      .pipe(
        switchMap((selectedHoldingOrgData: HoldingOrg) => {
          this._surveys = <any[]>[];
          this._selectedHoldingOrgData = selectedHoldingOrgData;

          return this._clientSetupService.getOrgAccessInformation(
            this._selectedHoldingOrgData._id
          );
        }),
        tap((mOrgs) => {
          this._orgAccessInformation = mOrgs;
        }),
        /** Delay to wait for the EventEmitter value of DrDw component */
        delay(0),
        map(() => {
          return this.valuesFromOrgDrDw;
        }),
        switchMap((valuesFromOrgDrDw) => {
          if (valuesFromOrgDrDw?.filterByOrg === CanFilterByOrg.BOTH_ORGS) {
            return this._responseAIService.getSurveysFromSearchQuery(
              this.currentFeature,
              valuesFromOrgDrDw?.searchPayload
            );
          }

          /** valuesFromOrgDrDw?.searchString should always have a value for either a holdingOrgId or a search string of memberOrgs */
          return this._responseAIService.getSurveysFromSearchString(
            this.currentFeature,
            valuesFromOrgDrDw?.searchString
          );
        })
      );

    this.listenerSub$ = this._loadingService
      .showProgressBarUntilCompleted(loadSurveysObs, 'query')
      .subscribe(
        async (surveys) => {
          consoleLog({
            valuesArr: [
              'SurveySetup Component: _loadSurveys() surveys',
              surveys,
            ],
          });

          this._surveys = surveys ?? <any[]>[];
          await this._filterSurveysList();
          await this.sort.sort(({ id: 'updatedAt', start: 'desc'}) as MatSortable);
          this._setLoading(false);
        },
        (error) => {
          // shall be handled by Http Interceptor
          this._setLoading(false);
        }
      );
  }

  async listenToDrDw($event: OrgDrDwEmitStruct): Promise<void> {
    consoleLog({
      valuesArr: ['inside listenToDrDw, $event', $event],
    });

    this.valuesFromOrgDrDw = await $event;

    /** Set Survey Org selection to be used inside survey page when loading the saved questions/sections */
    this._responseAIService.setOrgDrDwData($event);

    await this._filterSurveysList();
  }

  async _filterSurveysList(): Promise<void> {
    consoleLog({
      valuesArr: [
        'inside _filterQuestionsList(): this._surveys',
        this._surveys,
      ],
    });

    let filteredList: any[] = <any>[];
    if (this._surveys && this._surveys?.length > 0) {
      filteredList = this._surveys.filter((listItem: any) => {
        let compareWith;
        /** 22012021 - Gaurav - Need to check with Frank, for some surveys it returns
         * a holdingOrg or memberOrg field as object (with _id) whilst for some as string?!
         */
        if (listItem[this.valuesFromOrgDrDw?.compareByKeyForFilter]?._id) {
          compareWith =
            listItem[this.valuesFromOrgDrDw?.compareByKeyForFilter]?._id;
        } else {
          compareWith = listItem[this.valuesFromOrgDrDw?.compareByKeyForFilter];
        }

        return compareWith === this.valuesFromOrgDrDw?.selectedOrgInDrDw?._id;
      });
    }

    this.dataSource = await new MatTableDataSource(filteredList ?? <any>[]);
    this.dataSource.paginator = await this.paginator;
    this.dataSource.sort = await this.sort;
  }

  private _setLoading(value: boolean): void {
    this.isLoading = value;
    if (!value) this._loadingService.loadingOff();
  }

  /** Mat table filter method */
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
