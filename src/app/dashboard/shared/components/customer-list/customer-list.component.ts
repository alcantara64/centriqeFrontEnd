/** 28112020 - Gaurav - Init version
 * 30112020 - Gaurav - Modified to use dataDomainConfig object instead of an array
 * Current implemented logic (Customer List page filter) =>
  1. Get current selected (global) holding org
  2. check dataDomainConfig records, if found GOTO 2.1, else GOTO3
    2.1 check memberOrg value for 'customer' key, if true GOTO 2.2 else GOTO 3
    2.2 check that there are memberOrgs[].length > 0 available for this global holdingOrg, if found GOTO 2.3 else GOTO 3
    2.3 filter Customer List by first memberOrg[0] (display memberOrg Name if memberOrg[].length === 1, else drop-down for memberOrg list)
  3. filter Customer List by global holdingOrgId
  01122020 - Made changes to send search string to Customer List API, for selective fetch
  04122020 - Changes/Updates for the new holdingOrgs field on userInfo (get:/user/me )
  14122020 - Gaurav - Fixed to clear last selected templateId and mat-table selection on each holding org change
  15122020 - Gaurav - New requirement to show customer list in comm-ai as well. Moved this component to dashboard => shared folder and made changes accordingly
  2021-01-18 - Frank - added support for survey interactive sending
 */
/**
 * 29012021 - Abhishek - Added dynamic table columns and its list based on globle holding org change
 * 01022021 - Abhishek - Set listner for selected holding org data
 * 05022021 - Abhishek set payload for customerLis post call to set sorting, searching and pagination.
 * 08022021 - Gaurav - Added code for new progress-bar service
 * 10022021 - Abhishek - Set search filter observable same as globle org selector search is working.
 */
import { SelectionModel } from '@angular/cdk/collections';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { fromEvent, Observable, of, Subscription } from 'rxjs';
import {
  switchMap,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  startWith, } from 'rxjs/operators';
import { AuthStatusData } from 'src/app/auth/auth.service';
import {
  DashboardService,
  HoldingOrg,
} from 'src/app/dashboard/dashboard.service';
import {
  DashboardMenuEnum,
  dashboardRouteLinks,
  DataDomainConfig,
  MenuAccessEnum,
} from 'src/app/dashboard/shared/components/menu/constants.routes';
import { SnackbarService } from 'src/app/shared/components/snackbar.service';
import { EmailService } from 'src/app/shared/services/email.service';
import { consoleLog, ConsoleTypes } from 'src/app/shared/util/common.util';
import { CommunicationAIService } from '../../../features/communication-ai/communication-ai.service';
import { ResponseAIService } from '../../../features/response-ai/response-ai.service';
import { ClientSetupService } from '../../../features/client-setup/client-setup.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { DialogService } from '../dialog/dialog.service';
import {
  DialogConditionType,
  SystemDialogReturnType,
  SystemDialogType,
} from '../dialog/dialog.model';
import { LoadingService } from 'src/app/shared/services/loading.service';
import {AppConfigService} from 'src/app/shared/services/app-config.service';

/** Created enum, instead of using boolean values, in case more than two filters condition are introduced */
enum FilterBy {
  HOLDING_ORG,
  MEMBER_ORG,
}

@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.css'],
})
export class CustomerListComponent implements OnInit, OnDestroy, AfterViewInit {
  isLoading = false;
  private _searchString = '';
  private _customerList!: any[];
  private _customerListSub$!: Subscription;
  private _authStatusSub$!: Subscription;
  selectedHoldingOrgData!: HoldingOrg;

  selectedMemberOrg!: any;
  private _filterCustomerListBy!: FilterBy;
  /** 11122020 - Gaurav - Add Email Template DrDw change */
  emailTemplateList!: any;
  private _userPrivileges!: string[];
  selectedTemplateId!: any;
  sendingEmail = false;
  searchText: string = '';
  /** 14122020 - Gaurav - store the getOrgAccessInformation */
  private _orgAccessInformation!: any;

  /** 15122020 - Gaurav - Shared component with Comm-AI changes */
  private _currentRoute!: string | undefined;
  currentParentFeature!: DashboardMenuEnum;
  currentDataDomainConfig!: DataDomainConfig;
  dataDomainConfigToUse!: string;
  private _searchPayload: any = {};
  dashBoardEnumVal = DashboardMenuEnum;
  selectedOrg!: any;
  tableColumn: string[] = [];
  customerData: any[] = [{ code: 'select' }];
  totalRecords = 0;
  /** Cols chosen to be displayed on the table */
  // displayedColumns: string[] = [
  //   'select',
  //   'customerCode',
  //   'fullName',
  //   'memberType',
  //   'email',
  //   'cellPhone',
  //   'country',
  //   'state',
  //   'city',
  //   'custSegmentDetails',
  // ];
  displayedColumns: string[] = [];
  filterColumns: string[] = [];
  dataSource!: MatTableDataSource<any>;
  selection = new SelectionModel<any>(true, []);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('input') searchFilter!: ElementRef<any>;

  constructor(
    private _dashboardService: DashboardService,
    private _clientSetupService: ClientSetupService,
    private _communicationAIService: CommunicationAIService,
    private _responseAIService: ResponseAIService,
    private _emailService: EmailService,
    private _snackbarService: SnackbarService,
    private _activatedRoute: ActivatedRoute,
    private _dialogService: DialogService,
    private _route: ActivatedRoute,
    private _router: Router,
    public appConfigService: AppConfigService,
    private _loadingService: LoadingService
  ) {}

  /** 05022021 - Abhishek - Set pagination when user redirect from detail view to list view */
  ngAfterViewInit(): void {
    if (this.searchFilter) {
      const filterOrg$: Observable<string> = fromEvent<any>(
        this.searchFilter.nativeElement,
        'keyup'
      ).pipe(
        map((event) => event.target.value),
        startWith(''),
        debounceTime(400),
        distinctUntilChanged()
      );

      filterOrg$.subscribe((filterText) => {
        if(this._searchPayload?.query){
          this.applyFilter(filterText);
        }
        this.searchFilter.nativeElement.focus();
        /** The input element lost focus when the menu-items were rebuilt based on filtered content.
         * Set the focus back to the input element */
        // this.searchFilter.nativeElement.focus();
      });
    }

    this.paginator[
      '_pageSize'
    ] = this._dashboardService.defaultPaylod?.options?.limit;
    this.paginator['_pageIndex'] = this._dashboardService.defaultPaylod?.options
      ?.offset
      ? this._dashboardService.defaultPaylod?.options?.offset /
        this._dashboardService.defaultPaylod?.options?.limit
      : 0;
  }

  ngOnInit(): void {
    /** 15122020 - Gaurav - Store the current route, parent-feature */
    this._currentRoute = this._activatedRoute.snapshot.routeConfig?.path;
    /** 16122020 - Gaurav - Converted IF to SWITCH, and added new caller entries */
    let currentUrl = this._router.url;
    let previousUrl;
    this._router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        previousUrl = currentUrl;
        currentUrl = event.url;
        if (
          !(
            previousUrl.includes(currentUrl) || currentUrl.includes(previousUrl)
          )
        ) {
          this._searchPayload = {};
          this._dashboardService.defaultPaylod = {
            options: {
              offset: 0,
              limit: this.appConfigService.systemMatTableProperties.pageSizeOptions[2],
            },
          };
        }
      }
    });
    this.searchText =
      this._dashboardService.defaultPaylod.options?.globalSearch?.searchValue ??
      '';
    switch (this._currentRoute) {
      case dashboardRouteLinks.COMMUNICATION_CUSTOMERLIST_VIEW.routerLink:
        this.currentParentFeature = DashboardMenuEnum.COMM_AI;
        this.currentDataDomainConfig = DataDomainConfig.communication;
        break;

      case dashboardRouteLinks.RESPONSE_CUSTOMERLIST_VIEW.routerLink:
        this.currentParentFeature = DashboardMenuEnum.RESP_AI;
        this.currentDataDomainConfig = DataDomainConfig.response;
        break;

      case dashboardRouteLinks.NPS_CUSTOMERLIST_VIEW.routerLink:
        this.currentParentFeature = DashboardMenuEnum.NPS;
        this.currentDataDomainConfig = DataDomainConfig.nps;
        break;

      default:
        /** Default to Client-setup, else add more 'if's above for other features */
        this.currentParentFeature = DashboardMenuEnum.CLIENT_SETUP;
        this.currentDataDomainConfig = DataDomainConfig.customer;
    }

    /** 11122020 - Gaurav - Add Email Template DrDw change - get the user privileges from cache */
    this._authStatusSub$ = this._dashboardService
      .getUserPrivilegesListener()
      .subscribe((userData: AuthStatusData) => {
        this._userPrivileges = userData?.userInfo?.privileges ?? [];
      });

    /** Get the current selected global holdingOrg, fetch details for that holding org, fetch the customer list
     * and show the customer list conditionally */
    this._setLoading(true);

    const initCustomerListObs: Observable<any> = this._dashboardService
      .getCurrentHoldingOrgListenerObs()
      .pipe(
        switchMap((selectedHoldingOrgData: HoldingOrg) => {
          this.displayedColumns = [];
          /**14122020 - Gaurav - clear last selected TemplateId and mat-table selection, on each holding org change */
          this.selectedTemplateId = undefined;
          this.selection?.clear();
          this.selectedHoldingOrgData = selectedHoldingOrgData;

          this.selectedHoldingOrgData = {
            ...this.selectedHoldingOrgData,
            memberOrgs: [],
          };

          /** Check that the current global Holding Org have the data-domain config set up for it,
           * ELSE filter customer list by the current selected holding org ID */
          /** Check Customer Data Binding record is available */
          let dataDomainBindingData;
          if (
            this.selectedHoldingOrgData?.dataDomainConfig &&
            Object.keys(this.selectedHoldingOrgData?.dataDomainConfig)?.length >
              0 &&
            this.selectedHoldingOrgData?.dataDomainConfig?.hasOwnProperty(
              DataDomainConfig.customer
            )
          ) {
            dataDomainBindingData = this.selectedHoldingOrgData
              ?.dataDomainConfig?.[DataDomainConfig.customer];
          }

          if (dataDomainBindingData?.holdingOrgLevel) {
            this._filterCustomerListBy = FilterBy.HOLDING_ORG;
          } else if (dataDomainBindingData?.memberOrgLevel) {
            this._filterCustomerListBy = FilterBy.MEMBER_ORG;
          }

          /** 05022021 - Abhishek - Filter and sort usedInTable view properties    */
          this.customerData = [{ code: 'select' }];
          this.selectedHoldingOrgData?.dataConfig?.customer?.dataAttributes?.map(
            (data: any) => {
              if (data.useInTableView === true) {
                this.customerData.push(data);
              }
            }
          );
          this.customerData?.length > 1
            ? this.customerData.push({ code: 'action_buttons' })
            : null;
          this.tableColumn = this.customerData.sort((a, b) => {
            return a.tableViewOrder - b.tableViewOrder;
          });

          /** 05022021 - Abhishek - Set dynamic displayed column for table  */
          if (this.customerData.length > 1) {
            this.customerData.forEach((data: any) => {
              this.displayedColumns.push(data.code);
            });
          }

          /** 05022021 - Abhishek - Set dynamic sort filedName for payload  */
          for (let index = 1; index < this.customerData.length - 1; index++) {
            if (this.customerData[index]?.type === 'string') {
              this.filterColumns.push(this.customerData[index].code);
            }
          }
          return this._clientSetupService.getOrgAccessInformation(
            this.selectedHoldingOrgData._id
          );
        }),
        switchMap((mOrgs) => {
          this._orgAccessInformation = mOrgs;

          /** Get the customer memberOgs for the selected holding org from fetched org-access-information */
          if (this._orgAccessInformation?.customer?.memberOrgs?.length > 0) {
            this.selectedHoldingOrgData = {
              ...this.selectedHoldingOrgData,
              memberOrgs: this._orgAccessInformation?.customer?.memberOrgs.map(
                (member: any) => member
              ),
            };
          }

          /** Generate search string or payload */
          // this._searchPayload = {};
          this._searchString = '';
          let queryArray!: any[];

          if (this._filterCustomerListBy === FilterBy.HOLDING_ORG) {
            this._searchString = `?holdingOrg=${this.selectedHoldingOrgData._id}`;
            queryArray = [{ holdingOrg: this.selectedHoldingOrgData._id }];
          }

          if (this._filterCustomerListBy === FilterBy.MEMBER_ORG) {
            if (this.selectedHoldingOrgData?.memberOrgs?.length > 0) {
              this._searchString =
                this._filterCustomerListBy === FilterBy.MEMBER_ORG ? '?' : '';

              this.selectedMemberOrg = this.selectedHoldingOrgData?.memberOrgs[0];
              this.selectedHoldingOrgData?.memberOrgs.forEach((memberOrg) => {
                this._searchString += `memberOrg=${memberOrg?._id}&`;
              });

              this._searchString = this._searchString.slice(0, -1);
            }
            queryArray = [
              {
                memberOrg: this.selectedMemberOrg._id,
              },
            ];
          }

          /** 05022021 - Abhishek - set payload to get customer list */
          this._searchPayload = this._searchPayload?.options
            ? {
                ...this._searchPayload,
                query: {
                  $or: <any[]>queryArray,
                },
              }
            : {
                // options: {
                //   offset: 0,
                //   limit: 10
                // },
                query: {
                  $or: <any[]>queryArray,
                },
              };
          return this._dashboardService.getCustomersListFromSearch(
            this._searchPayload
          );
        }),
        switchMap((customerList: any) => {
          this.totalRecords = customerList?.info?.totalCount;
          this._customerList = customerList?.results ?? [];

          /** Only call the email template API if user has required privileges OR this page is called from Comm-AI, else RETURN empty */
          if (
            !this.hasRequiredPrivileges() ||
            (this.currentParentFeature !== DashboardMenuEnum.COMM_AI &&
              this.currentParentFeature !== DashboardMenuEnum.NPS &&
              this.currentParentFeature !== DashboardMenuEnum.RESP_AI)
          )
            return of([{ results: [] }]);

          /** ***** BELOW CODE EXECUTED ONLY IF THIS PAGE IS OPENED FROM COMM-AI that is =>
           *  this.currentParentFeature === DashboardMenuEnum.COMM_AI */
          let dataDomainBindingData;
          if (
            this.selectedHoldingOrgData?.dataDomainConfig &&
            Object.keys(this.selectedHoldingOrgData?.dataDomainConfig)?.length >
              0
          ) {
            switch (this.currentParentFeature) {
              case DashboardMenuEnum.COMM_AI:
                dataDomainBindingData = this.selectedHoldingOrgData
                  ?.dataDomainConfig?.[DataDomainConfig.communication];
                break;

              case DashboardMenuEnum.NPS:
                dataDomainBindingData = this.selectedHoldingOrgData
                  ?.dataDomainConfig?.[DataDomainConfig.nps];
                break;

              case DashboardMenuEnum.RESP_AI:
                dataDomainBindingData = this.selectedHoldingOrgData
                  ?.dataDomainConfig?.[DataDomainConfig.response];
                break;

              default:
              // none
            }
          } else {
            // rare case no dataDomainConfig data for a holding-org, but still handled here to avoid any runtime errors -
            return of([{ results: [] }]);
          }

          /** Get the communication memberOgs for the selected holding org from fetched org-access-information */
          /** Generate search string or payload */
          // this._searchPayload = {};
          this._searchString = '';

          const commBothOrgsLevel =
            dataDomainBindingData.holdingOrgLevel &&
            dataDomainBindingData.memberOrgLevel;
          const commHoldingOrgLevel = dataDomainBindingData.holdingOrgLevel;
          const commMemberOrgLevel = dataDomainBindingData.memberOrgLevel;
          const commHasMemberOrgs =
            this._orgAccessInformation?.communication?.memberOrgs?.length > 0;

          if (commBothOrgsLevel || commHoldingOrgLevel) {
            this._searchString = `?holdingOrg=${this.selectedHoldingOrgData._id}`;
          }

          if ((commBothOrgsLevel || commMemberOrgLevel) && commHasMemberOrgs) {
            this._searchString = !commHoldingOrgLevel ? '?' : '';

            this._orgAccessInformation?.communication?.memberOrgs.forEach(
              (memberOrg: any) => {
                this._searchString += `memberOrg=${memberOrg?._id}&`;
              }
            );

            this._searchString = this._searchString.slice(0, -1);
          }

          /** Both Holding Org and Member Org configured as true in communication data domain config for this global holding org */
          if (commBothOrgsLevel && commHasMemberOrgs) {
            let payload = {
              options: {
                offset: 0,
                limit: 500,
              },
              query: {
                $or: <any[]>[
                  { holdingOrg: this.selectedHoldingOrgData._id },
                  {
                    memberOrg: this._orgAccessInformation?.communication?.memberOrgs.map(
                      (memberOrg: any) => memberOrg._id
                    ),
                  },
                ],
              },
            };

            if (this.currentParentFeature === DashboardMenuEnum.COMM_AI) {
              return this._communicationAIService.getTemplateListFromSearch(
                payload
              );
            } else if (
              this.currentParentFeature === DashboardMenuEnum.NPS ||
              this.currentParentFeature === DashboardMenuEnum.RESP_AI
            ) {
              return this._responseAIService.getSurveysFromSearch(
                this.currentDataDomainConfig,
                payload
              );
            } else {
              throw new Error('UI error');
            }
          }

          /** Either Holding Org OR Member Org configured as true in communication data domain config for this global holding org */

          if (this.currentParentFeature === DashboardMenuEnum.COMM_AI) {
            return this._communicationAIService.getTemplateList(
              this._searchString
            );
          } else if (
            this.currentParentFeature === DashboardMenuEnum.NPS ||
            this.currentParentFeature === DashboardMenuEnum.RESP_AI
          ) {
            return this._responseAIService.getSurveyList(
              this.currentDataDomainConfig,
              this._searchString
            );
          } else {
            throw new Error('UI error');
          }
        })
      );

    this._customerListSub$ = this._loadingService
      .showProgressBarUntilCompleted(initCustomerListObs, 'query')
      .subscribe(
        async (templateOrSurveyList: any) => {
          this.emailTemplateList = templateOrSurveyList?.results ?? [];

          await this.filterCustomerList();

          this._setLoading(false);
        },
        (error) => {
          this._setLoading(false);
        }
      );
  }

  ngOnDestroy(): void {
    this._customerListSub$?.unsubscribe();
    this._authStatusSub$?.unsubscribe();
  }

  private _setLoading(value: boolean): void {
    this.isLoading = value;
    if (!value) this._loadingService.loadingOff();
  }

  /** 11122020 - Gaurav - Add Email Template DrDw change - Starts */
  /** Copied Frank's send email code from old app source for Email Template DrDw change. Added Snackbar */
  /** 15122020 - Gaurav - Changes per new requirement of dialog boxes */
  onSendMessage(): void {
    if (this.getSelectedCustomersCount() > 200) {
      this._dialogService
        .openSystemDialog({
          alertType: SystemDialogType.info_alert_ok,
          dialogConditionType: DialogConditionType.prompt_custom_data,
          title: 'Send Message Limit',
          body: `Interactive message sending is only available for up to 200 customers.`,
        })
        .then(() => {});
    } else {
      let postData: any;
      if (this.currentDataDomainConfig === DataDomainConfig.communication) {
        postData = {
          templateId: this.selectedTemplateId,
          customerIds: this.selection.selected.map((customer) => customer._id),
          dataDomain: this.currentDataDomainConfig,
        };
      } else {
        postData = {
          surveyId: this.selectedTemplateId,
          customerIds: this.selection.selected.map((customer) => customer._id),
          dataDomain: this.currentDataDomainConfig,
        };
      }

      // consoleLog({
      //   valuesArr: ['postData', postData],
      // });

      const index = this.emailTemplateList.findIndex(
        (template: any) => template._id === this.selectedTemplateId
      );
      const templateNameCode =
        index !== -1
          ? `${this.emailTemplateList[index].name} (${this.emailTemplateList[index].code})`
          : '';

      this._dialogService
        .openSystemDialog({
          alertType: SystemDialogType.warning_alert_yes_no,
          dialogConditionType: DialogConditionType.prompt_custom_data,
          title: 'Confirm Send Message',
          body: `Do you want to send the content of template ${templateNameCode} to ${this.getSelectedCustomersCount()} customer${
            this.getSelectedCustomersCount() > 1 ? 's' : ''
          }?`,
        })
        .then((response) => {
          if (response === SystemDialogReturnType.continue_yes) {
            this.sendingEmail = true;
            this._setLoading(true);
            this._emailService.sendEmail(postData).subscribe(
              (v) => {
                this._snackbarService.showSuccess(
                  this.getSelectedCustomersCount() === 1
                    ? 'Email sent!'
                    : 'Emails sent!'
                );
                //to avoid people to click this too often
                setTimeout(() => {
                  this.sendingEmail = false;
                }, 5000);
                this._setLoading(false);
              },
              (error) => {
                // Shall be handled by the error interceptor
                setTimeout(() => {
                  this.sendingEmail = false;
                }, 5000);
                this._setLoading(false);
              }
            );
          }
        });
    }
  }

  /** 15122020 - Gaurav - New methods for Send Demo message */
  onSendDemoMessage(): void {
    if (this.getSelectedCustomersCount() > 1) {
      this._dialogService
        .openSystemDialog({
          alertType: SystemDialogType.info_alert_ok,
          dialogConditionType: DialogConditionType.prompt_custom_data,
          title: 'Send Demo Message',
          body: `Please select only one customer.`,
        })
        .then(() => {});
    } else {
      const template = this.emailTemplateList.find(
        (template: any) => template._id === this.selectedTemplateId
      );
      const customer = this.selection.selected[0];

      this._dialogService
        .openDemoDialog(template, customer, this.currentDataDomainConfig)
        .then(() => {});
    }
  }

  hasRequiredPrivileges(): boolean {
    return (
      this._userPrivileges &&
      this._userPrivileges.some(
        (privilege) =>
          privilege === `${DashboardMenuEnum.COMM_AI}_${MenuAccessEnum.EDIT}` ||
          privilege === `${DashboardMenuEnum.COMM_AI}_${MenuAccessEnum.VIEW}` ||
          privilege === `${DashboardMenuEnum.NPS}_${MenuAccessEnum.EDIT}` ||
          privilege === `${DashboardMenuEnum.NPS}_${MenuAccessEnum.VIEW}` ||
          privilege === `${DashboardMenuEnum.RESP_AI}_${MenuAccessEnum.EDIT}` ||
          privilege === `${DashboardMenuEnum.RESP_AI}_${MenuAccessEnum.VIEW}`
      )
    );
  }

  isDisableMessageButton(): boolean {
    return (
      this.isLoading ||
      this.sendingEmail ||
      !this.selectedTemplateId ||
      this.getSelectedCustomersCount() === 0
    );
  }
  /** 11122020 - Gaurav - Add Email Template DrDw change - Ends */

  isShowMemberOrgDropDown(): boolean {
    /** Show Member Dropdown only if (for 'single' data-domain modes (e.g. customer, revenue, product)) -
     * 1. The holdingOrg currently selected in the header, which comes from (userInfo => filter => global => holdingOrgs) has memberOrgs listed under it
     * 2. The selected holding Org has Data Binding records, and
     * 3. Its Customer Data Binding is set to member org level
     * 4. Disable the Member Org Drop down if memberOrgs === 1
     */
    return (
      this._filterCustomerListBy === FilterBy.MEMBER_ORG &&
      this.selectedHoldingOrgData?.memberOrgs?.length > 0
    );
  }

  getSelectedCustomersCount(): number {
    return this.selection?.selected?.length;
  }

  async filterCustomerList(event?:any) {
    let filteredList: any[] = [];
    let queryArray!: any[];
    /** 11022021 - Abhishek - Set customer list dropdown filter */
    if(event) {
    /** Check that (filter => global => holdinOrgs => dataDomainConfig => customer => memberOrg === true) && provided (filter => global => holdinOrgs => memberOrgs[].length > 0) */
    if (this._filterCustomerListBy == FilterBy.MEMBER_ORG) {
      queryArray = [
        {
          memberOrg: this.selectedMemberOrg._id,
        },
      ];
    } else {
      queryArray = [{ holdingOrg: this.selectedHoldingOrgData._id }];
    }
    this._searchPayload = {
      ...this._searchPayload,
      query: {
        $or: <any[]>queryArray,
      },
    }
    this._setLoading(true);
    /** 11022021 - Abhishek - Get search filtered customer list  */
    this._loadingService
      .showProgressBarUntilCompleted(
        this._dashboardService.getCustomersListFromSearch(this._searchPayload)
      )
      .subscribe(
        async (customerList) => {
          this.totalRecords = customerList?.info?.totalCount;
          this._customerList = customerList?.results ?? [];
          await this.filterCustomerList();
          this._setLoading(false);
        },
        () => {
          this._setLoading(false);
        }
      );
    }

      filteredList = (await filteredList?.length)
      ? filteredList
      : this._customerList;
    this.dataSource = await new MatTableDataSource(filteredList ?? []);
    this.dataSource.sort = await this.sort;
    // this.dataSource.paginator = await this.paginator;
  }

  /** All methods for Material Table - Start */
  /** 05022021 - Abhishek - Set search parameter in payload to get filtered customer list  */
  applyFilter(filterText: string) {
    this._searchPayload = this._dashboardService.defaultPaylod;
    this.paginator['_pageIndex'] = 0;
    /** 05022021 - Abhishek - Set searched value  */
    this.searchText = filterText;
    // this.searchText = (event.target as HTMLInputElement).value;
    this._searchPayload = {
      ...this._searchPayload,
      options: {
        sort: this._searchPayload?.options?.sort,
        offset: this.paginator['_pageIndex'],
        limit: this.paginator['_pageSize'],
        globalSearch: {
          fieldNames: this.filterColumns,
          searchValue: this.searchText,
        },
      },
    };

    this._setLoading(true);
    /** 05022021 - Abhishek - Get search filtered customer list  */
    this._loadingService
      .showProgressBarUntilCompleted(
        this._dashboardService.getCustomersListFromSearch(this._searchPayload)
      )
      .subscribe(
        async (customerList) => {
          this.totalRecords = customerList?.info?.totalCount;
          this._customerList = customerList?.results ?? [];
          await this.filterCustomerList();
          this._setLoading(false);
        },
        () => {
          this._setLoading(false);
        }
      );
  }

  /** 05022021 - Abhishek - Set sort parameter in payload to get sorted customer list  */
  sortData(e: any) {
    /** 05022021 - Abhishek - set sorting order */
    let order = e.direction === 'asc' ? 1 : e.direction === 'desc' ? -1 : 0;
    let sortObj;
    order
      ? (sortObj = { [e.active]: order })
      : delete this._searchPayload?.options?.sort[e.active];
    this._searchPayload = this._dashboardService.defaultPaylod;
    /** 05022021 - Abhishek - set sort parameter payload */
    this._searchPayload = {
      ...this._searchPayload,
      options: {
        globalSearch: this._searchPayload?.options?.globalSearch,
        offset: this._searchPayload?.options?.offset,
        limit: this._searchPayload?.options?.limit,
        sort: { ...this._searchPayload?.options?.sort, ...sortObj },
      },
    };

    this._setLoading(true);
    /** 05022021 - Abhishek - Get sorted customer list */
    this._loadingService
      .showProgressBarUntilCompleted(
        this._dashboardService.getCustomersListFromSearch(this._searchPayload)
      )
      .subscribe(
        async (customerList) => {
          this.totalRecords = customerList?.info?.totalCount;
          this._customerList = customerList?.results ?? [];
          await this.filterCustomerList();
          this._setLoading(false);
        },
        () => {
          this._setLoading(false);
        }
      );
  }

  /** 05022021 - Abhishek - Set offset and limit parameter in payload to get customer list  */
  onPageChange(e: any) {
    this._setLoading(true);

    this._searchPayload = this._dashboardService.defaultPaylod;
    /** 05022021 - Abhishek - Set offset and limit parameter in payload  */
    this._searchPayload = {
      ...this._searchPayload,
      options: {
        globalSearch: this._searchPayload?.options?.globalSearch,
        sort: this._searchPayload?.options?.sort,
        offset: e.pageIndex ? e.pageSize * e.pageIndex : 0,
        limit: e.pageSize,
      },
    };
    /** 05022021 - Abhishek - Get filtered limited customer list  */
    this._loadingService
      .showProgressBarUntilCompleted(
        this._dashboardService.getCustomersListFromSearch(this._searchPayload)
      )
      .subscribe(
        async (customerList) => {
          this.totalRecords = customerList?.info?.totalCount;
          this._customerList = customerList?.results ?? [];
          await this.filterCustomerList();
          this._setLoading(false);
        },
        () => {
          this._setLoading(false);
        }
      );
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach((row) => this.selection.select(row));
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${
      row.position + 1
    }`;
  }

  onViewCustomerData(customerDetail: any) {
    this._router.navigate(['view/', customerDetail._id], {
      relativeTo: this._route,
    });
  }
  /** All methods for Material Table - Ends */
}

/** SAMPLE CUSTOMER LIST RECORD
 * addressLine1: "1000, VIRNAGAR SOCIETY, NEAR KIRAN PARK, NAVA VADAJ ROAD,"
addressLine2: ""
anniversaryDate: "1989-05-23T00:00:00.000Z"
birthdate: "1970-01-01T00:00:00.000Z"
cbsScore: null
cellPhone: "9821234567"
city: "AHMEDABAD"
corpId: ""
country: "India"
createdAt: "2020-11-27T09:37:01.374Z"
createdBy: "5f6d4556d935730012fe8ed2"
currency: null
custSegment: null
custSegmentDetails: null
customerCode: "005"
email: "00007357@test.com"
field_01: null
field_02: null
field_03: null
field_04: null
field_05: null
field_06: null
field_07: null
field_08: null
field_09: null
field_10: null
firstName: "Frank"
frequencyScore: null
fullName: null
gender: ""
holdingOrg: "5f8410772f7efd5a2c369825"
homePhone: "0281-1234567/1000"
indCorp: ""
lastName: "Kamp"
memberNo: null
memberOrg: null
memberType: "GOLD"
middleName: ""
modifiedBy: "5f6d4556d935730012fe8ed2"
monetaryScore: null
nationalId: ""
nationality: null
pastCustomer: ""
recencyScore: null
regDate: "2003-07-10T00:00:00.000Z"
state: ""
status: 1
title: null
totalServices: null
totalVisits: null
updatedAt: "2020-11-27T09:37:01.374Z"
zipCode: null
__v: 0
_id: "5fc0c8bd3532f100114cfaf5"
 */
