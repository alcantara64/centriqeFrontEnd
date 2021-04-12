/** 23122020 - Abhishek - Init version
 * 08022021 - Gaurav - Added code for new progress-bar service
 */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

/** Services */
import { DashboardService } from '../../../dashboard.service';
import { SystemAdminService } from '../system-admin.service';
import { CommunicationAIService } from '../../communication-ai/communication-ai.service';
import { LoadingService } from 'src/app/shared/services/loading.service';
import { DataDomainConfig } from 'src/app/dashboard/shared/components/menu/constants.routes';
import { AppConfigService } from 'src/app/shared/services/app-config.service';

@Component({
  selector: 'app-message-events-setup',
  templateUrl: './message-events-setup.component.html',
})
export class MessageEventsSetupComponent implements OnInit {
  isLoading = false;
  _messageEventssList: any[] = [];
  filterColumns: any = {};
  totalRecords = 0;
  selectedIndex = 0;
  searchText: string = '';
  currentFeature!: DataDomainConfig;
  private _searchPayload: any = {};
  /** Cols chosen to be displayed on the table */
  displayedColumns: string[] = [
    'eventDate',
    'eventType',
    'status',
    'processStart',
    'processEnd',
    'generated',
    'action_buttons',
  ];
  dataSource!: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  messageEventViewMode: string = '';
  messageEventData: any = [];
  constructor(
    private _dashboardService: DashboardService,
    private _systemAdminService: SystemAdminService,
    private _communicationAIService: CommunicationAIService,
    public appConfigService: AppConfigService,
    private _loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    this._setLoading(true);
    this._dashboardService.defaultPaylod = {
      options: {
        sort: {
          date: -1,
        },
        offset: 0,
        limit: this.appConfigService.systemMatTableProperties
          .pageSizeOptions[2],
        globalSearch: {
          fieldNames: this.displayedColumns,
          searchValue: this.searchText,
        },
      },
      query: {},
    };
    this._getMessages();
  }
  ngOnDestroy() {}

  private _getMessages(): void {
    //default paginator set
    this._searchPayload = this._dashboardService.defaultPaylod;
    this.getMessageEventsBySearch(this._searchPayload);
  }
  applyFilter(e: any) {
    this._dashboardService.defaultPaylod = {
      ...this._dashboardService.defaultPaylod,
      options : {
        ...this._dashboardService.defaultPaylod.options,
        globalSearch : {
          ...this._dashboardService.defaultPaylod.options.globalSearch,
          searchValue: e.target.value
        }
      }
    }
    this.searchText = e.target.value;
    this._getMessages();
  }
  //11022021 - Ramesh - on paginator change load data
  onPageChange(e: any) {
    this._setLoading(true);
    this._searchPayload = this._dashboardService.defaultPaylod;
    this._searchPayload = {
      ...this._searchPayload,
      options: {
        globalSearch: this._searchPayload?.options?.globalSearch,
        sort: this._searchPayload?.options?.sort,
        offset: e.pageIndex ? e.pageSize * e.pageIndex : 0,
        limit: e.pageSize,
      },
      query: {},
    };
    this.getMessageEventsBySearch(this._searchPayload);
  }

  /** 11022021 - Ramesh - Set sort parameter in payload to get sorted customer list  */
  sortData(e: any) {
    let order = e.direction === 'asc' ? 1 : e.direction === 'desc' ? -1 : 0;
    let sortObj;
    order
      ? (sortObj = { [e.active]: order })
      : delete this._searchPayload?.options?.sort[e.active];
    this.filterColumns = {
      ...this.filterColumns,
      date: e.active == 'eventDate' ? order : -1,
      [e.active]: order,
    };
    this._searchPayload = {
      ...this._searchPayload,
      options: {
        globalSearch: this._searchPayload?.options?.globalSearch,
        offset: this._searchPayload?.options?.offset,
        limit: this._searchPayload?.options?.limit,
        sort: this.filterColumns,
      },
    };
    this._dashboardService.defaultPaylod = this._searchPayload;
    this._setLoading(true);
    this.getMessageEventsBySearch(this._searchPayload);
  }

  getMessageEventsBySearch(data: object) {
    this._loadingService
      .showProgressBarUntilCompleted(
        this._systemAdminService.getMessageEventsListBySearch(data),
        'query'
      )
      .subscribe(
        async (response) => {
          this._messageEventssList = response?.results;
          this.totalRecords = response?.info?.totalCount;
          this.dataSource = await new MatTableDataSource(
            this._messageEventssList
          );
          this.dataSource.sort = await this.sort;
          this._setLoading(false);
        },
        (error) => {
          // shall be handled by Http Interceptor
          this._setLoading(false);
        }
      );
  }
  onViewMessageEvent(id: string) {
    //6024056ae2ab7739f865e54e
    this._systemAdminService.getMessageEventsView(id).subscribe((res) => {
      this.messageEventViewMode = res?.eventType;
      this.messageEventData = res;
      let orgVal: any =
        this.messageEventData?.eventType == 'interactiveTemplate'
          ? this.messageEventData?.template
          : this.messageEventData?.eventType == 'interactiveSurvey'
          ? this.messageEventData?.surveyVersion
          : this.messageEventData;
      orgVal = {
        ...orgVal,
        lableName: orgVal?.memberOrg == null ? 'Holding' : 'Member',
        value:
          orgVal?.memberOrg == null
            ? orgVal?.holdingOrg?.name + ' (' + orgVal?.holdingOrg?.code + ') '
            : orgVal?.memberOrg?.name + ' (' + orgVal?.memberOrg?.code + ') ',
      };
      this.messageEventData = {
        ...this.messageEventData,
        orgValue: orgVal,
      };
      let selOrgInfo = {
        // selOrgInfo: {
        //   _id: res?.holdingOrg?._id,
        // },
        // selMemberOrg: res?.memberOrg,
        // orgType: 'Holding Org',
        //eventType: 'campaign',
        from: 'messageEvents',
        messageData: res,
      };
      this._communicationAIService.setSelOrgData(selOrgInfo);
    });
  }
  onCancel() {
    this.messageEventData = [];
    this.messageEventViewMode = '';
  }

  private _setLoading(value: boolean): void {
    this.isLoading = value;
    if (!value) this._loadingService.loadingOff();
  }
}
