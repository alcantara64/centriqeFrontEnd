/**
 * 10/12/2020 - Ramesh - Init version: Created separate versions for Campaign master
 * 08022021 - Abhishek - Added getSubtitle() to set subtitle and import generateNameAndCodeString for sub title.
 * 08022021 - Gaurav - Added code for new progress-bar service
 * 15032021 - Gaurav - Use enum AccessModes from constants file instead of local one
 */
import {
  FormArray,
  FormControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, Subscription } from 'rxjs';
import { map, startWith, take } from 'rxjs/operators';
import {
  AccessModes,
  dashboardRouteLinks,
  DataDomainConfig,
} from '../../../shared/components/menu/constants.routes';
import { CampaignType, CommunicationAIService } from '../communication-ai.service';
import { ResponseAIService } from '../../response-ai/response-ai.service';
import { DialogService } from 'src/app/dashboard/shared/components/dialog/dialog.service';
import { SnackbarService } from 'src/app/shared/components/snackbar.service';
import {
  DialogConditionType,
  SystemDialogReturnType,
  BottomSheetDialogReturnType,
  SystemDialogType,
} from 'src/app/dashboard/shared/components/dialog/dialog.model';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { TIMEZONELIST } from '../../../shared/components/timeZone-list/timeZoneList';
import {
  consoleLog,
  generateNameAndCodeString,
} from 'src/app/shared/util/common.util';
import { LoadingService } from 'src/app/shared/services/loading.service';
import { AuthService, SelectedMenuLevels } from 'src/app/auth/auth.service';
/** Created enum, instead of using boolean values, in case more than two filters condition are introduced */

interface AttributeType {
  value: string;
  type: string;
}
interface TemplateType {
  _id: string;
  name: string;
  code: string;
}
interface RespSurveyType {
  _id: string;
  displayName: string;
  name: string;
  code: string;
}

@Component({
  templateUrl: './campaign-master.component.html'
})
export class CampaignMasterComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('picker') picker: any;
  @ViewChild(MatSort) sort!: MatSort;
  readonly dataDomainList = DataDomainConfig;
  currentFeature!: DataDomainConfig;
  accessModes = AccessModes;
  accessMode: AccessModes = AccessModes.View;
  private _observableSub$!: Subscription;
  private _showEditComponents = false;
  private _submitMode = false;
  private _selectedMenuLevels!: SelectedMenuLevels;
  public userAccessOrgData: any;

  isLoading = false;
  selectedMemberOrg!: any;
  private _id!: string;
  private _currentCampData: any;
  private _searchString = '?';
  private campaignType: CampaignType = "comm";
  campaignFG!: FormGroup;
  dataSource!: MatTableDataSource<any>;
  memberOrgList: Array<Object> = [];
  templateList: TemplateType[] = [];
  schedulePreviewList: any = [];
  dynamicDropDown: any = [];
  finalCriteriaJson: Array<Object> = [];
  attributList: AttributeType[] = [];
  mainTemplateList: Array<Object> = [];
  timeZonesList: string[] = TIMEZONELIST;
  filteredOptions: Observable<string[]>;
  orgLable: string = '';
  recurrPattern: string = '';
  minDateValue: string = '';
  modalType: string = '';
  testCriteriaData: any = '';
  showModal: boolean = false;
  formValid: boolean = false;
  messageView: boolean = false;
  statusType: number = 1;
  filterSuccess: boolean = false;
  respSurveyList: RespSurveyType[] = [];
  displayedColumns: string[] = [
    'date',
    'status',
    'generated',
    'accepted',
    'opened',
    'rejected',
    'failed',
    'action_buttons',
  ];
  numberList: any = [
    { _id: 0, name: 'first' },
    { _id: 1, name: 'second' },
    { _id: 2, name: 'third' },
    { _id: 3, name: 'fourth' },
    { _id: 4, name: 'last' },
  ];
  weekDaysList: any = [
    { _id: 0, name: 'Sunday' },
    { _id: 1, name: 'Monday' },
    { _id: 2, name: 'Tuesday' },
    { _id: 3, name: 'Wednesday' },
    { _id: 4, name: 'Thursday' },
    { _id: 5, name: 'Friday' },
    { _id: 6, name: 'Saturday' },
  ];
  monthsList: any = [
    { _id: 0, name: 'January' },
    { _id: 1, name: 'February' },
    { _id: 2, name: 'March' },
    { _id: 3, name: 'April' },
    { _id: 4, name: 'May' },
    { _id: 5, name: 'June' },
    { _id: 6, name: 'July' },
    { _id: 7, name: 'August' },
    { _id: 8, name: 'September' },
    { _id: 9, name: 'October' },
    { _id: 10, name: 'November' },
    { _id: 11, name: 'December' },
  ];
  operatorList: any = {
    'number-enum': [
      { type: '=', view: 'Equal-to (=)' },
      { type: '!=', view: 'Does not equal-to (!=)' },
      { type: 'In List', view: 'In List' },
      { type: 'Not In List', view: 'Not In List' },
      { type: 'Is populated', view: 'Is populated' },
      { type: 'Is not populated', view: 'Is not populated' },
    ],
    'string-input': [
      { type: '=', view: 'Equal-to (=)' },
      { type: '!=', view: 'Does not equal-to (!=)' },
      { type: 'contains', view: 'Contains' },
      { type: 'Does not contain', view: 'Does Not Contain' },
      { type: 'Is populated', view: 'Is populated' },
      { type: 'Is not populated', view: 'Is not populated' },
    ],
    string: [
      { type: '=', view: 'Equal-to (=)' },
      { type: '!=', view: 'Does not equal-to (!=)' },
      { type: 'contains', view: 'Contains' },
      { type: 'Does not contain', view: 'Does Not Contain' },
      { type: 'In List', view: 'In List' },
      { type: 'Not In List', view: 'Not In List' },
      { type: 'Is populated', view: 'Is populated' },
      { type: 'Is not populated', view: 'Is not populated' },
    ],
    number: [
      { type: '=', view: 'Equal-to (=)' },
      { type: '!=', view: 'Does not equal-to (!=)' },
      { type: '>', view: 'Greater-than (>)' },
      { type: '<', view: 'Less-than (<)' },
      { type: '>=', view: 'Greater-than or Equal-to (>=)' },
      { type: '<=', view: 'Less-than or Equal-to (<=)' },
      { type: 'Is populated', view: 'Is populated' },
      { type: 'Is not populated', view: 'Is not populated' },
    ],
    date: [
      { type: 'days before', view: 'days before' }, //integer input
      { type: 'days after', view: 'days after' }, //integer input
      { type: 'Is populated', view: 'Is populated' },
      { type: 'Is not populated', view: 'Is not populated' },
    ],
    stringMonthDay: [
      { type: 'days before (no year)', view: 'days before' }, //integer input
      { type: 'days after (no year)', view: 'days after' }, //integer input
      { type: 'Is populated', view: 'Is populated' },
      { type: 'Is not populated', view: 'Is not populated' },
    ],
  };
  selectedIndex = 0;
  differenceCount: number = 0;
  options = {};
  scheduleDataObj: any = {};
  dailyCheck: string;
  loginUserInfo: any;
  routerModule: string = '';
  timeZone: string = '';

  //to set initial form
  private _initForm() {
    let scheduleData =
      this._currentCampData?.schedulePattern == undefined
        ? null
        : this._currentCampData?.schedulePattern;
    let monthlyRecurr =
      scheduleData?.byWeekDay == undefined
        ? 'day'
        : scheduleData?.byWeekDay?.monthRecurrenceCount == null
        ? 'day'
        : 'weekly';
    let yearlyRecurr = scheduleData?.byMonthDay == undefined ? 'day' : 'days';
    let endSet =
      scheduleData?.endDate != undefined
        ? 'oneTime'
        : scheduleData?.endAfterOccurrenceCount != undefined
        ? 'daily'
        : 'weekly';

    /**2021-01-18 - Frank - fixed date handling */
    const timeZone = this._currentCampData?.schedulePattern.timeZone;
    const startDate = this._communicationAIService.handleDateTimeZoneReceive(
      scheduleData?.startDate,
      timeZone
    );
    const endDateSet = !scheduleData?.endDate
      ? null
      : this._communicationAIService.handleDateTimeZoneReceive(
          scheduleData?.endDate,
          timeZone
        );
    const time = this._currentCampData?.schedulePattern.sendTime;
    const tempC = this._currentCampData?.template;
    const campCodeName = this.messageView
      ? this._currentCampData?.name + ' (' + this._currentCampData?.code + ')'
      : '';
    const surveyText =
      this._currentCampData?.survey?.name +
      ' (' +
      this._currentCampData?.survey?.code +
      ')';
    const orgValue =
      this.selectedMemberOrg?.selectedOrgInDrDw?.name +
      ' (' +
      this.selectedMemberOrg?.selectedOrgInDrDw?.code +
      ')';
    this.campaignFG = new FormGroup({
      memberOrgDrop: new FormControl(this._currentCampData?.filter?.memberOrg),
      memberOrg: new FormControl(orgValue, Validators.required),
      tempCode: new FormControl(tempC),
      surveyCode: new FormControl(surveyText),
      campaignCodeName: new FormControl(campCodeName),
      expiryDuration: new FormControl(this._currentCampData?.validInDays),
      campCode: new FormControl(
        this._currentCampData?.code,
        Validators.required
      ),
      campName: new FormControl(
        this._currentCampData?.name,
        Validators.required
      ),
      description: new FormControl(
        this._currentCampData?.description,
        Validators.required
      ),
      sunday: new FormControl(
        scheduleData?.dayOfWeek == undefined ? null : scheduleData?.dayOfWeek[0]
      ),
      monday: new FormControl(
        scheduleData?.dayOfWeek == undefined ? null : scheduleData?.dayOfWeek[1]
      ),
      tueday: new FormControl(
        scheduleData?.dayOfWeek == undefined ? null : scheduleData?.dayOfWeek[2]
      ),
      wedday: new FormControl(
        scheduleData?.dayOfWeek == undefined ? null : scheduleData?.dayOfWeek[3]
      ),
      thusday: new FormControl(
        scheduleData?.dayOfWeek == undefined ? null : scheduleData?.dayOfWeek[4]
      ),
      friday: new FormControl(
        scheduleData?.dayOfWeek == undefined ? null : scheduleData?.dayOfWeek[5]
      ),
      satday: new FormControl(
        scheduleData?.dayOfWeek == undefined ? null : scheduleData?.dayOfWeek[6]
      ),
      filterCriteriaArray: this.formBuilder.array([]),
      dailyRecurrence: new FormControl(
        scheduleData?.dayRecurrenceCount == undefined
          ? null
          : scheduleData?.dayRecurrenceCount,
        [Validators.max(31), Validators.min(1)]
      ),
      weekRecurrence: new FormControl(
        scheduleData?.weekRecurrenceCount == undefined
          ? null
          : scheduleData?.weekRecurrenceCount,
        [Validators.min(1)]
      ),
      timeSetup: new FormControl(scheduleData?.scheduleType),
      timeSetupd: new FormControl(endSet),
      startDate: new FormControl(startDate, [Validators.required]),
      setTime: new FormControl(time, [Validators.required]),
      endDate: new FormControl(endDateSet),
      endAfter: new FormControl(
        scheduleData?.endAfterOccurrenceCount != undefined
          ? scheduleData?.endAfterOccurrenceCount
          : null,
        [Validators.min(1)]
      ),
      number: new FormControl(
        scheduleData?.byWeekDay == undefined
          ? null
          : scheduleData?.byWeekDay?.occurence,
        [Validators.max(12), Validators.min(1)]
      ),
      days: new FormControl(
        scheduleData?.byWeekDay == undefined
          ? null
          : scheduleData?.byWeekDay?.weekDay
      ),
      month: new FormControl(
        scheduleData?.byWeekDay == undefined
          ? null
          : scheduleData?.byWeekDay?.monthRecurrenceCount,
        [Validators.max(12), Validators.min(1)]
      ),
      monthRecnumber: new FormControl(
        scheduleData?.byMonthWeekDay == undefined
          ? null
          : scheduleData?.byMonthWeekDay?.occurence
      ),
      monthRecdays: new FormControl(
        scheduleData?.byMonthWeekDay == undefined
          ? null
          : scheduleData?.byMonthWeekDay?.weekDay
      ),
      monthRecmonth: new FormControl(
        scheduleData?.byMonthWeekDay == undefined
          ? null
          : scheduleData?.byMonthWeekDay?.month
      ),
      monthdays: new FormControl(
        scheduleData?.byDayOfMonth == undefined
          ? null
          : scheduleData?.byDayOfMonth?.dayOfMonth,
        [Validators.max(31), Validators.min(1)]
      ),
      monthMonth: new FormControl(
        scheduleData?.byDayOfMonth == undefined
          ? null
          : scheduleData?.byDayOfMonth?.monthRecurrenceCount,
        [Validators.max(12), Validators.min(1)]
      ),
      yearRecNmuber: new FormControl(
        scheduleData?.byMonthDay == undefined
          ? null
          : scheduleData?.byMonthDay?.day,
        [Validators.max(31), Validators.min(1)]
      ),
      myearRecmonthonth: new FormControl(
        scheduleData?.byMonthDay == undefined
          ? null
          : scheduleData?.byMonthDay?.month
      ),
      yearlyradio: new FormControl(yearlyRecurr),
      monthlyradio: new FormControl(monthlyRecurr),
      yearRecurrence: new FormControl(
        scheduleData?.yearRecurrenceCount == undefined
          ? null
          : scheduleData?.yearRecurrenceCount,
        [Validators.min(1)]
      ),
    });
    this.campaignFG.controls.memberOrg.disable();
    this.routerModule == 'communicationAI'
      ? this.campaignFG.controls.tempCode.setValidators([Validators.required])
      : this.campaignFG.controls.tempCode.clearValidators();
    this.routerModule != 'communicationAI'
      ? this.campaignFG.controls.surveyCode.setValidators([Validators.required])
      : this.campaignFG.controls.surveyCode.clearValidators();
      this.routerModule != 'communicationAI'
      ? this.campaignFG.controls.expiryDuration.setValidators([Validators.required])
      : this.campaignFG.controls.expiryDuration.clearValidators();
    this.userAccessOrgData?.memOrgDrop?.visible
      ? this.campaignFG.controls.memberOrgDrop.setValidators([
          Validators.required,
        ])
      : this.campaignFG.controls.memberOrgDrop.clearValidators();
    if (this.filterCriteriaArray.length) {
      let fa = <FormArray>this.campaignFG.get('filterCriteriaArray');
      fa.controls = [];
      fa.reset();
    }
    if (
      this.accessMode === this.accessModes.Edit ||
      this.accessMode === this.accessModes.View ||
      this.accessMode === this.accessModes.Copy
    ) {
      this.statusType = this._currentCampData?.status;
      this.timeControl.reset(scheduleData?.timeZone);
      this.timeControl.disable();
      this.campaignFG.controls.surveyCode.disable();
      this.endbyRadioChange(endSet);
      this._communicationAIService.setReceivedTimeZone(scheduleData?.timeZone);
      this.radioButtonClick(
        this._currentCampData?.schedulePattern?.scheduleType,
        'type1'
      );
      monthlyRecurr == 'day' ? this.daySelctionFun() : this.theSelctionFun();
      yearlyRecurr == 'day' ? this.onTheRadioFun() : this.onRadioFun();
      let formArray = this._currentCampData?.filter?.criteria;
      this.dynamicDropDown = [];
      if (formArray?.length == 0) {
        this.addRowCriteria();
      } else {
        formArray.forEach((item: any, index: number) => {
          setTimeout(() => {
            let doopList: any = [];
            let dropList: any = [];
            let dataType: any = '';
            let value: any = '';
            let attrType: any = '';
            let attrValtype: any = '';
            this.loginUserInfo.filter((data: any) => {
              if (data['code'] == item?.attributeName && dataType == '') {
                dataType = data;
                attrValtype = data.type;
              }
            });

            switch (dataType.dataProviderType) {
              case 'enum':
                if (dataType.type == 'number') {
                  attrValtype = 'number-enum';
                }
                dropList = dataType.data;
                break;
              case 'dynamic':
                dataType?.data.forEach((item: any) => {
                  if (item != '') {
                    if (!doopList.includes(item)) {
                      dropList.push({ id: item, value: item, dataT: 'Edit' });
                      doopList.push(item);
                    }
                  }
                });
                break;
              default:
                attrType = dataType.type;
                if (dataType.type == 'string') {
                  attrValtype = 'string-input';
                  attrType = 'Text';
                } else if (dataType.type == 'integer') {
                  attrValtype = 'number';
                } else if (dataType.type == 'date') {
                  attrValtype = 'date';
                  attrType = 'integer';
                } else if (dataType.type == 'stringMonthDay') {
                  attrValtype = 'stringMonthDay';
                  attrType = 'integer';
                }
                break;
            }
            if (this.dynamicDropDown[index] == undefined) {
              this.dynamicDropDown.push({ [index]: dropList });
            } else {
              this.dynamicDropDown.push({ [index]: '' });
            }
            let sartParam: string = '';
            let endParam: string = '';
            if (item?.startParenthesisCount > 0) {
              for (let i = 0; item?.startParenthesisCount > i; i++) {
                sartParam += '( ';
              }
            }
            if (item?.endParenthesisCount > 0) {
              for (let i = 0; item?.endParenthesisCount > i; i++) {
                endParam += ') ';
              }
            }

            switch (item?.operator) {
              case 'Not In List':
              case 'In List':
                attrType = 'Multiple';
                let test: any = [];
                for (let i = 0; item?.values.length > i; i++) {
                  dropList.forEach((val: any) => {
                    if (val.id == item?.values[i]) {
                      test.push(val);
                    }
                  });
                }
                value = test;
                break;
              case 'Is populated':
              case 'Is not populated':
                attrType = null;
                value = null;
                break;
              case 'contains':
                attrType = 'Text';
                value = item?.values;
                break;
              case 'days before':
              case 'days after':
                attrType = 'NumberDate';
                value = item?.values[0];
                break;
              default:
                value = item?.values[0];
                break;
            }
            if (dataType?.type == 'Date' && attrType != 'NumberDate') {
              value = new Date(item?.values[0]);
            }
            this.filterCriteriaArray.push(
              this.formBuilder.group({
                startParam: {
                  value: sartParam,
                  disabled: this.accessMode === this.accessModes.View,
                },
                attributes: {
                  value: item?.attributeName,
                  disabled: this.accessMode === this.accessModes.View,
                },
                operator: {
                  value: item?.operator,
                  disabled: this.accessMode === this.accessModes.View,
                },
                attrValue: {
                  value: value,
                  disabled: this.accessMode === this.accessModes.View,
                },
                endParam: {
                  value: endParam,
                  disabled: this.accessMode === this.accessModes.View,
                },
                attrValueType: {
                  value: attrType != '' ? attrType : dataType.type,
                  disabled: this.accessMode === this.accessModes.View,
                },
                attrType: attrValtype,
                andOr: {
                  value: item?.logicalConcatenation,
                  disabled: this.accessMode === this.accessModes.View,
                },
              })
            );
          });
        });
      }
    }
    if (this.accessMode === this.accessModes.Add) {
      //this.tableViewHide = true;
      this.dynamicDropDown = [];
      this.campaignFG.controls['setTime'].reset();
      this.timeControl.reset(this.timeZone);
      this._filter(this.timeZone);
      //this.editMemberOrgList = [];
      this.addRowCriteria();
      this.radioButtonClick('oneTime', 'type1');
      this.endbyRadioChange('weekly');
      this.daySelctionFun();
      this.onRadioFun();
      this.campaignFG.controls['monthlyradio'].reset('day');
      this.campaignFG.controls['yearlyradio'].reset('days');
      this.campaignFG.controls['timeSetup'].reset('oneTime');
      this.campaignFG.controls['timeSetupd'].reset('weekly');
    }

    if (this.accessMode === this.accessModes.View) {
      this.campaignFG.disable();
      this.routerModule = !tempC ? 'responseAI' : 'communicationAI';
    } else if (this.accessMode === this.accessModes.Copy) {
      this.campaignFG.controls.campCode.reset();
    }

    setTimeout(() => {
      this._setLoading(false);
    }, 300);
  }
  timeControl = new FormControl(null, [Validators.required]);
  constructor(
    private _communicationAIService: CommunicationAIService,
    private _responseAIService: ResponseAIService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _snackbarService: SnackbarService,
    private formBuilder: FormBuilder,
    private _dialogService: DialogService,
    private _loadingService: LoadingService,
    private _authService: AuthService
  ) {
    this.dailyCheck = 'oneTime';
    this.filteredOptions = this.timeControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value))
    );
  }

  ngOnInit(): void {
    this._setLoading(true);
    //Getting user time zone
    this.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    //Getting this member org list from email-template-setup.ts by using with serives
    this.userAccessOrgData = this._communicationAIService.getSelOrgData();
    this.memberOrgList = this.userAccessOrgData?.selOrgInfo?.memberOrgs;
    //this.selectedMemberOrg = this.orgLable == 'Holding Org' ? this.userAccessOrgData?.selOrgInfo : this.userAccessOrgData?.selMemberOrg;
    this.selectedMemberOrg = this.userAccessOrgData?.orgType;
    let routerPath = this._route.snapshot.routeConfig?.path;
    this.routerModule = this._route.snapshot.url[0]?.path;

    this.campaignType = this.getCampaignType()

    if (
      routerPath ===
        dashboardRouteLinks.COMMUNICATION_MANAGE_CAMPAIGN_MASTER_ADD
          .routerLink ||
      routerPath ==
        dashboardRouteLinks.RESPONSE_MANAGE_FEEDBACK_CAMPAIGN_ADD.routerLink ||
      routerPath == dashboardRouteLinks.NPS_MANAGE_NPS_CAMPAIGN_ADD.routerLink
    ) {
      this.accessMode = this.accessModes.Add;
    } else if (
      routerPath ===
        dashboardRouteLinks.COMMUNICATION_MANAGE_CAMPAIGN_MASTER_EDIT
          .routerLink ||
      routerPath ==
        dashboardRouteLinks.RESPONSE_MANAGE_FEEDBACK_CAMPAIGN_EDIT.routerLink ||
      routerPath == dashboardRouteLinks.NPS_MANAGE_NPS_CAMPAIGN_EDIT.routerLink
    ) {
      this.accessMode = this.accessModes.Edit;
    } else if (
      routerPath ===
        dashboardRouteLinks.COMMUNICATION_MANAGE_CAMPAIGN_MASTER_COPY
          .routerLink ||
      routerPath ==
        dashboardRouteLinks.RESPONSE_MANAGE_FEEDBACK_CAMPAIGN_COPY.routerLink ||
      routerPath == dashboardRouteLinks.NPS_MANAGE_NPS_CAMPAIGN_COPY.routerLink
    ) {
      this.accessMode = this.accessModes.Copy;
    } else if (
      routerPath ===
        dashboardRouteLinks.SYSTEM_ADMIN_MANAGE_MESSAGE_EVENTS_VIEW
          .routerLink &&
      this.userAccessOrgData?.eventType == 'campaign'
    ) {
      this.accessMode = this.accessModes.View;
      this._currentCampData = this.userAccessOrgData?.bindData;
      this.messageView = true;
    }

    this.orgLable =
      this.userAccessOrgData?.orgType?.compareByKeyForFilter == 'memberOrg'
        ? 'Member Org'
        : 'Holding Org';
    this._id = this._route.snapshot.params?.id;
    const orgId = this.userAccessOrgData?.selOrgInfo?._id;
    let orgType = this.orgLable == 'Holding Org' ? 'holdingOrg=' : 'memberOrg=';
    //set search string by selected holding/member org id
    this._searchString =
      this._searchString +
      orgType +
      this.userAccessOrgData?.orgType?.selectedOrgInDrDw?._id;

    const messageOrResp: Observable<any> =
      this.routerModule == 'communicationAI'
        ? this._communicationAIService.getCampaignById(this._searchString)
        : this.routerModule == 'responseAI'
        ? this._communicationAIService.getRespCampaignById(this._searchString)
        : this._communicationAIService.getNpsCampaignById(this._searchString);

    //get hold/member org list
    this.getOrgListFun(orgId);

    if (this.messageView) {
      return;
    }

    this._setLoading(true);

    const messageOrRespObs: Observable<any> = this._loadingService
      .showProgressBarUntilCompleted(messageOrResp)
      .pipe(
        map((camp) => {
          if (this._id) {
            this._currentCampData = camp?.results?.find(
              (item: { _id: string }) => item._id === this._id
            );
          }
          return camp;
        })
      );

    this._observableSub$ = this._loadingService
      .showProgressBarUntilCompleted(messageOrRespObs, 'query')
      .subscribe(
        async (tempList: any) => {
          if (this.routerModule != 'communicationAI') {
            const surveyListResp: Observable<any> =
              this.routerModule == 'responseAI'
                ? this._responseAIService.getRespSurveyList(this._searchString)
                : this.routerModule == 'nps'
                ? this._responseAIService.getNpsSurveyList(this._searchString)
                : this._responseAIService.getNpsSurveyList(this._searchString);
            surveyListResp.subscribe(
              (res: any) => {
                this.respSurveyList = res?.results;
                this._initForm();
              },
              (error) => {
                consoleLog(error);
              }
            );
            this._setLoading(false);
            return;
          }
        },
        (error) => {
          consoleLog(error);
          this._setLoading(false);
        }
      );

    /** 16032021 - Gaurav - _selectedMenuLevels was NOT set for the last selected menu item to work! */
    this._authService
      .getSelectedMenuLevelsListenerObs()
      .pipe(take(1))
      .subscribe((value: SelectedMenuLevels) => {
        /** Get and store the current selected menu level */
        this._selectedMenuLevels = value;
      });
  }

  private getCampaignType() {
    let campaignType: CampaignType;

    if(this.routerModule === 'communicationAI') {
       campaignType = 'comm';
    }
    else if(this.routerModule === 'nps') {
      campaignType  = 'nps'
    }
    else if(this.routerModule === 'responseAI') {
      campaignType  = 'resp'
    }
    else {
      throw new Error("Unknown campaign type")
    }

    return campaignType;
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.timeZonesList.filter(
      (option) => option.toLowerCase().indexOf(filterValue) === 0
    );
  }
  ngOnDestroy(): void {
    if (!this.messageView) {
      this._observableSub$.unsubscribe();
    }
  }
  //Get sel org attribute list
  getOrgListFun(id: string) {
    let orgId;
    if (id == '1') {
      orgId = this.campaignFG.controls['memberOrgDrop'].value;
    } else {
      orgId = id;
    }
    //to get attributes list based on holding org
    const getCommAttributesObs: Observable<any> = this._communicationAIService.getCustomersAttrbutes(
      orgId
    );
    //to get attributes list based on holding org
    this._loadingService
      .showProgressBarUntilCompleted(getCommAttributesObs, 'query')
      .subscribe(
        (res) => {
          this.loginUserInfo = res;
          const attributeListTmp: AttributeType[] = [];
          this.loginUserInfo.forEach((property: any) => {
            if (property.useInCampaignFilter) {
              attributeListTmp.push({
                type: property?.shortName + ' (' + property?.code + ')',
                value: property?.code,
              });
            }
          });
          this.attributList = attributeListTmp.sort((a, b) => {
            if (a.type < b.type) {
              return -1;
            }

            if (a.type > b.type) {
              return 1;
            }
            return 0;
          });
          if (id == '1') {
            return;
          }
          if (
            this.routerModule == 'communicationAI' ||
            this.routerModule == 'sysAdmin'
          ) {
            this._communicationAIService
              .getTemplateList(this._searchString)
              .subscribe(
                (res) => {
                  this.templateList = res?.results;
                  this._initForm();
                },
                (error) => {
                  consoleLog(error);
                  this._setLoading(false);
                }
              );
          }
        },
        (error) => {
          consoleLog(error);
          this._setLoading(false);
        }
      );
    // this._communicationAIService.getCustomersAttrbutes(orgId).subscribe(
    // );
  }
  //Adding Zero to time get single digit
  addZero(i: any) {
    if (i < 10) {
      i = '0' + i;
    }
    return i;
  }
  //Get Templates list
  getEmailTemplateList() {
    this._communicationAIService
      .getTemplateList(this._searchString)
      .subscribe((res) => {
        this.mainTemplateList = res;
      });
  }
  //Get filter criteria array data
  get filterCriteria(): FormArray {
    return this.campaignFG.get('filterCriteriaArray') as FormArray;
  }
  //Add filter criteria row
  addRowCriteria(): void {
    let fa = <FormArray>this.campaignFG.controls['filterCriteriaArray'];
    fa.push(
      this.formBuilder.group({
        startParam: new FormControl(null),
        attributes: new FormControl(null),
        operator: new FormControl(null),
        attrValue: new FormControl(null),
        endParam: new FormControl(null),
        attrValueType: new FormControl(null),
        attrType: new FormControl(null),
        andOr: new FormControl(null),
      })
    );
    let index = fa.length;
    this.dynamicDropDown.push({ [index]: [] });
  }
  //to set show edit function
  isShowEditComponents(): boolean {
    /** Secure any side-effect() to change this variable apart from those intended */
    return this._showEditComponents;
  }
  //to set submit mode function
  isSubMitMode(): boolean {
    return this._submitMode;
  }

  /** To be called by the CanDeactivate service */
  onUserNavigation(
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot
  ): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.campaignFG?.dirty) {
        if (this._submitMode) resolve(true);
        this._dialogService
          .openSystemDialog({
            alertType: SystemDialogType.warning_alert_yes_no,
            dialogConditionType:
              DialogConditionType.prompt_discard_data_changes,
          })
          .then((response) => {
            if (response === SystemDialogReturnType.continue_yes) {
              resolve(true);
            } else {
              this._authService.setSelectedMenuLevelsListener({
                ...this._selectedMenuLevels,
                isCanDeactivateInitiated: true,
              });
              resolve(false);
            }
          });
      } else {
        resolve(true);
      }
    });
  }
  //to set add/copy/update button text function
  getActionButtonText(): string {
    if (
      this.accessMode === this.accessModes.Add ||
      this.accessMode === this.accessModes.Copy
    )
      return 'Add';
    if (this.accessMode === this.accessModes.Edit) return 'Update';
    return '';
  }
  //to show add/edit/copy button function
  isCanDo(): boolean {
    return (
      this.accessMode === this.accessModes.Add ||
      this.accessMode === this.accessModes.Copy ||
      this.accessMode === this.accessModes.Edit
    );
  }
  //on save / update template function
  onSubmit() {
    let holdingOrgVal: any = null;
    let memberOrgVal: any = null;
    let filterHoldingOrg: any = null;
    let filterMemberOrg: any = null;

    this._setLoading(true);
    let formData = this.campaignFG.value;
    this.scheduleDataObj = {};

    if (this.orgLable == 'Holding Org') {
      holdingOrgVal = this.userAccessOrgData?.orgType?.selectedOrgInDrDw?._id;
    } else {
      memberOrgVal = this.userAccessOrgData?.orgType?.selectedOrgInDrDw?._id;
    }
    if (this.userAccessOrgData?.memOrgDrop?.visible) {
      filterMemberOrg = formData['memberOrgDrop'];
    } else {
      if (this.userAccessOrgData?.memOrgDrop?.custDataDomain?.holdingOrgLevel) {
        filterHoldingOrg = this.userAccessOrgData?.selMemberOrg?._id;
      } else {
        filterMemberOrg = memberOrgVal;
      }
    }
    if (this.campaignFG.valid) {
      this.testCriteriaFun('Save');
      if (this.filterSuccess) {
        this.previewScheduleFun('onSubmit');
      }
    }
    if (!this.formValid) {
      return;
    }
    if (
      this.accessMode != this.accessModes.Add &&
      this.routerModule != 'communicationAI'
    ) {
      formData['surveyCode'] = this._currentCampData?.survey?._id;
    }

    this._dialogService
       .openBottomSheetDialog({
         status: this.statusType,
         title: `Update status of '${formData['campName']}'?`,
         accessMode: this.accessMode
       })
       .then((response) => {
         if(response == undefined){
           return;
         }
         if (response === BottomSheetDialogReturnType.launched_yes) {
           this.statusType = 1;
         }else if(response === BottomSheetDialogReturnType.draft_yes){
          this.statusType = 2;
        } else if (response === BottomSheetDialogReturnType.terminate_yes) {
          this.statusType = -1;
        }else if (response === BottomSheetDialogReturnType.delete_yes){
          return this.deleteCampaign(formData['campName']);
        }
        let postData = {
          holdingOrg: holdingOrgVal,
          memberOrg: memberOrgVal,
          status: this.statusType,
          code: formData['campCode'],
          name: formData['campName'],
          description: formData['description'],
          template: formData['tempCode'],
          survey: formData['surveyCode'],
          validInDays: formData['expiryDuration'],
          filter: {
            holdingOrg: filterHoldingOrg,
            memberOrg: filterMemberOrg,
            criteria: this.finalCriteriaJson,
          },
          schedulePattern: this.scheduleDataObj,
        };
        let createUpdateEndpoint: any;
        if (
          this.accessMode === this.accessModes.Add ||
          this.accessMode === this.accessModes.Copy
        ) {
          createUpdateEndpoint =
            this.routerModule == 'communicationAI'
              ? this._communicationAIService.createCampaign(postData)
              : this.routerModule == 'responseAI'
              ? this._communicationAIService.createRespCampaign(postData)
              : this._communicationAIService.createNpsCampaign(postData);
        } else {
          createUpdateEndpoint =
            this.routerModule == 'communicationAI'
              ? this._communicationAIService.updateCampaign(postData, this._id)
              : this.routerModule == 'responseAI'
              ? this._communicationAIService.updateRespCampaign(
                  postData,
                  this._id
                )
              : this._communicationAIService.updateNpsCampaign(
                  postData,
                  this._id
                );
        }

        const addOrEdit: Observable<any> = createUpdateEndpoint;

        this._loadingService.showProgressBarUntilCompleted(addOrEdit).subscribe(
          (result) => {
            this.campaignFG.reset();
            this._snackbarService.showSuccess(
              `${postData.name} is ${
                this.accessMode === this.accessModes.Add ? 'added' : 'updated'
              } successfully!`
            );

            this._setLoading(false);

            this._router.navigate(
              [this.accessMode === this.accessModes.Add ? '..' : '../../'],
              { relativeTo: this._route }
            );
          },
          (error) => {
            consoleLog(error.message);
            this._setLoading(false);
          }
        );
      });
  }

  //on delete campaign
  deleteCampaign(campName: string){
    this._loadingService
            .showProgressBarUntilCompleted(
              this._communicationAIService.deleteCampaignWithCampaignType(this._id, this.campaignType)
            )
            .subscribe(
              (result) => {
                this._snackbarService.showSuccess(`${campName} is deleted!`);
                this.onCancel();
              }
            )
  }
  //on cancel redirect to email-template-setup page / template list page
  onCancel(): void {
    this._router.navigate(
      [this.accessMode === this.accessModes.Add ? '..' : '../../'],
      { relativeTo: this._route }
    );
  }
  //set the title of the page function
  getTitle(): string {
    if (this.messageView) {
      return 'View Message Events';
    }
    let pageTitle =
      this.routerModule == 'communicationAI'
        ? ' Message'
        : this.routerModule == 'responseAI'
        ? ' Survey'
        : ' NPS';
    return this.accessMode + pageTitle + ' Campaign Master';
  }
  delRoleRow(index: any) {
    let checkVal = this.filterCriteriaArray[index].get('andOr')?.value;
    let operate = this.filterCriteriaArray[index].get('operator')?.value;
    if ((checkVal == null || checkVal == 'null') && this.dynamicDropDown > 1) {
      this.filterCriteriaArray[index - 1].get('andOr')?.reset(null);
    }
    let dropItems = this.dynamicDropDown;
    this.dynamicDropDown.splice(index, 1);
    dropItems.forEach((item: any, ind: number) => {
      if (index <= ind) {
        this.dynamicDropDown[ind][ind] = this.dynamicDropDown[ind][ind + 1];
      }
    });
    this.onDeleteRowFilterCriteria(index);
    if (this.dynamicDropDown.length == 0) {
      this.addRowCriteria();
    }
  }
  onDeleteRowFilterCriteria(index: number): void {
    (<FormArray>this.campaignFG.get('filterCriteriaArray')).removeAt(index);
  }
  startParamFun(index: any, type: any) {
    let strValue = this.filterCriteriaArray[index].get('startParam')?.value;
    if (type == 'add') {
      if (strValue != null && strValue != 'null') {
        strValue = strValue + '( ';
      } else {
        strValue = '( ';
      }
    } else {
      if (strValue != null && strValue != 'null' && strValue.length > 0) {
        strValue = strValue.substring(0, strValue.length - 2);
      }
    }
    this.filterCriteriaArray[index].get('startParam')?.reset(strValue);
  }
  endParamFun(index: number, type: any) {
    let edValue = this.filterCriteriaArray[index].get('endParam')?.value;
    if (type == 'add') {
      if (edValue != null && edValue != 'null') {
        edValue = edValue + ') ';
      } else {
        edValue = ') ';
      }
    } else {
      if (edValue != null && edValue != 'null' && edValue.length > 0) {
        edValue = edValue.substring(0, edValue.length - 2);
      }
    }
    this.filterCriteriaArray[index].get('endParam')?.reset(edValue);
  }
  radioButtonClick(e: any, type: string) {
    this.recurrPattern = e;
  }
  onRadioFun() {
    this.campaignFG.get('monthRecnumber')?.disable();
    this.campaignFG.get('monthRecdays')?.disable();
    this.campaignFG.get('monthRecmonth')?.disable();
    this.campaignFG.get('monthRecnumber')?.reset();
    this.campaignFG.get('monthRecdays')?.reset();
    this.campaignFG.get('monthRecmonth')?.reset();
    this.campaignFG.get('myearRecmonthonth')?.enable();
    this.campaignFG.get('yearRecNmuber')?.enable();
  }
  onTheRadioFun() {
    this.campaignFG.get('monthRecnumber')?.enable();
    this.campaignFG.get('monthRecdays')?.enable();
    this.campaignFG.get('monthRecmonth')?.enable();
    this.campaignFG.get('myearRecmonthonth')?.disable();
    this.campaignFG.get('yearRecNmuber')?.disable();
    this.campaignFG.get('myearRecmonthonth')?.reset();
    this.campaignFG.get('yearRecNmuber')?.reset();
  }
  daySelctionFun() {
    this.campaignFG.get('number')?.disable();
    this.campaignFG.get('days')?.disable();
    this.campaignFG.get('month')?.disable();
    this.campaignFG.get('number')?.reset();
    this.campaignFG.get('days')?.reset();
    this.campaignFG.get('month')?.reset();
    this.campaignFG.get('monthdays')?.enable();
    this.campaignFG.get('monthMonth')?.enable();
  }
  theSelctionFun() {
    this.campaignFG.get('number')?.enable();
    this.campaignFG.get('days')?.enable();
    this.campaignFG.get('month')?.enable();
    this.campaignFG.get('monthdays')?.disable();
    this.campaignFG.get('monthMonth')?.disable();
    this.campaignFG.get('monthdays')?.reset();
    this.campaignFG.get('monthMonth')?.reset();
  }

  //Check criteria function
  checkCriteriaFun() {
    this.testCriteriaFun('Save');
    if (this.differenceCount != 0) {
      this._snackbarService.showError('Invalid Filter Criteria');
      this.filterSuccess = false;
      return;
    }
    if (this.filterSuccess) {
      this._setLoading(true);
      this.testCriteriaData = '';
      let holdingOrgVal: any = null;
      let memberOrgVal: any = null;

      if (this.orgLable == 'Holding Org') {
        holdingOrgVal = this.userAccessOrgData?.orgType?.selectedOrgInDrDw?._id;
        memberOrgVal = null;
      } else {
        holdingOrgVal = null;
        memberOrgVal = this.userAccessOrgData?.orgType?.selectedOrgInDrDw?._id;
      }
      let postData = {
        options: {
          offset: 0,
          limit: 10,
        },
        queryByCriteria: {
          orgLimiter: {
            holdingOrg: holdingOrgVal,
            memberOrg: memberOrgVal,
          },
          filter: { criteria: this.finalCriteriaJson },
        },
      };

      this._loadingService
        .showProgressBarUntilCompleted(
          this._communicationAIService.checkCriteria(postData)
        )
        .subscribe(
          (res) => {
            this.testCriteriaData = res;
            this._setLoading(false);
            this.showModal = true;
            this.modalType = 'Criteria';
            this._openDialog();
          },
          (error) => {
            this._snackbarService.showError(error.message);
            consoleLog(error);
            this._setLoading(false);
            this.closeCriteria();
          }
        );
    }
  }
  closeCriteria() {
    this.showModal = false;
    this.modalType = 'Edit';
  }
  _openDialog(): void {
    this._dialogService
      .openSystemDialog({
        alertType: SystemDialogType.info_alert_ok,
        dialogConditionType: DialogConditionType.prompt_custom_data,
        title: 'Criteria Results',
        body: this.testCriteriaData?.info?.totalCount + ` Records`,
      })
      .then((response) => {});
  }
  testCriteriaFun(type: string) {
    this.finalCriteriaJson = [];
    let stParamCount: number = 0;
    let edParamCount: number = 0;
    this.differenceCount = 0;
    let i = 0;
    for (i = 0; this.filterCriteriaArray?.length > i; i++) {
      this.filterSuccess = false;
      let value: any = [];
      let operatorVal = this.filterCriteriaArray[i]?.value.operator;

      if (this.filterCriteriaArray[i]?.value?.attrValueType == 'Multiple') {
        let multiData = this.filterCriteriaArray[i]?.value?.attrValue;
        if (multiData.length > 0) {
          multiData.forEach((item: any) => {
            //value.push(item?.value);
            value.push(item?.id);
          });
        }
      } else {
        if (
          this.filterCriteriaArray[i]?.value?.attrValue != null &&
          this.filterCriteriaArray[i]?.value?.attrValue != 'null'
        ) {
          value.push(this.filterCriteriaArray[i]?.value?.attrValue);
        }
      }
      if (this.filterCriteriaArray?.length > 1) {
        if (
          this.filterCriteriaArray[i]?.value?.attributes == null ||
          this.filterCriteriaArray[i]?.value?.attributes == 'null'
        ) {
          this._snackbarService.showError('Please select Attribute.');
          return;
        } else if (operatorVal == null || operatorVal == 'null') {
          this._snackbarService.showError('Please select Operator.');
          return;
        } else if (
          this.filterCriteriaArray[i]?.value?.attrValue == null ||
          this.filterCriteriaArray[i]?.value?.attrValue == 'null'
        ) {
          if (
            operatorVal == 'Is populated' ||
            operatorVal == 'Is not populated'
          ) {
          } else {
            this._snackbarService.showError('Please select Value.');
            return;
          }
        }
      } else {
        if (
          this.filterCriteriaArray[i]?.value?.attributes != null &&
          this.filterCriteriaArray[i]?.value?.attributes != 'null' &&
          operatorVal != null &&
          operatorVal != 'null' &&
          this.filterCriteriaArray[i]?.value.attrValue != null &&
          this.filterCriteriaArray[i]?.value.attrValue != 'null'
        ) {
        } else if (
          (this.filterCriteriaArray[i]?.value?.attributes != null &&
            this.filterCriteriaArray[i]?.value?.attributes != 'null') ||
          (operatorVal != null && operatorVal != 'null') ||
          (this.filterCriteriaArray[i]?.value.attrValue != null &&
            this.filterCriteriaArray[i]?.value?.attrValue != 'null')
        ) {
          if (
            operatorVal == 'Is populated' ||
            operatorVal == 'Is not populated'
          ) {
          } else {
            this._snackbarService.showError(
              'Please fill filter criteria fields.'
            );
            return;
          }
        }
        this.filterSuccess = true;
      }
      if (this.filterCriteriaArray[i]?.value?.attrValueType == 'NumberDate') {
        if (operatorVal == 'days before' || operatorVal == 'days after') {
          let attrValue = this.filterCriteriaArray[i]?.value?.attrValue;
          if (attrValue < 0 || attrValue > 31) {
            this._snackbarService.showError('Value allowed only 0 to 31.');
            this.filterSuccess = false;
            return;
          }
        }
      }
      if (
        value.length == 0 &&
        !(operatorVal == 'Is populated' || operatorVal == 'Is not populated')
      ) {
        return;
      }
      stParamCount +=
        this.filterCriteriaArray[i]?.value?.startParam == null
          ? 0
          : this.filterCriteriaArray[i]?.value?.startParam?.length / 2;
      edParamCount +=
        this.filterCriteriaArray[i]?.value?.endParam == null
          ? 0
          : this.filterCriteriaArray[i]?.value?.endParam?.length / 2;
      this.differenceCount = stParamCount - edParamCount;
      this.finalCriteriaJson.push({
        rowNumber: i,
        startParenthesisCount:
          this.filterCriteriaArray[i]?.value?.startParam == null
            ? 0
            : this.filterCriteriaArray[i]?.value?.startParam?.length / 2,
        endParenthesisCount:
          this.filterCriteriaArray[i]?.value?.endParam == null
            ? 0
            : this.filterCriteriaArray[i]?.value?.endParam?.length / 2,
        attributeName: this.filterCriteriaArray[i]?.value?.attributes,
        operator: this.filterCriteriaArray[i]?.value?.operator,
        values: value,
        logicalConcatenation: this.filterCriteriaArray[i]?.value?.andOr,
      });
      this.filterSuccess = true;
    }
    if (type != 'Save') {
      //this.router.navigate(?.dashboard/communicationAI/customerList/:criteria']);
    }
  }
  //End by radio change funciton
  endbyRadioChange(evt: any) {
    switch (evt) {
      case 'oneTime':
        this.campaignFG.controls['endAfter'].reset();
        this.campaignFG.controls['endAfter'].disable();
        this.minDateValue = this.campaignFG.controls['startDate'].value;
        break;
      case 'daily':
        this.campaignFG.controls['endAfter'].enable();
        this.campaignFG.controls['endDate'].reset();
        break;
      case 'weekly':
        this.campaignFG.controls['endDate'].reset();
        this.campaignFG.controls['endAfter'].reset();
        this.campaignFG.controls['endAfter'].disable();
        break;
      default:
        break;
    }
  }
  //Start date change function
  startDChangeFun(evt: any) {
    this._setLoading(true);
    setTimeout(() => {
      this.minDateValue = this.campaignFG.controls['startDate'].value;
      this.campaignFG.controls['endDate'].reset();
      this._setLoading(false);
    }, 300);
  }
  customerFilterCr(type: any, index: number) {
    let stParam = this.filterCriteriaArray[index].get('startParam')?.value;
    let attr = this.filterCriteriaArray[index].get('attributes')?.value;
    let operate = this.filterCriteriaArray[index].get('operator')?.value;
    let attrValue = this.filterCriteriaArray[index].get('attrValue')?.value;
    let edParam = this.filterCriteriaArray[index].get('endParam')?.value;
    if (attr == null || operate == null || attrValue == null) {
      if (operate == 'Is populated' || operate == 'Is not populated') {
      } else {
        this._snackbarService.showError('Please fill all fields.');
        return;
      }
    }
    this.filterCriteriaArray[index].get('andOr')?.reset(type);
    this.addRowCriteria();
  }

  operatorChange(index: number) {
    this.attributeSetFun(index, 'opr');
  }
  attributeSetFun(index: number, dType: string) {
    //let fa = <FormArray>this.campaignFG.controls['filterCriteriaArray'];
    let attrValue = this.filterCriteriaArray[index].get('attributes')?.value;
    this.filterCriteriaArray[index].get('attrValue')?.reset();
    if (attrValue == null || attrValue == 'null') {
      this.filterCriteriaArray[index].get('attributes')?.reset(null);
      this.filterCriteriaArray[index].get('attrValueType')?.reset();
      return;
    }
    let dataType: any = '';
    this.loginUserInfo.filter((item: any) => {
      if (item['code'] == attrValue && dataType == '') {
        dataType = item;
      }
    });
    let optValue = this.filterCriteriaArray[index].get('operator')?.value;
    let type = dataType.type;
    if (dataType != '') {
      let doopList: any = [];
      let dropList: any = [];
      if (this.dynamicDropDown.length > 0) {
        this.dynamicDropDown[index] = [];
      }

      if (dType == 'attr') {
        this.filterCriteriaArray[index].get('attrType')?.reset(dataType.type);
      }
      switch (dataType.dataProviderType) {
        case 'enum':
          if (dataType.type == 'number') {
            this.filterCriteriaArray[index]
              .get('attrType')
              ?.reset('number-enum');
            type = 'string';
          }
          dropList = dataType.data;
          break;
        case 'dynamic':
          dataType.data.forEach((item: any) => {
            if (!doopList.includes(item)) {
              dropList.push({ id: item, value: item, dataT: type });
              doopList.push(item);
            }
          });
          break;
        default:
          if (dataType.type == 'string') {
            this.filterCriteriaArray[index]
              .get('attrType')
              ?.reset('string-input');
            type = 'Text';
          } else if (dataType.type == 'integer') {
            this.filterCriteriaArray[index].get('attrType')?.reset('number');
            type = dataType.type;
          } else if (dataType.type == 'date') {
            this.filterCriteriaArray[index].get('attrType')?.reset('date');
            type = dataType.type;
          } else if (dataType.type == 'stringMonthDay') {
            this.filterCriteriaArray[index]
              .get('attrType')
              ?.reset('stringMonthDay');
            type = dataType.type;
          }
          break;
      }

      if (this.dynamicDropDown[index] == undefined) {
        this.dynamicDropDown.push({ [index]: dropList });
      } else {
        this.dynamicDropDown[index] = { [index]: dropList };
      }
    }

    if (optValue != null && optValue != 'null') {
      switch (optValue) {
        case 'In List':
        case 'Not In List':
          if (dataType.data == undefined) {
            //fa.controls[index]['controls']['attrValueType'].reset('Chips');
            this.filterCriteriaArray[index].get('attrValueType')?.reset(type);
          } else {
            this.filterCriteriaArray[index]
              .get('attrValueType')
              ?.reset('Multiple');
          }
          break;
        case 'Is populated':
        case 'Is not populated':
          this.filterCriteriaArray[index].get('attrValueType')?.reset();
          break;
        case 'contains':
          this.filterCriteriaArray[index].get('attrValueType')?.reset('Text');
          break;
        case 'days before':
        case 'days after':
        case 'days before (no year)':
        case 'days after (no year)':
          this.filterCriteriaArray[index]
            .get('attrValueType')
            ?.reset('integer');
          break;
        default:
          this.filterCriteriaArray[index].get('attrValueType')?.reset(type);
          break;
      }
    } else {
      if (dataType.type == 'date' || dataType.type == 'stringMonthDay') {
        this.filterCriteriaArray[index].get('attrValueType')?.reset('integer');
      } else {
        this.filterCriteriaArray[index].get('attrValueType')?.reset(type);
      }
    }
  }
  get filterCriteriaArray() {
    return (<FormArray>this.campaignFG.get('filterCriteriaArray')).controls;
  }
  attrChangeFun(index: number) {
    this.filterCriteriaArray[index].get('operator')?.reset();
    this.attributeSetFun(index, 'attr');
  }
  //Number change function in filter criteria
  numberChange(e: any): any {
    if (e.which == 45 || e.which == 44 || e.which == 46) {
      return false;
    }
  }
  //Preview Schedule check function
  previewScheduleFun(type: string) {
    this.formValid = true;
    let formData = this.campaignFG.value;
    switch (formData['timeSetup']) {
      case 'oneTime':
        this.scheduleDataObj = {
          scheduleType: formData['timeSetup'],
          startDate: formData['startDate'],
          sendTime: formData['setTime'],
        };
        break;
      case 'daily':
        this.scheduleDataObj = {
          dayRecurrenceCount: formData['dailyRecurrence'],
          scheduleType: formData['timeSetup'],
          startDate: formData['startDate'],
          sendTime: formData['setTime'],
          endDate: formData['endDate'],
        };
        if (
          formData['dailyRecurrence'] == '' ||
          formData['dailyRecurrence'] == null
        ) {
          this._snackbarService.showError(
            'Please Enter Daily Recurrence fields'
          );
          this.formValid = false;
          return;
        }
        break;
      case 'weekly':
        let sunday = formData['sunday'] == true ? true : false;
        let monday = formData['monday'] == true ? true : false;
        let tueday = formData['tueday'] == true ? true : false;
        let wedday = formData['wedday'] == true ? true : false;
        let thusday = formData['thusday'] == true ? true : false;
        let friday = formData['friday'] == true ? true : false;
        let satday = formData['satday'] == true ? true : false;
        this.scheduleDataObj = {
          scheduleType: formData['timeSetup'],
          startDate: formData['startDate'],
          sendTime: formData['setTime'],
          endDate: formData['endDate'],
          weekRecurrenceCount: formData['weekRecurrence'],
          dayOfWeek: [sunday, monday, tueday, wedday, thusday, friday, satday],
        };
        if (
          formData['weekRecurrence'] == '' ||
          formData['weekRecurrence'] == null
        ) {
          this._snackbarService.showError(
            'Please Enter Weekly Recurrence fields'
          );
          this.formValid = false;
          return;
        }
        break;
      case 'monthly':
        let monthlyType: any = this.campaignFG.controls['monthlyradio'].value;
        if (monthlyType == 'day') {
          this.scheduleDataObj = {
            scheduleType: formData['timeSetup'],
            startDate: formData['startDate'],
            sendTime: formData['setTime'],
            endDate: formData['endDate'],
            byDayOfMonth: {
              dayOfMonth: formData['monthdays'],
              monthRecurrenceCount: formData['monthMonth'],
            },
          };
          if (
            formData['monthdays'] == '' ||
            formData['monthdays'] == null ||
            formData['monthMonth'] == null
          ) {
            this._snackbarService.showError(
              'Please Enter Monthly Recurrence fields'
            );
            this.formValid = false;
            return;
          }
        } else {
          this.scheduleDataObj = {
            scheduleType: formData['timeSetup'],
            startDate: formData['startDate'],
            sendTime: formData['setTime'],
            endDate: formData['endDate'],
            byWeekDay: {
              occurence: formData['number'],
              weekDay: formData['days'],
              monthRecurrenceCount: formData['month'],
            },
          };
          if (
            formData['month'] == null ||
            formData['number'] == null ||
            formData['days'] == null
          ) {
            this._snackbarService.showError(
              'Please Enter Monthly Recurrence fields'
            );
            this.formValid = false;
            return;
          }
        }

        break;
      case 'yearly':
        let yearlyType: any = this.campaignFG.controls['yearlyradio'].value;
        if (yearlyType == 'days') {
          this.scheduleDataObj = {
            scheduleType: formData['timeSetup'],
            startDate: formData['startDate'],
            sendTime: formData['setTime'],
            endDate: formData['endDate'],
            yearRecurrenceCount: formData['yearRecurrence'],
            byMonthDay: {
              month: formData['myearRecmonthonth'],
              day: formData['yearRecNmuber'],
            },
          };
          if (
            formData['yearRecurrence'] == '' ||
            formData['yearRecurrence'] == null ||
            formData['myearRecmonthonth'] == null ||
            formData['yearRecNmuber'] == null
          ) {
            this._snackbarService.showError(
              'Please Enter Yearly Recurrence fields'
            );
            this.formValid = false;
            return;
          }
        } else {
          this.scheduleDataObj = {
            scheduleType: formData['timeSetup'],
            startDate: formData['startDate'],
            sendTime: formData['setTime'],
            endDate: formData['endDate'],
            yearRecurrenceCount: formData['yearRecurrence'],
            byMonthWeekDay: {
              occurence: formData['monthRecnumber'],
              weekDay: formData['monthRecdays'],
              month: formData['monthRecmonth'],
            },
          };
          if (
            formData['yearRecurrence'] == '' ||
            formData['yearRecurrence'] == null ||
            formData['monthRecnumber'] == null ||
            formData['monthRecdays'] == null ||
            formData['monthRecmonth'] == null
          ) {
            this._snackbarService.showError(
              'Please Enter Yearly Recurrence fields'
            );
            this.formValid = false;
            return;
          }
        }
        break;
      default:
        break;
    }
    let setup = formData?.timeSetupd;
    switch (setup) {
      case 'oneTime':
        if (formData['endDate'] != null) {
          this.scheduleDataObj = {
            ...this.scheduleDataObj,
            endDate: formData?.endDate,
          };
        } else {
          this._snackbarService.showError('Please Select End By');
          this.formValid = false;
          return;
        }
        break;
      case 'daily':
        if (formData['endAfter'] != null) {
          this.scheduleDataObj = {
            ...this.scheduleDataObj,
            endAfterOccurrenceCount: formData?.endAfter,
          };
        } else {
          this._snackbarService.showError('Please Enter End After Occurance');
          this.formValid = false;
          return;
        }
        break;
      case 'weekly':
        break;
    }
    this.scheduleDataObj = {
      ...this.scheduleDataObj,
      timeZone: this.timeControl.value,
    };

    this.scheduleDataObj.startDate = this._communicationAIService.handleDateTimeZoneSend(
      this.scheduleDataObj.startDate,
      this.scheduleDataObj.timeZone
    );
    this.scheduleDataObj.endDate = this.scheduleDataObj?.endDate
      ? this._communicationAIService.handleDateTimeZoneSend(
          this.scheduleDataObj?.endDate,
          this.scheduleDataObj.timeZone
        )
      : undefined;

    if (type != 'onSubmit' && this.formValid) {
      this.schedulePreviewList = [];
      this._communicationAIService
        .previewSchedule(this.scheduleDataObj)
        .subscribe((res) => {
          this.schedulePreviewList = {
            ...this.schedulePreviewList,
            timeZone: this.timeControl.value,
            dateList: res,
          };
          this._dialogService
            .openScheduleDialog({
              alertType: SystemDialogType.info_alert_ok,
              dialogConditionType: DialogConditionType.prompt_custom_data,
              title: 'Preview Schedule',
              body: this.schedulePreviewList,
            })
            .then((response) => {});
        });
    }
  }
  toggle(ref: any) {
    this.campaignFG.controls.timeSetupd.reset('oneTime');
    this.endbyRadioChange('oneTime');
  }
  filterIntegerChnage(type: any, evt: any) {
    if (type == 'integer') {
      if (
        (evt.which != 8 && evt.which != 0 && evt.which < 48) ||
        evt.which > 57
      ) {
        evt.preventDefault();
      }
    }
  }
  getSubTitle(): string {
    return generateNameAndCodeString(
      this.campaignFG?.controls?.campCode.value,
      this.campaignFG?.controls?.campName.value
    );
  }

  private _setLoading(value: boolean): void {
    this.isLoading = value;
    if (!value) this._loadingService.loadingOff();
  }
}
