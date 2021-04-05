/** 26112020 - Gaurav - Init version
 * 28112020 - Updated CSS path file to shared one
 * 10122020 - Gaurav - Fix to show 'Name (Code)', removed 'Code' column from display and introduced 'City', 'Country' columns
 * 08022021 - Gaurav - Added code for new progress-bar service
 * 31032021 - Gaurav - JIRA-CA-310: Componentize setup-list action buttons
 */
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { dashboardRouteLinks } from 'src/app/dashboard/shared/components/menu/constants.routes';

/** Services */
import {
  DashboardService,
  HoldingOrg,
} from 'src/app/dashboard/dashboard.service';
import { ClientSetupService } from '../client-setup.service';
import { SnackbarService } from 'src/app/shared/components/snackbar.service';
import { DialogService } from 'src/app/dashboard/shared/components/dialog/dialog.service';
import {
  DialogConditionType,
  SystemDialogReturnType,
  SystemDialogType,
} from 'src/app/dashboard/shared/components/dialog/dialog.model';
import { LoadingService } from 'src/app/shared/services/loading.service';
import { AppConfigService } from 'src/app/shared/services/app-config.service';
import {
  AppButtonTypes,
  ButtonRowClickedParams,
} from 'src/app/dashboard/shared/components/buttons/buttons.model';

@Component({
  selector: 'app-member-org-setup',
  templateUrl: './member-org-setup.component.html',
})
export class MemberOrgSetupComponent implements OnInit, OnDestroy {
  readonly appButtonType = AppButtonTypes;
  isLoading = false;
  private _memberOrgListSub$!: Subscription;
  selectedHoldingOrgId = '';
  private _showEditComponents = false;
  private _memberOrgs: any[] = [];

  /** Cols chosen to be displayed on the table */
  displayedColumns: string[] = [
    'name',
    'city',
    'country',
    'status',
    'action_buttons',
  ];
  dataSource!: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private _dashboardService: DashboardService,
    private _clientSetupService: ClientSetupService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _snackbarService: SnackbarService,
    private _dialogService: DialogService,
    public appConfigService: AppConfigService,
    private _loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    this._setLoading(true);

    this._showEditComponents =
      this._route.snapshot.routeConfig?.path ===
      dashboardRouteLinks.CLIENT_SETUP_MANAGE_MEMBERORG.routerLink;

    this._loadMemberOrgs();
  }

  ngOnDestroy(): void {
    this._memberOrgListSub$.unsubscribe();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
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
        return this.onEditOrg(args._id);
      case AppButtonTypes.status:
        return this.onStatusChange(args?.status!, args._id, args?.name!);
      case AppButtonTypes.view:
        return this.onViewOrg(args._id);
      case AppButtonTypes.delete:
        return this.onDeleteOrg(args._id, args?.name!);
    }
  }

  onAddMemberOrg(): void {
    this._router.navigate(['add'], { relativeTo: this._route });
  }

  onEditOrg(id: string): void {
    this._router.navigate(['edit', id], {
      relativeTo: this._route,
    });
  }

  onViewOrg(id: string): void {
    this._router.navigate(['view', id], { relativeTo: this._route });
  }

  onDeleteOrg(id: string, orgName: string): void {
    this._dialogService
      .openSystemDialog({
        alertType: SystemDialogType.warning_alert_yes_no,
        dialogConditionType: DialogConditionType.prompt_custom_data,
        title: 'Delete Member Organization',
        body: `Do you want to delete '${orgName}' organization data?`,
      })
      .then((response) => {
        /** Only process confirmation requests */
        if (response === SystemDialogReturnType.continue_yes) {
          this._setLoading(true);

          this._loadingService
            .showProgressBarUntilCompleted(
              this._clientSetupService.deleteMemberOrg(id)
            )
            .subscribe(
              (result) => {
                /** Show snackbar to user */
                this._snackbarService.showSuccess(`${orgName} is deleted!`);

                /** 26112020 - Gaurav - Note: Instead of fetching all the member orgs again,
                 * just locally delete the record. */
                const index = this._memberOrgs.findIndex(
                  (org) => org._id === id
                );
                this.dataSource.data.splice(index, 1);
                /* 21122020 - Abhishek - remove splice fuction from template list */
                // this._memberOrgs.splice(index, 1);
                this.dataSource._updateChangeSubscription();
                this._setLoading(false);
              },
              (error) => {
                /** Handled by Http Interceptor */
                this._setLoading(false);
              }
            );
        }
      })
      .catch((error) => {
        // DEV team => Pass VALID parameters to this service method
      });
  }

  onStatusChange(currentStatus: number, id: string, orgName: string): void {
    this._dialogService
      .openSystemDialog({
        alertType: SystemDialogType.warning_alert_yes_no,
        dialogConditionType: DialogConditionType.prompt_custom_data,
        title: 'Status Member Organization',
        body: `Do you want to ${
          currentStatus === 0 ? 'activate' : 'inactivate'
        } this organization?`,
      })
      .then((response) => {
        /** Only process confirmation requests */
        if (response === SystemDialogReturnType.continue_yes) {
          this._setLoading(true);

          /** Update status in backend */
          const status = currentStatus === 0 ? 1 : 0;

          this._loadingService
            .showProgressBarUntilCompleted(
              this._clientSetupService.updateMemberOrg(id, {
                status,
              })
            )
            .subscribe(
              (result) => {
                /** Show snackbar to user */
                this._snackbarService.showSuccess(
                  `${orgName} is ${status === 1 ? 'activated' : 'inactivated'}!`
                );

                /** 26112020 - Gaurav - Note: Instead of fetching all the member orgs again,
                 * just locally update the status of the successfully updated backend record. */
                const index = this._memberOrgs.findIndex(
                  (org) => org._id === id
                );
                this._memberOrgs[index].status = status;
                this._setLoading(false);
              },
              (error) => {
                /** Handled by Http Interceptor */
                this._setLoading(false);
              }
            );
        }
      })
      .catch((error) => {
        // DEV team => Pass VALID parameters to this service method
      });
  }

  private _setLoading(value: boolean): void {
    this.isLoading = value;
    if (!value) this._loadingService.loadingOff();
  }

  private _loadMemberOrgs(): void {
    const memberOrgsListObs: Observable<any> = this._dashboardService
      .getCurrentHoldingOrgListenerObs()
      .pipe(
        map((_id) => {
          return _id;
        }),
        switchMap((selectedHoldingOrgData: HoldingOrg) => {
          this.selectedHoldingOrgId = selectedHoldingOrgData._id;
          return this._clientSetupService.getMemberOrgList(
            this.selectedHoldingOrgId
          );
        })
      );

    this._memberOrgListSub$ = this._loadingService
      .showProgressBarUntilCompleted(memberOrgsListObs, 'query')
      .subscribe(
        async (response) => {
          // console.log(response);
          this._memberOrgs = response;
          this.dataSource = await new MatTableDataSource(this._memberOrgs);
          this.dataSource.paginator = await this.paginator;
          this.dataSource.sort = await this.sort;
          this._setLoading(false);
        },
        (error) => {
          // shall be handled by Http Interceptor
          this._setLoading(false);
        }
      );
  }
}

/**
 * addressLine1: "no 35 sholake lagos"
addressLine2: ""
askBuddy: 0
city: "lagos"
code: "MO001"
communicationAI: 0
country: "Nigeria"
createdAt: "2020-11-26T11:29:12.787Z"
createdBy: "5f6d4556d935730012fe8ed2"
daynamicFields: []
email: "emmanuelagahiu@gmail.com"
fax: ""
holdingOrg: {_id: "5fbe32ef4820320011e174a3", name: "Taj Group", code: "ORG001"}
marketPlAI: 0
modifiedBy: "5f6d4556d935730012fe8ed2"
name: "Member Org"
phone: "08140103867"
profitEdge: 0
responseAI: 0
state: "lagos"
status: 1
tollFreeNumber: ""
updatedAt: "2020-11-26T11:29:12.787Z"
websiteAddress: "www.mragahiu.com.ng"
zipCode: "345667"
__v: 0
_id: "5fbf91884079a1
 */
