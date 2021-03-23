/** 23122020 - Abhishek - Init version
 * 08022021 - Gaurav - Added code for new progress-bar service
 */
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

/** Services */
import { DashboardService } from '../../../dashboard.service';
import { SystemAdminService } from '../system-admin.service';
import { LoadingService } from 'src/app/shared/services/loading.service';
import { consoleLog } from 'src/app/shared/util/common.util';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-messages-setup',
  templateUrl: './messages-setup.component.html',
  styleUrls: ['../../../shared/styling/setup-table-list.shared.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class MessagesSetupComponent implements OnInit, AfterViewInit {
  isLoading = false;
  _messageViewMode = false;
  isUserAdmin: boolean = false;
  _messagesList: any[] = [];
  filterColumns: any = {};
  messageEventList: any = '';
  expandedElement: any | null;
  totalRecords = 0;
  searchText: string = '';
  externalDataSource!: MatTableDataSource<any>;
  private _searchPayload: any = {};
  /** Cols chosen to be displayed on the table */
  displayedColumns: string[] = ['createdAt','channel', 'status','event','from','to','action_buttons'];
  globalFilterColumns: string[] = ['channel','status', 'provider.eventType','from','to'];
  externalDataColumns: string[] = ['eventId', 'timestamp', 'event', 'actions'];
  dataSource!: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('bodyframe', { static: false }) bodyframe!: ElementRef;
  constructor(
    private _dashboardService: DashboardService,
    private _systemAdminService: SystemAdminService,
    private _authService: AuthService,
    private _loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    this._setLoading(true);
    //to get login user info
    this._authService.getAuthStatusListener().subscribe(res => {
      this.isUserAdmin = res.userInfo.isAdmin;
    });
    //to set pagination payload
    this._dashboardService.defaultPaylod = {
      options: {
        offset: 0,
        limit: 10,
      },
      query: {}
    };
    // this._showEditComponents =
    //   this._route.snapshot.routeConfig?.path ===
    //   dashboardRouteLinks.USER_MANAGEMENT_MANAGE_ROLES.routerLink;

    this._getMessages();
  }
  ngAfterViewInit(){

  }
  private _getMessages(): void {
    this._searchPayload = {
      options: {
        ... this._searchPayload?.options,
            sort: {},
            offset: 0,
            limit: 10,
            globalSearch: {
              fieldNames: this.globalFilterColumns,
          searchValue: this.searchText,
            }
          },
      query: { }
     };
      this.getMessagesBySearch(this._searchPayload);
     }
     applyFilter(e: any){
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
      "query": { }
    };
    this.getMessagesBySearch(this._searchPayload);
  }
  //11022021 - ramesh - load message list by search
  getMessagesBySearch(data:object){
    this._loadingService
    .showProgressBarUntilCompleted(
      this._systemAdminService.getMessagesListBySearch(this._searchPayload),
      'query'
    )
    .subscribe(
      async (response) => {
        this.totalRecords = response?.info?.totalCount;
        this._messagesList = response?.results;
        this.dataSource = await new MatTableDataSource(this._messagesList);
        //this.dataSource.paginator = await this.paginator;
        this.dataSource.sort = await this.sort;
        this._setLoading(false);
      },
      (error) => {
        // shall be handled by Http Interceptor
        this._setLoading(false);
      }
    );

  }
  // to view message info
  onMessage(id: string) {
    this._messageViewMode = true;
    this._systemAdminService.getMessageViewData(id).subscribe(
      async (res) => {
        this.messageEventList = res;
        this.externalDataSource = await new MatTableDataSource(res?.externalData?.events ?? []);
        let y = (this.bodyframe.nativeElement.contentWindow || this.bodyframe.nativeElement.contentDocument);
        if (y.document)y = y.document;
        y.body.innerHTML = res?.body;
        setTimeout(() => {
          this.bodyframe.nativeElement.style.height =
            this.bodyframe.nativeElement.contentWindow.document.body
              .scrollHeight +
            12 +
            'px';
        }, 300);
      },
      (error) => {
        consoleLog(error);
      }
    );
  }

  /** 11022021 - Ramesh - Set sort parameter in payload to get sorted customer list  */
  sortData(e: any) {
    let order = e.direction === 'asc' ? 1 : e.direction === 'desc' ? -1 : 0;
    let sortObj;
    order
      ? (sortObj = { [e.active]: order })
      : delete this._searchPayload?.options?.sort[e.active];
      this.filterColumns = {
        ... this.filterColumns,
        [e.active]: order
      }
    this._searchPayload = this._dashboardService.defaultPaylod;
    this._searchPayload = {
      ...this._searchPayload,
      options: {
        globalSearch: this._searchPayload?.options?.globalSearch,
        offset: this._searchPayload?.options?.offset,
        limit: this._searchPayload?.options?.limit,
        //sort: { ...this._searchPayload?.options?.sort, ...sortObj }
        sort: this.filterColumns
      },
    };

    this._setLoading(true);
    this.getMessagesBySearch(this._searchPayload);
  }
  // back to message list function
  onCancel() {
    this._messageViewMode = false;
  }

  private _setLoading(value: boolean): void {
    this.isLoading = value;
    if (!value) this._loadingService.loadingOff();
  }
}
