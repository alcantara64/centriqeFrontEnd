/** 09/12/2020 - Ramesh - Init version: Created separate versions for Campaign master setup
 * 08022021 - Gaurav - Added code for new progress-bar service
 * 09022021 - Gaurav - Redirect user to a new window to view the consolidated campgaign Survey response
 * 22022021 - Gaurav - JIRA task: CA-163
 * 05032021 - Gaurav - JIRA-CA-154
 * 24032021 - Ramesh - JIRA CA-250: added app-config services
 */
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortable } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import {MatBottomSheet, MatBottomSheetRef} from '@angular/material/bottom-sheet';
import { Observable, Subscription } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import {
  DashboardService,
  HoldingOrg,
} from 'src/app/dashboard/dashboard.service';
import { DialogService } from 'src/app/dashboard/shared/components/dialog/dialog.service';
import {
  DialogConditionType,
  SystemDialogReturnType,
  BottomSheetDialogReturnType,
  SystemDialogType,
} from 'src/app/dashboard/shared/components/dialog/dialog.model';
import { SnackbarService } from 'src/app/shared/components/snackbar.service';
import {
  dashboardRouteLinks,
  DataDomainConfig,
} from '../../../shared/components/menu/constants.routes';
import { ClientSetupService } from '../../client-setup/client-setup.service';
import {
  CampaignSurveyResponseMode,
  CommunicationAIService,
} from '../communication-ai.service';
import { OrgDrDwEmitStruct } from 'src/app/dashboard/shared/components/org-dropdownlist/org-dropdownlist.component';
import { LoadingService } from 'src/app/shared/services/loading.service';
import {AppConfigService} from 'src/app/shared/services/app-config.service';
import { consoleLog } from 'src/app/shared/util/common.util';

/** Created enum, instead of using boolean values, in case more than two filters condition are introduced */
enum FilterBy {
  HOLDING_ORG,
  MEMBER_ORG,
  BOTH_ORG,
}
@Component({
  selector: 'app-campaign-master-setup',
  templateUrl: './campaign-master-setup.component.html',
  styleUrls: ['../../../shared/styling/setup-table-list.shared.css'],
})
export class CampaignMasterSetup implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  private _observableSub$!: Subscription;
  private _showEditComponents = false;
  private _searchString = '';
  private _custMemberOrgList: any = {};
  private _filterCampaignListBy: FilterBy = FilterBy.HOLDING_ORG; // Default
  readonly dataDomainList = DataDomainConfig;
  private _orgAccessInformation!: any;
  private _custCampDataConfig: any;
  currentFeature!: DataDomainConfig;
  dataSource!: MatTableDataSource<any>;
  selectedHoldingOrgData!: HoldingOrg;
  valuesFromOrgDrDw!: OrgDrDwEmitStruct;
  campaignMasterList: any;
  selectedMemberOrg!: any;
  isLoading: boolean = false;
  selModule: string = '';
  pageTitle: string = '';
  bothOrgList: any;
  displayedColumns: string[] = [
    'code',
    'description',
    'status',
    'updatedAt',
    'action_buttons',
  ];
  constructor(
    private _dashboardService: DashboardService,
    private _dialogService: DialogService,
    private _snackbarService: SnackbarService,
    private _communicationAIService: CommunicationAIService,
    private _clientSetupService: ClientSetupService,
    private _bottomSheet: MatBottomSheet,
    private _route: ActivatedRoute,
    private _router: Router,
    private _loadingService: LoadingService,
    public appConfigService: AppConfigService
  ) {}

   ngOnInit() {
     this._setLoading(true);
     let routerPath = this._route.snapshot.routeConfig?.path;

     switch (this._route.snapshot.routeConfig?.path) {
       case dashboardRouteLinks.COMMUNICATION_MANAGE_CAMPAIGN_MASTER.routerLink:
         this.currentFeature = DataDomainConfig.communication;
         break;
       /** 22022021 - Gaurav - Fixed to set the correct currentFeature for Response AI and NPS in VIEW mode */
       case dashboardRouteLinks.RESPONSE_MANAGE_FEEDBACK_CAMPAIGN.routerLink:
       case dashboardRouteLinks.RESPONSE_FEEDBACK_CAMPAIGN_VIEW.routerLink:
         this.currentFeature = DataDomainConfig.response;
         break;
       case dashboardRouteLinks.NPS_MANAGE_NPS_CAMPAIGN.routerLink:
       case dashboardRouteLinks.NPS_NPS_CAMPAIGN_VIEW.routerLink:
         this.currentFeature = DataDomainConfig.nps;
         break;
       default:
         this.currentFeature = DataDomainConfig.communication;
     }

     if (
       routerPath ===
         dashboardRouteLinks.COMMUNICATION_MANAGE_CAMPAIGN_MASTER.routerLink ||
       routerPath ===
         dashboardRouteLinks.RESPONSE_MANAGE_FEEDBACK_CAMPAIGN.routerLink ||
       routerPath === dashboardRouteLinks.NPS_MANAGE_NPS_CAMPAIGN.routerLink
     ) {
       this._showEditComponents = true;
     } else {
       this._showEditComponents = false;
     }

     this.selModule = this._route.snapshot.url[0]?.path;
     let propertyName: string = '';
     switch (this.selModule) {
       case 'communicationAI':
         this.pageTitle = 'Message Campaign Master';
         propertyName = DataDomainConfig.communication;
         break;
       case 'responseAI':
         this.pageTitle = 'Survey Campaign Master';
         propertyName = DataDomainConfig.response;
         break;
       case 'nps':
         this.pageTitle = 'NPS Campaign Master';
         propertyName = DataDomainConfig.nps;
         break;
       default:
         break;
     }
     let commBindingData: any;
     let customerDataConfig: any;
     const initCampaignMasterListObs: Observable<any> = this._dashboardService
       .getCurrentHoldingOrgListenerObs()
       .pipe(
         switchMap((selectedHoldingOrgData: HoldingOrg) => {
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
               propertyName
             )
           ) {
             commBindingData = this.selectedHoldingOrgData?.dataDomainConfig?.[
               propertyName
             ];
             customerDataConfig = this.selectedHoldingOrgData?.dataDomainConfig
               ?.customer;
           }
           if (
             commBindingData?.memberOrgLevel &&
             commBindingData?.holdingOrgLevel
           ) {
             this._filterCampaignListBy = FilterBy.BOTH_ORG;
           } else if (commBindingData?.holdingOrgLevel) {
             this._filterCampaignListBy = FilterBy.HOLDING_ORG;
           } else if (commBindingData?.memberOrgLevel) {
             this._filterCampaignListBy = FilterBy.MEMBER_ORG;
           }
           return this._clientSetupService.getOrgAccessInformation(
             this.selectedHoldingOrgData._id
           );
         }),
         tap((mOrgs) => {
           this._orgAccessInformation = mOrgs;
         }),
         switchMap((mOrgs): any => {
           this._custMemberOrgList = {};
           if (mOrgs?.customer?.memberOrgs?.length > 0) {
             this._custMemberOrgList = {
               memberOrg: mOrgs?.customer?.memberOrgs.map(
                 (member: any) => member
               ),
             };
           }
           if (mOrgs[propertyName]?.memberOrgs?.length > 0) {
             this.selectedHoldingOrgData = {
               ...this.selectedHoldingOrgData,
               memberOrgs: mOrgs[propertyName]?.memberOrgs.map(
                 (member: any) => member
               ),
             };
             if (this._filterCampaignListBy == 2) {
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
           } else {
             this.selectedMemberOrg = this.selectedHoldingOrgData;
           }
           this._custCampDataConfig = {
             campDataCofig: commBindingData,
             custDataConfig: customerDataConfig,
           };
           //let myData:any = this.manageOrgDrop();
           return this.selModule == 'communicationAI'
             ? this._communicationAIService.getCampaignList()
             : this.selModule == 'responseAI'
             ? this._communicationAIService.getRespCampaignList()
             : this._communicationAIService.getNPSCampaignList();
         })
       );

     this._observableSub$ = this._loadingService
       .showProgressBarUntilCompleted(initCampaignMasterListObs, 'query')
       .subscribe(
         async (campaignMasterList: any) => {
           this.campaignMasterList = campaignMasterList?.results ?? [];
           await this._filterQuestionsList();
         },
         (error) => {
           this._setLoading(false);
         }
       );
   }
   ngOnDestroy() {
     this._observableSub$.unsubscribe();
     let orgDropVisible: any = this.manageOrgDrop();
     let selValueType: any;
     if (this._filterCampaignListBy == 2) {
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
       orgType: this.valuesFromOrgDrDw,
       memOrgDrop: orgDropVisible,
     };
     this._communicationAIService.setSelOrgData(selOrgInfo);
   }

  manageOrgDrop(): any {
    let orgDropVisible: object = {};
    let campHolding = this._custCampDataConfig?.campDataCofig?.holdingOrgLevel;
    let campMember = this._custCampDataConfig?.campDataCofig?.memberOrgLevel;
    let custHolding = this._custCampDataConfig?.custDataConfig?.holdingOrgLevel;
    let custMember = this._custCampDataConfig?.custDataConfig?.memberOrgLevel;
    if (
      (campHolding && !campMember && custHolding && !custMember) ||
      (!campHolding && campMember && !custHolding && custMember) ||
      (!campHolding && campMember && custHolding && !custMember) ||
      (campHolding && campMember && custHolding && !custMember)
    ) {
      return (orgDropVisible = {
        visible: false,
        orgType: 'none',
        custDataDomain: this._custCampDataConfig?.custDataConfig,
        dropItems: 0,
      });
    } else if (
      (campHolding && !campMember && !custHolding && custMember) ||
      (campHolding && campMember && !custHolding && custMember)
    ) {
      return (orgDropVisible = {
        visible:
          this.valuesFromOrgDrDw?.compareByKeyForFilter == 'holdingOrg'
            ? true
            : false,
        orgType: 'Member Org',
        custDataDomain: this._custCampDataConfig?.custDataConfig,
        dropItems: this._custMemberOrgList?.memberOrg,
      });
    }
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
  onAddNewCampaign() {
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
  //on selected campaign status change function
  onStatusUpdate(status: number, id: string, campName: string){
    const messageOrResp: Observable<any> =
    this.selModule == 'communicationAI'
      ? this._communicationAIService.updateCampaign({ status }, id)
      : this.selModule == 'responseAI'
      ? this._communicationAIService.updateRespCampaign({ status }, id)
      : this._communicationAIService.updateNpspCampaign({ status }, id);

  this._loadingService
    .showProgressBarUntilCompleted(messageOrResp)
    .subscribe(
      (result) => {
        /** Show snackbar to user */
        this._snackbarService.showSuccess(
          `${campName} is ${
            status === 1 ? 'launched' : status === 2 ? 'draft' : 'terminated'
          }!`
        );
        const index = this.campaignMasterList.findIndex(
          (org: any) => org?._id === id
        );
        this.campaignMasterList[index].status = status;
        this._setLoading(false);
      },
      (error) => {
        /** Handled by Http Interceptor */
        this._setLoading(false);
      }
    );
  }

  isShowBothOrgDropDown(): boolean {
    /*if we have both holding and member org dropdown format change*/
    return (
      this._filterCampaignListBy === FilterBy.BOTH_ORG &&
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
      this._filterCampaignListBy === FilterBy.MEMBER_ORG &&
      this.selectedHoldingOrgData?.memberOrgs?.length > 0
    );
  }

   onDeleteTemplate(id: string, campName: string): void {
     this._dialogService
       .openSystemDialog({
         alertType: SystemDialogType.warning_alert_yes_no,
         dialogConditionType: DialogConditionType.prompt_custom_data,
         title: 'Delete Campaign Master',
         body: `Do you want to delete '${campName}' Campaign data?`,
       })
       .then((response) => {
         if (response === SystemDialogReturnType.continue_yes) {
           this._setLoading(true);

           this._loadingService
             .showProgressBarUntilCompleted(
               this._communicationAIService.deleteCampaign(id)
             )
             .subscribe(
               (result) => {
                 this._snackbarService.showSuccess(`${campName} is deleted!`);
                 const index = this.campaignMasterList.findIndex(
                   (org: any) => org?._id === id
                 );
                 this.dataSource.data.splice(index, 1);
                 /* 21122020 - Abhishek - remove splice fuction from template list */
                 // this.campaignMasterList.splice(index, 1);
                 this.dataSource._updateChangeSubscription();
                 this.selModule == 'communicationAI'
                   ? this._communicationAIService.getCampaignList()
                   : this.selModule == 'responseAI'
                   ? this._communicationAIService.getRespCampaignList()
                   : this._communicationAIService.getNPSCampaignList();
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
   get selectedHoldingOrgDatas(): any {
     return this.selectedHoldingOrgData;
   }
   get orgAccessInformation(): any {
     return this._orgAccessInformation;
   }

   async listenToDrDw($event: any): Promise<void> {
     this.valuesFromOrgDrDw = await $event;
     await this._filterQuestionsList();
   }

   async _filterQuestionsList(): Promise<void> {
     if (this.campaignMasterList?.length > 0) {
       let filteredList: any[] = [];
       filteredList = this.campaignMasterList.filter(
         (listItem: any) =>
           listItem[this.valuesFromOrgDrDw?.compareByKeyForFilter] ===
           this.valuesFromOrgDrDw?.selectedOrgInDrDw?._id
       );
       this.sort.sort(({ id: 'updatedAt', start: 'desc'}) as MatSortable);
       this.dataSource = await new MatTableDataSource(filteredList ?? []);
       this.dataSource.paginator = await this.paginator;
       this.dataSource.sort = await this.sort;
     }
     this._setLoading(false);
   }
   private _setLoading(value: boolean): void {
     this.isLoading = value;
     if (!value) this._loadingService.loadingOff();
   }

  /** 09022021 - Gaurav - Redirect user to a new window to view the consolidated campgaign Survey response
   *  05032021 - Gaurav - JIRA-CA-154: Refactored onViewCampaignSurveyResponse() per new API */
  onViewCampaignSurveyResponse(
    campaignId: string,
    name: string,
    code: string
  ): void {
    // consoleLog({ valuesArr: ['this.dataSource', this.dataSource.data] });
    this._dialogService
      .openDateRangeDialog({
        title: 'View Campaign Survey Response',
        subTitle: 'Please select from and to dates:',
      })
      .then((response) => {
        consoleLog({
          valuesArr: [
            'onViewCampaignSurveyResponse: from date range dialog',
            { response },
          ],
        });

        if (response) {
          this._router.navigate(['viewSurveyResponses', campaignId], {
            queryParams: {
              mode: CampaignSurveyResponseMode.campaign,
              name,
              code,
              startDate: response.startDate,
              endDate: response.endDate,
            },
            relativeTo: this._route,
          });
        }
      });
  }
  /** 22022021 - Gaurav - JIRA CA-163: Show View Survey Response from View mode ONLY */
  //11022021 - Ramesh - hiding view survey response btn from communication-ai page
  isShowSurveyResponse(): boolean {
    return (
      this.currentFeature !== DataDomainConfig.communication &&
      !this._showEditComponents
    );
  }

  onDuplicate(id: string, name: string): void {
    this._dialogService
      .openSystemDialog({
        alertType: SystemDialogType.warning_alert_yes_no,
        dialogConditionType: DialogConditionType.prompt_custom_data,
        title: `Duplicate ${
          this.currentFeature === DataDomainConfig.communication ? 'Communication' :
          this.currentFeature === DataDomainConfig.response ? 'Response' : 'NPS'
        } Campaign`,
        body: `Do you want to copy ${
          this.currentFeature === DataDomainConfig.communication ? 'communication' :
          this.currentFeature === DataDomainConfig.response ? 'response' : 'NPS'
        } campaign '${name}'?`,
      })
      .then((response) => {
        /** Only process confirmation requests */
        if (response === SystemDialogReturnType.continue_yes) {
          this._router.navigate(['copy', id], { relativeTo: this._route });
        }
      });
  }

  //open bottom sheet dialog for campaign status update
  openBottomSheet(id: string, name: string, status: number): void {
    //this._bottomSheet.open(BottomSheetDialog);
     this._dialogService
       .openBottomSheetDialog({
         status: status,
         title: `Change Status of '${name}'?`,
         accessMode: 'list'
       })
       .then((response) => {
         if(response === BottomSheetDialogReturnType.terminate_yes){
          this.onStatusUpdate(-1, id, name);
         }
       });
   }

}
