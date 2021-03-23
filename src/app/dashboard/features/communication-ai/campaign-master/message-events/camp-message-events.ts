/** 08022021 - Gaurav - Added code for new progress-bar service
 *  05032021 - Gaurav - JIRA-CA-154: View Survey Response icon button for campaign survey results and its processing */
 import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  QueryList,
  ViewChildren,
  ElementRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import {
  CampaignSurveyResponseMode,
  CommunicationAIService,
} from '../../communication-ai.service';
import { Observable, Subscription } from 'rxjs';
import { DashboardService } from 'src/app/dashboard/dashboard.service';
import {
  dashboardRouteLinks,
  DataDomainConfig,
} from '../../../../shared/components/menu/constants.routes';
import { LoadingService } from 'src/app/shared/services/loading.service';
import { SystemAdminService } from 'src/app/dashboard/features/system-admin/system-admin.service';
import { consoleLog } from 'src/app/shared/util/common.util';
import { AuthService } from 'src/app/auth/auth.service';
@Component({
  selector: 'camp-message-event',
  templateUrl: './camp-message-events.html',
  styleUrls: ['../../../../shared/styling/setup-table-list.shared.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class CampMessageEventComponent implements OnInit, OnDestroy {
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();
  @ViewChild('bodyframe', { static: false }) bodyframe!: ElementRef;
  expandedElement: any | null;
  isLoading = false;
  checked = false;
  timeLeft: number = 10;
  interval: any;
  totalMessagesRecords = 0;
  totalMessageEventsRecords = 0;
  private _searchMessagesPayload: any = {};
  public subscription$!: Subscription;
  dataSource!: MatTableDataSource<any>;
  messageSource!: MatTableDataSource<any>;
  messageEventSource!: MatTableDataSource<any>;
  externalDataSource!: MatTableDataSource<any>;
  externalDataList: Array<Object> = [];
  currentFeature!: DataDomainConfig;
  campMessageList: Array<Object> = [];
  messageSourceList: Array<Object> = [];
  private _searchMessageEventsPayload: any = {};
  campSource: string = '';
  displayedColumnsByFilter: string[] = [
    'status',
    'generated',
    'failed',
    'delivered',
    'opened',
  ];
  campDisplayedColumns: string[] = [
    'date',
    'campaign',
    'status',
    'generated',
    'failed',
    'softFailed',
    'delivered',
    'opened',
    'action_buttons',
  ];
  displayedColumns: string[] = [
    'date',
    'status',
    'generated',
    'failed',
    'softFailed',
    'delivered',
    'opened',
    'action_buttons',
  ];
  messagesColumnsByFilter: string[] = ['status', 'channel', 'from', 'to'];
  messageColumns: string[] = [
    'createdAt',
    'status',
    'channel',
    'from',
    'to',
    'action_buttons',
  ];
  externalDataColumns: string[] = ['eventId', 'timestamp', 'event', 'Actions'];
  private _id!: string;
  private _messageEventId!: string;
  messageEventList: any = '';
  routerModule: string = '';
  timeZone: any = '';
  emailText = '';
  eventMode: string = 'eventMode';
  messageViewMode: boolean = false;
  viewLaunchedPage: boolean = false;
  isUserAdmin: boolean = false;
  messageViewData: any = [];
  routerPath!: string;

  constructor(
    private _communicationAIService: CommunicationAIService,
    private _route: ActivatedRoute,
    private _dashboardService: DashboardService,
    private _systemAdminService: SystemAdminService,
    private _authService: AuthService,
    private _loadingService: LoadingService,
    private _router: Router
  ) {}
  ngOnInit() {
    //to get login user info
    this._authService.getAuthStatusListener().subscribe((res) => {
      this.isUserAdmin = res.userInfo.isAdmin;
    });
    //to set pagination payload
    this._dashboardService.defaultPaylod = {
      options: {
        offset: 0,
        limit: 10,
        sort: {},
        globalSearch: {},
      },
      query: {},
    };
    this._searchMessageEventsPayload = this._dashboardService.defaultPaylod;
    this._searchMessagesPayload = this._dashboardService.defaultPaylod;
    this.routerModule = this._route.snapshot.url[0]?.path;
    this.routerPath = this._route.snapshot.routeConfig?.path ?? '';

    //get campaign source page
    switch (this.routerModule) {
      case 'communicationAI':
        this.campSource = 'commCampaigns';
        this.currentFeature = DataDomainConfig.communication;
        break;
      case 'responseAI':
        this.campSource = 'respCampaigns';
        this.currentFeature = DataDomainConfig.response;
        break;
      case 'nps':
        this.campSource = 'npsCampaigns';
        this.currentFeature = DataDomainConfig.nps;
        break;

      default:
        this.campSource = '';
    }

    this.messageViewData = this._communicationAIService.getSelOrgData();
    if (this.messageViewData?.from == 'messageEvents') {
      this.onViewCammpMessage(this.messageViewData?.messageData);
         this.messageViewMode = true;
    }else{
      let routerPath = this._route.snapshot.routeConfig?.path;
      if(routerPath == dashboardRouteLinks.COMMUNICATION_LAUNCHED_CAMPAIGNS_VIEW.routerLink ||
        routerPath == dashboardRouteLinks.RESPONSE_PAST_CAMPAIGNS_VIEW.routerLink ||
        routerPath == dashboardRouteLinks.NPS_PAST_CAMPAIGNS_VIEW.routerLink){
          this.viewLaunchedPage = true;
      }else {
        this._id = this._route.snapshot.params?.id;
      }
      //Search function calling from global
      this.subscription$ = this._communicationAIService
      .getReceivedTimeZone()
      .subscribe((res) => {
    //Getting user time zone
    this.timeZone = res;
    if (!this.messageViewMode) {
      this.getCampMessageEvents();
    }
    });
    }
    this.displayedColumns = this.viewLaunchedPage ? this.campDisplayedColumns : this.displayedColumns;
   this.subscription$ = this._communicationAIService.getSelOrgDataObservable().subscribe(
        res=>{
          if(this.viewLaunchedPage){
            this.messageViewData = res;
            let orgType = this.messageViewData?.orgType?.selectedOrgInDrDw?.holOrMol;

            this._searchMessageEventsPayload = {
              ... this._searchMessageEventsPayload,
              query: {
                "$or":[
                  {[orgType]: this.messageViewData?.orgType?.selectedOrgInDrDw?._id}
                ]
              }
            }
            this.getCampMessageEvents();
          }
        }
      )

      //set timer for to get message events
        this.setTimer();
  }

  ngOnDestroy() {
    this.subscription$.unsubscribe();
    this.pauseTimer();
  }

  /** 05032021 - Gaurav - JIRA-CA-154 */
  get showViewSurveyResponseButton(): boolean {
    let conditions: string[] = [
      dashboardRouteLinks.RESPONSE_PAST_CAMPAIGNS_VIEW.routerLink,
      dashboardRouteLinks.NPS_PAST_CAMPAIGNS_VIEW.routerLink,
    ];

    return conditions.some(
      (condition: string) => condition === this.routerPath
    );
  }

  onViewCampaignSurveyResponse(messageEventId: string, code: string): void {
    this._router.navigate(['viewSurveyResponses', messageEventId], {
      queryParams: {
        mode: CampaignSurveyResponseMode.messageEvent,
        name: 'Message Event Campaign',
        code,
      },
      relativeTo: this._route,
    });
  }
  /** 05032021 - Gaurav - JIRA-CA-154 - Ends */

  //get message events list by its source page
  getCampMessageEvents() {
    if (this.messageViewData?.from == 'messageEvents') {
      return;
    }
    this._setLoading(true);
    //to get message event list by its source path to sending 'comm/resp/nps', 'campaignId', 'searchPayload'
    const messageEvents: Observable<any> = this._systemAdminService.getCampaignMessageEvents(
      this.campSource,
      this._id,
      this._searchMessageEventsPayload
    );

    this._loadingService
      .showProgressBarUntilCompleted(messageEvents, 'query')
      .subscribe(async (res: any) => {
        let eventsList: Array<Object> = this.viewLaunchedPage
          ? res?.results
          : [];
        if (!this.viewLaunchedPage) {
          await res?.results?.forEach((item: any, index: any) => {
            eventsList.push(
              (item = {
                ...item,
                date: this._communicationAIService.handleDateTimeZoneReceive(
                  item?.date,
                  this.timeZone
                ),
              })
            );
          });
          eventsList.reverse();
        }
        this.campMessageList = eventsList;
        this.dataSource = await new MatTableDataSource(
          this.campMessageList ?? []
        );
        this.totalMessageEventsRecords = await res?.info?.totalCount;
        //this.dataSource.paginator = await this.paginator.toArray()[0];
        this.dataSource.sort = await this.sort.toArray()[0];
        this._setLoading(false);
        this.timeLeft = 10;
      });
  }
  //On view by message events list
  onViewCammpMessage(campMessageId: any) {
    this.pauseTimer();
    this._setLoading(true);
    this._messageEventId = campMessageId?._id;
    this.messageEventList = '';
    this.getMessagesByEvent(this._searchMessagesPayload);
  }
  getMessagesByEvent(searchPayload: object) {
    //to get messages list by its source path to sending 'comm/resp/nps', 'campaignId', 'messageEventId', 'searchPayload'
    const messageList: Observable<any> = this._systemAdminService.getMessagesByMessageEvents(
      this.campSource,
      this._id,
      this._messageEventId,
      searchPayload
    );
    this._loadingService
      .showProgressBarUntilCompleted(messageList, 'query')
      .subscribe(async (res: any) => {
        this.eventMode = 'messageMode';
        this.messageSourceList = res?.results;
        this.totalMessagesRecords = res?.info?.totalCount;
        this.messageSource = await new MatTableDataSource(res?.results ?? []);
        this.messageSource.sort = await this.sort.toArray()[1];
        this._communicationAIService.setLauchedCampMode(true);
        this._setLoading(false);
        this.timeLeft = 10;
      });
  }

  //On search filter by message events/messages list
  applyFilter(e: any) {
    //filter by messages list
    if (this.eventMode == 'messageMode') {
      this._searchMessagesPayload = {
        ...this._searchMessagesPayload,
        options: {
          ...this._searchMessagesPayload?.options,
          globalSearch: {
            fieldNames: this.messagesColumnsByFilter,
            searchValue: e.target.value,
          },
        },
      };
      this.getMessagesByEvent(this._searchMessagesPayload);
    } else {
      //filter by message event list
      this._searchMessageEventsPayload = {
        ...this._searchMessageEventsPayload,
        options: {
          ...this._searchMessageEventsPayload?.options,
          globalSearch: {
            fieldNames: this.displayedColumnsByFilter,
            searchValue: e.target.value,
          },
        },
      };
      this.getCampMessageEvents();
    }
  }

  backToTable() {
    this.setTimer();
    this.eventMode = 'eventMode';
    this.messageEventList = '';
    this._communicationAIService.setLauchedCampMode(false);
  }

  closeMessageInfo() {
    this.messageEventList = '';
    this.eventMode = 'messageMode';
  }
  onViewMessageEvent(messageId: string) {
    this._setLoading(true);
    const messageEvents: Observable<any> = this._systemAdminService.getMessagesInfoByMesEvents(
      this.campSource,
      this._id,
      this._messageEventId,
      messageId
    );
    this._loadingService
      .showProgressBarUntilCompleted(messageEvents, 'query')
      .subscribe(async (res: any) => {
        let messageDat: Array<Object> = [];
        this.eventMode = 'messageInfoMode';
        this.messageEventList = res;
        messageDat.push(res);
        this.emailText = res?.body;
        let y =
          this.bodyframe.nativeElement.contentWindow ||
          this.bodyframe.nativeElement.contentDocument;
        if (y.document) y = y.document;
        y.body.innerHTML = res?.body;
        setTimeout(() => {
          this.bodyframe.nativeElement.style.height =
            this.bodyframe.nativeElement.contentWindow.document.body
              .scrollHeight +
            12 +
            'px';
        }, 500);
        this.messageEventSource = await new MatTableDataSource(
          messageDat ?? []
        );

        this.externalDataList = res?.externalData?.events ?? [];
        this.externalDataSource = await new MatTableDataSource(
          res?.externalData?.events ?? []
        );
        this._setLoading(false);
      });
  }
  onMessagePageChange(e: any) {
    this._setLoading(true);
    if (this.eventMode == 'messageMode') {
      this._searchMessagesPayload = this._dashboardService.defaultPaylod;
      this._searchMessagesPayload = {
        ...this._searchMessagesPayload,
        options: {
          globalSearch: this._searchMessagesPayload?.options?.globalSearch,
          sort: this._searchMessagesPayload?.options?.sort,
          offset: e.pageIndex ? e.pageSize * e.pageIndex : 0,
          limit: e.pageSize,
        },
        query: {},
      };
      this.getMessagesByEvent(this._searchMessagesPayload);
    } else {
      //filter by message event list
      this._searchMessageEventsPayload = this._dashboardService.defaultPaylod;
      this._searchMessageEventsPayload = {
        ...this._searchMessageEventsPayload,
        options: {
          globalSearch: this._searchMessageEventsPayload?.options?.globalSearch,
          sort: this._searchMessageEventsPayload?.options?.sort,
          offset: e.pageIndex ? e.pageSize * e.pageIndex : 0,
          limit: e.pageSize,
        },
        query: {},
      };
      this.getCampMessageEvents();
    }
  }
  sortMessageData(e: any) {
    let order = e.direction === 'asc' ? 1 : e.direction === 'desc' ? -1 : 0;
    let sortObj;
    order
      ? (sortObj = { [e.active]: order })
      : delete this._searchMessagesPayload?.options?.sort[e.active];
    this._searchMessagesPayload = this._dashboardService.defaultPaylod;
    this._searchMessagesPayload = {
      ...this._searchMessagesPayload,
      options: {
        globalSearch: this._searchMessagesPayload?.options?.globalSearch,
        offset: this._searchMessagesPayload?.options?.offset,
        limit: this._searchMessagesPayload?.options?.limit,
        sort: { ...this._searchMessagesPayload?.options?.sort, ...sortObj },
      },
    };

    this._setLoading(true);
    this.getMessagesByEvent(this._searchMessagesPayload);
  }
  private _setLoading(value: boolean): void {
    this.isLoading = value;
    if (!value) this._loadingService.loadingOff();
  }

  //start timer to call get message event list
  startTimer() {
    if(!this.checked){
      this.timeLeft = 10;
    }
  }
  //set the timer
  setTimer(){
    this.interval = setInterval(() => {
      if(this.timeLeft > 0 && this.eventMode == 'eventMode' && this.checked) {
        this.timeLeft--;
      } else {
        if(this.checked && this.eventMode == 'eventMode'){
          this.getCampMessageEvents();
        }
      }
    },1000)
  }
  //pause timer to call get message event list
  pauseTimer() {
    clearInterval(this.interval);
  }
}
