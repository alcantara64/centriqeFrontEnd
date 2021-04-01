/** 21122020 - Gaurav - Init version
 * 04212021 - Gaurav - Added NPS related code, to reuse this object
 * 19012021 - Gaurav - Added code and removed displayName
 * 21012021 - Gaurav - Modified for the Org DrDw
 * 08022021 - Gaurav - Added code for new progress-bar service
 */
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import {
  dashboardRouteLinks,
  DataDomainConfig,
} from 'src/app/dashboard/shared/components/menu/constants.routes';

import {
  DashboardService,
  HoldingOrg,
} from 'src/app/dashboard/dashboard.service';
import { SnackbarService } from 'src/app/shared/components/snackbar.service';
import { ResponseAIService } from '../response-ai.service';

import { DialogService } from 'src/app/dashboard/shared/components/dialog/dialog.service';
import {
  DialogConditionType,
  SystemDialogReturnType,
  SystemDialogType,
} from 'src/app/dashboard/shared/components/dialog/dialog.model';
import { consoleLog } from 'src/app/shared/util/common.util';
import { ResponseTypeStruct } from '../data-models/survey.model';
import { Observable, Subscription } from 'rxjs';
import { delay, map, switchMap, tap } from 'rxjs/operators';
import { ClientSetupService } from '../../client-setup/client-setup.service';
import {
  CanFilterByOrg,
  OrgDrDwEmitStruct,
  OrgIdentifier,
} from 'src/app/dashboard/shared/components/org-dropdownlist/org-dropdownlist.component';
import { LoadingService } from 'src/app/shared/services/loading.service';
import {AppConfigService} from 'src/app/shared/services/app-config.service';

@Component({
  selector: 'app-response-type-setup',
  templateUrl: './response-type-setup.component.html',
  styleUrls: ['../../../shared/styling/setup-table-list.shared.css'],
})
export class ResponseTypeSetupComponent implements OnInit, OnDestroy {
  isLoading = false;
  readonly dataDomainList = DataDomainConfig;
  private _showEditComponents = false;
  private _responseTypes: any[] = <any[]>[];
  private _listenerSub$!: Subscription;
  private _selectedHoldingOrgData!: HoldingOrg;
  private _orgAccessInformation!: any;

  currentFeature!: DataDomainConfig;
  valuesFromOrgDrDw!: OrgDrDwEmitStruct;

  /** Cols chosen to be displayed on the table */
  displayedColumns: string[] = [
    'displayName',
    'questionType',
    'required',
    'status',
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
    private _loadingService: LoadingService,
    public appConfigService: AppConfigService
  ) {
    /** Set current feature: nps OR response */
    switch (this._route.snapshot.routeConfig?.path) {
      case dashboardRouteLinks.NPS_MANAGE_NPS_MASTER.routerLink:
      case dashboardRouteLinks.NPS_NPS_MASTER_VIEW.routerLink:
        this.currentFeature = DataDomainConfig.nps;
        break;

      default:
        this.currentFeature = DataDomainConfig.response;
    }

    this._showEditComponents =
      this._route.snapshot.routeConfig?.path ===
        dashboardRouteLinks.RESPONSE_MANAGE_RESPONSE_TYPES.routerLink ||
      this._route.snapshot.routeConfig?.path ===
        dashboardRouteLinks.NPS_MANAGE_NPS_MASTER.routerLink;
  }

  ngOnInit(): void {
    this._setLoading(true);

    this._loadResponseTypes();
  }

  ngOnDestroy(): void {
    this._listenerSub$.unsubscribe();
  }

  isShowEditComponents(): boolean {
    /** Secure any side-effect() to change this variable apart from those intended */
    return this._showEditComponents;
  }

  /** Action buttons */
  onAdd(): void {
    this._router.navigate(['add'], {
      relativeTo: this._route,
      /** 21012021 - Gaurav - Pass query params to set the Org DrDw selected hol or mol org */
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

  onDuplicate(id: string, name: string, category: string): void {
    this._dialogService
      .openSystemDialog({
        alertType: SystemDialogType.warning_alert_yes_no,
        dialogConditionType: DialogConditionType.prompt_custom_data,
        title: `Duplicate ${
          this.currentFeature === DataDomainConfig.nps ? 'NPS' : 'Response AI'
        } ${category === 'section' ? 'Section' : 'Question'}`,
        body: `Do you want to copy '${name}' ${category} ${
          this.currentFeature === DataDomainConfig.nps ? 'nps' : 'response'
        } ${category === 'section' ? ' and all its questions' : 'question'}?`,
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

  onDelete(id: string, name: string, category: string): void {
    this._dialogService
      .openSystemDialog({
        alertType: SystemDialogType.warning_alert_yes_no,
        dialogConditionType: DialogConditionType.prompt_custom_data,
        title: `Delete ${
          this.currentFeature === DataDomainConfig.nps ? 'NPS' : 'Response AI'
        } ${category === 'section' ? 'Section' : 'Question'}`,
        body: `Do you want to delete '${name}' ${category} ${
          this.currentFeature === DataDomainConfig.nps ? 'nps' : 'response'
        } ${category === 'section' ? ' and all its questions' : 'question'}?`,
      })
      .then((response) => {
        /** Only process confirmation requests */
        if (response === SystemDialogReturnType.continue_yes) {
          this._setLoading(true);

          this._loadingService
            .showProgressBarUntilCompleted(
              this._responseAIService.deleteQuestion(this.currentFeature, id)
            )
            .subscribe(
              () => {
                this._snackbarService.showSuccess(
                  `${
                    this.currentFeature === DataDomainConfig.nps
                      ? 'NPS'
                      : 'Response AI'
                  } ${
                    category === 'section' ? 'Section' : 'Question'
                  } ${name} is deleted!`
                );

                /** Remove from local cache */
                const index = this._responseTypes.findIndex(
                  (resType: ResponseTypeStruct) => resType._id === id
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

  onStatusChange(
    currentStatus: number,
    id: string,
    name: string,
    category: string
  ): void {
    this._dialogService
      .openSystemDialog({
        alertType: SystemDialogType.warning_alert_yes_no,
        dialogConditionType: DialogConditionType.prompt_custom_data,
        title: `Status ${
          this.currentFeature === DataDomainConfig.nps ? 'NPS' : 'Response AI'
        } ${category === 'section' ? 'Section' : 'Question'}`,
        body: `Do you want to ${
          currentStatus === 0 ? 'activate' : 'inactivate'
        } '${name}' ${category} ${
          this.currentFeature === DataDomainConfig.nps ? 'nps' : 'response'
        } question?`,
      })
      .then((response) => {
        /** Only process confirmation requests */
        if (response === SystemDialogReturnType.continue_yes) {
          this._setLoading(true);

          /** Update status in backend */
          const status = currentStatus === 0 ? 1 : 0;

          this._loadingService
            .showProgressBarUntilCompleted(
              this._responseAIService.updateQuestion(this.currentFeature, id, {
                status,
              })
            )
            .subscribe(
              (result) => {
                /** Show snackbar to user */
                this._snackbarService.showSuccess(
                  `${
                    this.currentFeature === DataDomainConfig.nps
                      ? 'NPS'
                      : 'Response AI'
                  } ${
                    category === 'section' ? 'Section' : 'Question'
                  } ${name} is ${status === 1 ? 'activated' : 'inactivated'}!`
                );

                /** Instead of fetching all the response types again, just locally update the status of the
                 * successfully updated backend record. */
                const index = this._responseTypes.findIndex(
                  (resType: any) => resType._id === id
                );
                this._responseTypes[index].status = status;

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

  private _loadResponseTypes(): void {
    const loadQuestionsObs: Observable<any> = this._dashboardService
      .getCurrentHoldingOrgListenerObs()
      .pipe(
        switchMap((selectedHoldingOrgData: HoldingOrg) => {
          this._responseTypes = <any[]>[];
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
            return this._responseAIService.getQuestionsFromSearchQuery(
              this.currentFeature,
              valuesFromOrgDrDw?.searchPayload
            );
          }

          /** valuesFromOrgDrDw?.searchString should always have a value for either a holdingOrgId or a search string of memberOrgs */
          return this._responseAIService.getQuestionsFromSearchString(
            this.currentFeature,
            valuesFromOrgDrDw?.searchString
          );
        })
      );

    this._listenerSub$ = this._loadingService
      .showProgressBarUntilCompleted(loadQuestionsObs, 'query')
      .subscribe(
        async (resTypes) => {
          consoleLog({
            valuesArr: [
              'ResTypeSetup Component: _loadResponseTypes() resTypes',
              resTypes,
            ],
          });

          this._responseTypes = resTypes ?? <any[]>[];
          await this._filterQuestionsList();
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
    await this._filterQuestionsList();
  }

  async _filterQuestionsList(): Promise<void> {
    consoleLog({
      valuesArr: [
        'inside _filterQuestionsList(): this._responseTypes',
        this._responseTypes,
      ],
    });

    let filteredList: any[] = <any>[];
    if (this._responseTypes && this._responseTypes?.length > 0) {
      filteredList = this._responseTypes.filter(
        (listItem: any) =>
          listItem[this.valuesFromOrgDrDw?.compareByKeyForFilter] ===
          this.valuesFromOrgDrDw?.selectedOrgInDrDw?._id
      );
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
