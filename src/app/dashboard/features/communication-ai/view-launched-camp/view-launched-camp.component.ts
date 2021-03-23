import { Component, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import {
  dashboardRouteLinks,
  DataDomainConfig,
} from '../../../shared/components/menu/constants.routes';
import {
  DashboardService,
  HoldingOrg,
} from 'src/app/dashboard/dashboard.service';
import { LoadingService } from 'src/app/shared/services/loading.service';
import { ClientSetupService } from '../../client-setup/client-setup.service';
import { CommunicationAIService } from '../communication-ai.service';
import { OrgDrDwEmitStruct } from 'src/app/dashboard/shared/components/org-dropdownlist/org-dropdownlist.component';

enum FilterBy {
  HOLDING_ORG,
  MEMBER_ORG,
  BOTH_ORG,
}

@Component({
  selector: 'app-view-launched-camp',
  templateUrl: './view-launched-camp.component.html',
  styleUrls: ['../../../shared/styling/setup-table-list.shared.css'],
})
export class ViewLanchedCampComponent implements OnInit {
  currentFeature!: DataDomainConfig;
  selectedHoldingOrgData!: HoldingOrg;
  valuesFromOrgDrDw!: OrgDrDwEmitStruct;

  selModule: string = '';
  pageTitle: string = '';
  bothOrgList: any;
  selectedMemberOrg!: any;
  launcheCampViewMode: boolean = false;
  isLoading: boolean = false;

  private _orgAccessInformation!: any;
  private _observableSub$!: Subscription;
  private _filterCampaignListBy: FilterBy = FilterBy.HOLDING_ORG; // Default

  constructor(
    private _dashboardService: DashboardService,
    private _clientSetupService: ClientSetupService,
    private _communicationAIService: CommunicationAIService,
    private _loadingService: LoadingService,
    private _route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this._setLoading(true);
    this.selModule = this._route.snapshot.url[0]?.path;
    let propertyName: string = '';
    let commBindingData: any;

    switch (this.selModule) {
      case 'communicationAI':
        this.pageTitle = 'Campaigns';
        this.currentFeature = DataDomainConfig.communication;
        break;
      case 'responseAI':
        this.pageTitle = 'Survey Campaigns';
        this.currentFeature = DataDomainConfig.response;
        break;
      case 'nps':
        this.pageTitle = 'NPS Campaigns';
        this.currentFeature = DataDomainConfig.nps;
        break;
      default:
        break;
    }

    const initCampaignMasterListObs: Observable<any> = this._dashboardService
      .getCurrentHoldingOrgListenerObs()
      .pipe(
        switchMap((selectedHoldingOrgData: HoldingOrg) => {
          this.selectedHoldingOrgData = selectedHoldingOrgData;

          this.selectedHoldingOrgData = {
            ...this.selectedHoldingOrgData,
            memberOrgs: [],
          };
          let search = `?holdingOrg=${selectedHoldingOrgData._id}`;
          if (
            this.selectedHoldingOrgData?.dataDomainConfig &&
            Object.keys(this.selectedHoldingOrgData?.dataDomainConfig)?.length >
              0 &&
            this.selectedHoldingOrgData?.dataDomainConfig?.hasOwnProperty(
              this.currentFeature
            )
          ) {
            commBindingData = this.selectedHoldingOrgData?.dataDomainConfig?.[
              this.currentFeature
            ];
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
          if (mOrgs[this.currentFeature]?.memberOrgs?.length > 0) {
            this.selectedHoldingOrgData = {
              ...this.selectedHoldingOrgData,
              memberOrgs: mOrgs[this.currentFeature]?.memberOrgs.map(
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
              this.selectedMemberOrg = this.selectedHoldingOrgData?.memberOrgs[0];
              this.selectedHoldingOrgData?.memberOrgs.forEach((memberOrg) => {
              });
            }
          } else {
            this.selectedMemberOrg = this.selectedHoldingOrgData;
          }
        }),
      );
      this._observableSub$ = this._loadingService
      .showProgressBarUntilCompleted(initCampaignMasterListObs)
      .subscribe(
        async (selOrg: any) => {
        },
        (error) => {
          this._setLoading(false);
        }
      );

      this._observableSub$ = this._communicationAIService.getLauchedCampMode().subscribe(
        res => {
          this.launcheCampViewMode = res;
        }
      )
  }

  ngOnDestroy(){
    this._observableSub$.unsubscribe();
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

  get selectedHoldingOrgDatas(): any {
    return this.selectedHoldingOrgData;
  }
  get orgAccessInformation(): any {
    return this._orgAccessInformation;
  }
  async listenToDrDw($event: any): Promise<void> {
    this.valuesFromOrgDrDw = await $event;
    let selOrgInfo = {
      orgType: this.valuesFromOrgDrDw,
    };
    this._communicationAIService.setSelOrgDataObservable(selOrgInfo);
  }

  private _setLoading(value: boolean): void {
    this.isLoading = value;
    if (!value) this._loadingService.loadingOff();
  }

}
