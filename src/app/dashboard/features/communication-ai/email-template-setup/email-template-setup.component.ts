/** 02/12/2020 - Ramesh - Init version: Created separate versions for Email template setup*/
/** 10122020 - Gaurav - Set isLoading on ngOnInit for local template use and to honour the template change to disable list filter input on loading
 * to avoid typing and subsequent error - TypeError: Cannot set property 'filter' of undefined
 * 08022021 - Gaurav - Added code for new progress-bar service */
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, Subscription, ObservableInput } from 'rxjs';
import { concatMap, map, switchMap, take, tap } from 'rxjs/operators';
import {
  DashboardService,
  HoldingOrg,
} from 'src/app/dashboard/dashboard.service';
import { DialogService } from 'src/app/dashboard/shared/components/dialog/dialog.service';
import {
  DialogConditionType,
  SystemDialogReturnType,
  SystemDialogType,
} from 'src/app/dashboard/shared/components/dialog/dialog.model';
import { SnackbarService } from 'src/app/shared/components/snackbar.service';
import { dashboardRouteLinks } from '../../../shared/components/menu/constants.routes';
import { CommunicationAIService } from '../communication-ai.service';
import { ClientSetupService } from '../../client-setup/client-setup.service';
import { consoleLog } from 'src/app/shared/util/common.util';
import { LoadingService } from 'src/app/shared/services/loading.service';
/** Created enum, instead of using boolean values, in case more than two filters condition are introduced */
enum FilterBy {
  HOLDING_ORG,
  MEMBER_ORG,
  BOTH_ORG,
}
@Component({
  selector: 'app-email-template-setup',
  templateUrl: './email-template-setup.component.html',
  styleUrls: ['../../../shared/styling/setup-table-list.shared.css'],
})
export class EmailTemplateSetupComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  private _observableSub$!: Subscription;
  private _templateListSub$!: Subscription;
  private _showEditComponents = false;
  private _searchString = '';
  private _filterTemplateListBy: FilterBy = FilterBy.HOLDING_ORG; // Default
  dataSource!: MatTableDataSource<any>;
  selectedHoldingOrgData!: HoldingOrg;
  templateList: any;
  selectedMemberOrg!: any;
  isLoading: boolean = false;
  bothOrgList: any;
  displayedColumns: string[] = [
    'code',
    'description',
    'subject',
    'status',
    'action_buttons',
  ];
  constructor(
    private _dashboardService: DashboardService,
    private _dialogService: DialogService,
    private _snackbarService: SnackbarService,
    private _communicationAIService: CommunicationAIService,
    private _clientSetupService: ClientSetupService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _loadingService: LoadingService
  ) {}

  ngOnInit() {
    this._setLoading(true);
    this._showEditComponents =
      this._route.snapshot.routeConfig?.path ===
      dashboardRouteLinks.COMMUNICATION_MANAGE_TEMPLATE.routerLink;

    const initEmailTemplateListObs: Observable<any> = this._dashboardService
      .getCurrentHoldingOrgListenerObs()
      .pipe(
        switchMap((selectedHoldingOrgData: HoldingOrg) => {
          let commBindingData;

          this.selectedHoldingOrgData = selectedHoldingOrgData;

          this.selectedHoldingOrgData = {
            ...this.selectedHoldingOrgData,
            memberOrgs: [],
          };
          this._searchString = `?holdingOrg=${selectedHoldingOrgData._id}`;
          if (
            this.selectedHoldingOrgData?.dataDomainConfig &&
            Object.keys(this.selectedHoldingOrgData?.dataDomainConfig)?.length >
              0 &&
            this.selectedHoldingOrgData?.dataDomainConfig?.hasOwnProperty(
              'communication'
            )
          ) {
            commBindingData = this.selectedHoldingOrgData?.dataDomainConfig?.[
              'communication'
            ];
          }
          if (
            commBindingData?.memberOrgLevel &&
            commBindingData?.holdingOrgLevel
          ) {
            this._filterTemplateListBy = FilterBy.BOTH_ORG;
          } else if (commBindingData?.holdingOrgLevel) {
            this._filterTemplateListBy = FilterBy.HOLDING_ORG;
          } else if (commBindingData?.memberOrgLevel) {
            this._filterTemplateListBy = FilterBy.MEMBER_ORG;
          }
          return this._clientSetupService.getOrgAccessInformation(
            this.selectedHoldingOrgData._id
          );
        }),
        switchMap((mOrgs): any => {
          if (mOrgs?.communication?.memberOrgs?.length > 0) {
            this.selectedHoldingOrgData = {
              ...this.selectedHoldingOrgData,
              memberOrgs: mOrgs?.communication?.memberOrgs.map(
                (member: any) => member
              ),
            };
            if (this._filterTemplateListBy == 2) {
              this.bothOrgList = [
                {
                  name: 'Holding Org',
                  value: [
                    {
                      name: this.selectedHoldingOrgData?.name,
                      _id: this.selectedHoldingOrgData?._id,
                    },
                  ],
                },
                {
                  name: 'Member Org',
                  value: this.selectedHoldingOrgData?.memberOrgs,
                },
              ];
              this.selectedMemberOrg = this.bothOrgList[0]?.value[0];
              this.isShowBothOrgDropDown();
            } else if (this.isShowMemberOrgDropDown()) {
              this._searchString = '?';
              this.selectedMemberOrg = this.selectedHoldingOrgData?.memberOrgs[0];
              this.selectedHoldingOrgData?.memberOrgs.forEach((memberOrg) => {
                this._searchString += `memberOrg=${memberOrg?._id}&`;
              });
              this._searchString = this._searchString.slice(0, -1);
            }
          }
          return this._communicationAIService.getTemplates();
        })
      );

    this._templateListSub$ = this._loadingService
      .showProgressBarUntilCompleted(initEmailTemplateListObs, 'query')
      .subscribe(
        async (templateList: any) => {
          this.templateList = templateList?.results ?? [];
          await this.filterTemplateList();
        },
        (error) => {
          this._setLoading(false);
        }
      );
  }

  ngOnDestroy() {
    this._templateListSub$.unsubscribe();
    let selValueType: any;
    if (this._filterTemplateListBy == 2) {
      if (this.selectedHoldingOrgData?._id == this.selectedMemberOrg?._id) {
        selValueType = 'Holding Org';
      } else {
        this.selectedHoldingOrgData?.memberOrgs?.filter((item: any) => {
          if (item?._id == this.selectedMemberOrg?._id) {
            selValueType = 'Member Org';
          }
        });
      }
    }
    let selOrgInfo = {
      selOrgInfo: this.selectedHoldingOrgData,
      selMemberOrg: this.selectedMemberOrg,
      orgType:
        this._filterTemplateListBy === 0
          ? 'Holding Org'
          : this._filterTemplateListBy === 1
          ? 'Member Org'
          : selValueType,
    };
    this._communicationAIService.setSelOrgData(selOrgInfo);
  }
  //Apply table filters
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  //Navigating to email-template.component.ts for add new template
  onAddNewTemplate() {
    this._router.navigate(['add'], { relativeTo: this._route });
  }
  //Add new template button hide/show function
  isShowEditComponents(): boolean {
    return this._showEditComponents;
  }
  //Navigating to email-template.component.ts for edit template
  onEditTemplate(id: string, type: string) {
    this._router.navigate([type, id], { relativeTo: this._route });
  }
  //Navigating to email-template.component.ts for view template
  onViewTemplate(id: string) {
    this._router.navigate(['view', id], { relativeTo: this._route });
  }
  //on selected template status change function
  onStatusChange(currentStatus: number, id: string, tempName: string) {
    this._dialogService
      .openSystemDialog({
        alertType: SystemDialogType.warning_alert_yes_no,
        dialogConditionType: DialogConditionType.prompt_custom_data,
        title: 'Status Email Templates',
        body: `Do you want to ${
          currentStatus === 0 ? 'activate' : 'inactivate'
        } this email template?`,
      })
      .then((response) => {
        /** Only process confirmation requests */
        if (response === SystemDialogReturnType.continue_yes) {
          this._setLoading(true);

          /** Update status in backend */
          const status = currentStatus === 0 ? 1 : 0;

          this._loadingService
            .showProgressBarUntilCompleted(
              this._communicationAIService.updateTemplate({ status }, id)
            )
            .subscribe(
              (result) => {
                /** Show snackbar to user */
                this._snackbarService.showSuccess(
                  `${tempName} is ${
                    status === 1 ? 'activated' : 'inactivated'
                  }!`
                );
                const index = this.templateList.findIndex(
                  (org: any) => org?._id === id
                );
                this.templateList[index].status = status;
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
  isShowBothOrgDropDown(): boolean {
    /*if we have both holding and member org dropdown format change*/
    return (
      this._filterTemplateListBy === FilterBy.BOTH_ORG &&
      this.selectedHoldingOrgData?.memberOrgs?.length > 0
    );
  }
  isShowMemberOrgDropDown(): boolean {
    /** Show Member Dropdown only if -
     * 1. The holdingOrg currently selected in the header, which comes from (userInfo => filter => global => holdingOrgs) has memberOrgs listed under it
     * 2. The selected holding Org has Data Binding records, and
     * 3. Its Customer Data Binding is set to member org level
     * 4. Disable the Member Org Drop down if memberOrgs === 1
     */
    return (
      this._filterTemplateListBy === FilterBy.MEMBER_ORG &&
      this.selectedHoldingOrgData?.memberOrgs?.length > 0
    );
  }

  async filterTemplateList() {
    let filteredList: any[] = [];
    if (this.templateList?.length > 0) {
      if (this.isShowMemberOrgDropDown()) {
        filteredList = this.templateList.filter((item: any) => {
          if (item.memberOrg === this.selectedMemberOrg._id) {
            return item;
          }
        });
      } else if (this.isShowBothOrgDropDown()) {
        filteredList = this.templateList.filter((listItem: any) => {
          if (listItem.holdingOrg === this.selectedMemberOrg._id) {
            return listItem;
          } else if (listItem.memberOrg === this.selectedMemberOrg._id) {
            return listItem;
          }
        });
      } else {
        filteredList = this.templateList.filter((listItem: any) => {
          if (listItem.holdingOrg === this.selectedHoldingOrgData._id) {
            return listItem;
          }
        });
      }
    }
    consoleLog({ valuesArr: ['change', filteredList] });
    this.dataSource = await new MatTableDataSource(filteredList ?? []);
    this.dataSource.paginator = await this.paginator;
    this.dataSource.sort = await this.sort;
    this._setLoading(false);
  }

  onDeleteTemplate(id: string, tempName: string): void {
    this._dialogService
      .openSystemDialog({
        alertType: SystemDialogType.warning_alert_yes_no,
        dialogConditionType: DialogConditionType.prompt_custom_data,
        title: 'Delete Email Template',
        body: `Do you want to delete '${tempName}' email template data?`,
      })
      .then((response) => {
        if (response === SystemDialogReturnType.continue_yes) {
          this._setLoading(true);

          this._loadingService
            .showProgressBarUntilCompleted(
              this._communicationAIService.deleteTemplate(id)
            )
            .subscribe(
              (result) => {
                this._snackbarService.showSuccess(`${tempName} is deleted!`);
                const index = this.templateList.findIndex(
                  (org: any) => org?._id === id
                );
                this.dataSource.data.splice(index, 1);
                /* 21122020 - Abhishek - remove splice fuction from template list */
                // this.templateList.splice(index, 1);
                this.dataSource._updateChangeSubscription();
                this._communicationAIService.getTemplates();
                this._setLoading(false);
              },
              (error) => {
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
}
