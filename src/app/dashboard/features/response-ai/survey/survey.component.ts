/** 16122020 - Gaurav - Init version
 *  24122020 - Gaurav - Disable Submit button if any question for is invalid
 * 29122020 - Gaurav - Changes from DEMO to standard CRUD version for the app
 * 30122020 - Gaurav - Added introTextHTML
 * 01012021 - Gaurav - Added mandatory field responseIdentifierText
 * 04212021 - Gaurav - Added NPS related code, to reuse this object
 * 06012021 - Gaurav - renamed field introText to match with backend change
 * 12012021 - Gaurav - Modified to use new Survey APIs and added feature-updates-guard service
 * 13012021 - Gaurav - Removed surveyAvailabilityStatus
 * 15012021 - Gaurav - Added Update & Close button in EDIT mode, not in ADD mode for now because that needs some impact analysis
 * 19012021 - Gaurav - Added code field and removed displayName
 * 20012021 - Gaurav - Added subtitle (used common util method)
 * 22012021 - Gaurav - For new surveys, set holdingOrg or memberOrg based on the Org DrDw on Survey Setup page
 * 08022021 - Gaurav - Aesthetic bug fix: Load controls only when loading is off and survey object is valid. Added await for new Survey class instance
 * 08022021 - Gaurav - Added code for new progress-bar service
 * 15032021 - Gaurav - Use enum AccessModes from constants file instead of local one
 * 30032021 - Gaurav - JIRA-CA-277: Add message templates to survey setup
 * 31032021 - Gaurav - JIRA-CA-326: Increase survey title from 50 to 100
 * 01042021 - Gaurav - JIRA-CA-277: Fixed email editor issue with lazy-load child tabs */
import { Component, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { concatMap, map, take, tap } from 'rxjs/operators';
import { AuthService, SelectedMenuLevels } from 'src/app/auth/auth.service';
import {
  DialogConditionType,
  SystemDialogReturnType,
  SystemDialogType,
} from 'src/app/dashboard/shared/components/dialog/dialog.model';
import { DialogService } from 'src/app/dashboard/shared/components/dialog/dialog.service';
import {
  AccessModes,
  dashboardRouteLinks,
  DataDomainConfig,
} from 'src/app/dashboard/shared/components/menu/constants.routes';
import {
  OrgDrDwEmitStruct,
  OrgIdentifier,
} from 'src/app/dashboard/shared/components/org-dropdownlist/org-dropdownlist.component';
import { TemplateFieldValidationService } from 'src/app/dashboard/shared/services/template-field-validation.service';
import { SnackbarService } from 'src/app/shared/components/snackbar.service';
import { LoadingService } from 'src/app/shared/services/loading.service';
import {
  consoleLog,
  generateNameAndCodeString,
} from 'src/app/shared/util/common.util';
import {
  kEmailSubjectMaxLength,
  kSmsTextMaxLength,
  kWhatsAppTextMaxLength,
  MessageType,
} from '../../communication-ai/communication-ai.service';
import { Page, SurveyPage } from '../data-models/page.model';
import { Question, SurveyQuestion } from '../data-models/question.model';
import { Section, SurveySection } from '../data-models/section.model';
import {
  Survey,
  SurveyType,
  SurveyStruct,
  SurveyHoldingOrgData,
  SurveyEmailTemplate,
  SurveySmsTemplate,
  SurveyWhatsAppTemplate,
} from '../data-models/survey.model';
import { ResponseAIService } from '../response-ai.service';

import { EmailEditorComponent } from 'angular-email-editor';
import { unsubscribeContent } from '../../communication-ai/email-template/email-template-content';

interface InvalidPageIndexes {
  pageTabIndex: number;
  sectionTabIndex: number;
}

interface ChannelConfig {
  enableEmail: boolean;
  enableSms: boolean;
  enableWhatsApp: boolean;
}

@Component({
  templateUrl: './survey.component.html',
  styleUrls: ['./survey.component.css'],
})
export class SurveyComponent implements OnInit, OnDestroy {
  @ViewChild('editor') editor!: EmailEditorComponent;
  readonly smsTextMaxLength = kSmsTextMaxLength;
  readonly whatsAppTextMaxLength = kWhatsAppTextMaxLength;
  readonly emailSubjectMaxLength = kEmailSubjectMaxLength;
  readonly accessModes = AccessModes;
  readonly dataDomainList = DataDomainConfig;
  readonly surveyFieldLengthConfig = {
    code: 10,
    name: 50,
    title: 100,
  };

  private _id!: string;
  private _surveysListenerObsSub$!: Subscription;
  private _currentOrgIdentifier!: OrgIdentifier;
  private _currentHoldingOrg!: SurveyHoldingOrgData;
  private _currentMemberOrg!: SurveyHoldingOrgData;
  surveyOrgData!: any;

  /** For the CanDeactivate */
  private _submitMode = false;
  private _selectedMenuLevels!: SelectedMenuLevels;

  form: FormGroup = new FormGroup({
    dataDomain: new FormControl(DataDomainConfig.response, Validators.required),
    holdingOrg: new FormControl(null),
    memberOrg: new FormControl(null),
    code: new FormControl(null, Validators.required),
    name: new FormControl(null, Validators.required),
    introText: new FormControl(null),
    status: new FormControl(1, Validators.required),
    title: new FormControl(null),
    showLogo: new FormControl(false),
    channel: new FormGroup({
      email: new FormGroup({
        subject: new FormControl(null),
        body: new FormControl(null),
        templateData: new FormControl(null),
      }),
      sms: new FormGroup({
        text: new FormControl(null),
      }),
      whatsApp: new FormGroup({
        text: new FormControl(null),
      }),
    }),
  });

  accessMode: AccessModes = AccessModes.View; //default
  isLoading = false;
  viewOnly = false;

  survey!: Survey;

  currentSurveyData!: SurveyStruct;
  isFormValid$!: Observable<boolean>;
  currentFeature!: DataDomainConfig;

  /** Data passed on to child survey components (pages and sections) */
  savedSectionStructs!: any[];
  savedQuestionsStructs!: any[];
  questionTypes!: any[];
  private _orgDrDwData!: OrgDrDwEmitStruct;

  tabIndex: { index: number; label: string }[] = [
    { index: 0, label: 'Profile' },
    { index: 1, label: 'Setup' },
    { index: 2, label: 'Message Templates' },
  ];
  selectedTablIndex = this.tabIndex[0].index;
  selectedPageTabIndex = 0;
  selectedMessageTemplateTabIndex = 0;

  options = {};
  channelConfig: ChannelConfig = {
    enableEmail: false,
    enableSms: false,
    enableWhatsApp: false,
  };

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _responseAIService: ResponseAIService,
    public templateFieldValidationService: TemplateFieldValidationService,
    private _snackbarService: SnackbarService,
    private _dialogService: DialogService,
    private _loadingService: LoadingService,
    private _authService: AuthService,
    private _zone: NgZone
  ) {
    /** Set current feature: nps OR response */
    switch (this._route.snapshot.routeConfig?.path) {
      case dashboardRouteLinks.NPS_MANAGE_NPS_SETUP_ADD.routerLink:
      case dashboardRouteLinks.NPS_MANAGE_NPS_SETUP_EDIT.routerLink:
      case dashboardRouteLinks.NPS_MANAGE_NPS_SETUP_COPY.routerLink:
      case dashboardRouteLinks.NPS_MANAGE_NPS_SETUP_VIEW.routerLink:
      case dashboardRouteLinks.NPS_NPS_SETUP_VIEW_VIEW.routerLink:
        this.currentFeature = DataDomainConfig.nps;
        break;

      default:
        this.currentFeature = DataDomainConfig.response;
    }

    /** Set access mode, default is view-only */
    switch (this._route.snapshot.routeConfig?.path) {
      case dashboardRouteLinks.RESPONSE_MANAGE_FEEDBACK_SETUP_ADD.routerLink:
      case dashboardRouteLinks.NPS_MANAGE_NPS_SETUP_ADD.routerLink:
        this._currentOrgIdentifier = <OrgIdentifier>(
          this._route?.snapshot?.queryParams?.holOrMol
        );

        if (this._currentOrgIdentifier === OrgIdentifier.mol) {
          this._currentMemberOrg = {
            ...this._currentMemberOrg,
            _id: this._route?.snapshot?.queryParams?.orgId,
          };
        } else {
          this._currentHoldingOrg = {
            ...this._currentHoldingOrg,
            _id: this._route?.snapshot?.queryParams?.orgId,
          };
        }

        this.accessMode = AccessModes.Add;
        break;

      case dashboardRouteLinks.RESPONSE_MANAGE_FEEDBACK_SETUP_EDIT.routerLink:
      case dashboardRouteLinks.NPS_MANAGE_NPS_SETUP_EDIT.routerLink:
        this.accessMode = AccessModes.Edit;
        break;

      case dashboardRouteLinks.RESPONSE_MANAGE_FEEDBACK_SETUP_COPY.routerLink:
      case dashboardRouteLinks.NPS_MANAGE_NPS_SETUP_COPY.routerLink:
        this.accessMode = AccessModes.Copy;
        break;

      default:
        this.accessMode = AccessModes.View;
    }

    this.viewOnly = this.accessMode === AccessModes.View;
    this._id = this._route.snapshot.params['id'];
  }

  ngOnInit(): void {
    this._setLoading(true);

    const initSurveyObs: Observable<any> = this._authService
      .getSelectedMenuLevelsListenerObs()
      .pipe(
        take(1),
        concatMap((value: SelectedMenuLevels) => {
          /** Get and store the current selected menu level */
          this._selectedMenuLevels = value;

          /** Get surveys from cache stored by survey-setup */
          return this._responseAIService.getSurveysListenerObs();
        }),
        map((surveys) => {
          return surveys.find(
            (survey: SurveyStruct) => survey._id === this._id
          );
        }),
        tap((response) => {
          if (this.accessMode === AccessModes.Copy && !!response) {
            this.currentSurveyData = <SurveyStruct>{ ...response };
            this.currentSurveyData.code =
              this.currentSurveyData.code.substring(
                0,
                this.surveyFieldLengthConfig.code - 2
              ) + '_c';
            this.currentSurveyData.name =
              this.currentSurveyData.name.substring(
                0,
                this.surveyFieldLengthConfig.code - 5
              ) + '_copy';
          } else {
            this.currentSurveyData = <SurveyStruct>response;
          }

          if (this.accessMode !== AccessModes.Add) {
            this._currentHoldingOrg = this.currentSurveyData?.holdingOrg;
            this._currentMemberOrg = this.currentSurveyData?.memberOrg;
          }

          this.questionTypes = this._responseAIService.getDisplayQuestionTypes(
            this.currentFeature
          );
        }),
        concatMap(() => {
          return this._responseAIService.getOrgDrDwData();
        }),
        take(1),
        concatMap((orgDrDwData: OrgDrDwEmitStruct) => {
          this._orgDrDwData = orgDrDwData;

          return this._responseAIService.getSavedSectionStructs(
            this.currentFeature,
            this._orgDrDwData
          );
        }),
        concatMap((savedSections) => {
          this.savedSectionStructs = savedSections;

          return this._responseAIService.getSavedQuestionStructs(
            this.currentFeature,
            this._orgDrDwData
          );
        }),
        tap((savedQuestions) => (this.savedQuestionsStructs = savedQuestions))
      );

    this._surveysListenerObsSub$ = this._loadingService
      .showProgressBarUntilCompleted(initSurveyObs, 'query')
      .subscribe(
        async () => {
          this.channelConfig.enableEmail = !!this.currentSurveyData?.channel
            ?.email?.subject;
          this.channelConfig.enableSms = !!this.currentSurveyData?.channel?.sms
            ?.text;
          this.channelConfig.enableWhatsApp = !!this.currentSurveyData?.channel
            ?.whatsApp?.text;

          await this._loadFormControls();

          this.survey = await new Survey(
            this.currentSurveyData?.surveyType ?? SurveyType.single,
            this.currentSurveyData?.surveyPages?.length > 0
              ? await this._reconstructSurveyClasses()
              : <Page[]>[]
          );

          this._setLoading(false);
        },
        (error) => {
          this._setLoading(false);
        }
      );
  }

  ngOnDestroy(): void {
    this._surveysListenerObsSub$?.unsubscribe();
  }

  getTitle(): string {
    return `${this.accessMode} ${
      this.currentFeature === DataDomainConfig.nps ? 'NPS' : 'Response AI'
    } Survey`;
  }

  getSubTitle(): string {
    return generateNameAndCodeString(
      this.form?.controls?.code.value,
      this.form?.controls?.name.value
    );
  }

  /** Can User Add or Edit */
  isCanDo(): boolean {
    return (
      this.accessMode === AccessModes.Add ||
      this.accessMode === AccessModes.Edit ||
      this.accessMode === AccessModes.Copy
    );
  }

  isDisableButton(): boolean {
    if (this.isLoading || !this.form.valid || !this.survey) return true;
    return false;
  }

  // isDisableUpdateOnlyButton(): boolean {
  //   return (this.channelConfig.enableEmail && this.form.get('channel.email').)
  // }

  getActionButtonText(): string {
    if (
      this.accessMode === AccessModes.Add ||
      this.accessMode === AccessModes.Copy
    )
      return 'Add';
    if (this.accessMode === AccessModes.Edit) return 'Update';
    return '';
  }

  /** To be called by the CanDeactivate service */
  isSubMitMode(): boolean {
    return this._submitMode;
  }

  async onToggleMessageTemplateConfig(
    elHandle: MatSlideToggle,
    messageType: MessageType
  ) {
    if (this.viewOnly) return;
    const currentValueTo = elHandle.checked;

    if (currentValueTo) {
      const response = await this._dialogService.openSystemDialog({
        alertType: SystemDialogType.warning_alert_yes_no,
        dialogConditionType: DialogConditionType.prompt_custom_data,
        title: `Confirm Clear Message Template (${messageType})`,
        body: `Do you want to clear message template setup for ${messageType}?`,
      });

      if (response === SystemDialogReturnType.continue_no) return;
    }

    elHandle.checked = !currentValueTo;
    switch (messageType) {
      case 'email':
        this.channelConfig.enableEmail = !currentValueTo;
        this._setRequiredForMessageTemplate(
          'email',
          this.channelConfig.enableEmail
        );
        break;

      case 'sms':
        this.channelConfig.enableSms = !currentValueTo;
        this._setRequiredForMessageTemplate(
          'sms',
          this.channelConfig.enableSms
        );
        break;

      case 'whatsApp':
        this.channelConfig.enableWhatsApp = !currentValueTo;
        this._setRequiredForMessageTemplate(
          'whatsApp',
          this.channelConfig.enableWhatsApp
        );
        break;
    }

    this.selectedMessageTemplateTabIndex = 0;
  }

  onUserNavigation(
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot
  ): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.form?.dirty) {
        /** CanDeactivate would be triggered when user is explicitly routed back to the HoldingOrgs page
         * after successful submission of the record here. Allow CanDeactivate in this case, hence the _submitMode check */
        if (this._submitMode) resolve(true);

        this._dialogService
          .openSystemDialog({
            alertType: SystemDialogType.warning_alert_yes_no,
            dialogConditionType:
              DialogConditionType.prompt_discard_data_changes,
          })
          .then((response) => {
            /** Allow moving away from current page in CanDeactivate */
            if (response === SystemDialogReturnType.continue_yes) {
              resolve(true);
            } else {
              /** Complex/Tricky part: CanDeactivate did not allow the page/route to change
               * BUT it did retained the menu selection which the user tried navigating to.
               * Fixed that to navigate back to current menu selection. */
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

  onPreSubmit(closeSurveyWindow = false): void {
    if (this.viewOnly || !this.form) return;

    const surveyQuestionInvalid = this.isAnySurveyQuestionInvalid;

    if (surveyQuestionInvalid) {
      this.selectedPageTabIndex = surveyQuestionInvalid.pageTabIndex;
      this.survey.surveyPages[
        surveyQuestionInvalid.pageTabIndex
      ].selectedSectionTabIndex = surveyQuestionInvalid.sectionTabIndex;

      this._snackbarService.showError(
        `Please resolve validation errors in Survey questions on page ${
          surveyQuestionInvalid.pageTabIndex + 1
        } and section ${surveyQuestionInvalid.sectionTabIndex + 1}!`,
        3000
      );
      return;
    }

    if (this.channelConfig.enableEmail) {
      /** Since unlayer email component methods uses a callback  */
      this._setFieldValuesFromEditor(closeSurveyWindow);
    } else {
      this._onSubmit(closeSurveyWindow);
    }
  }

  private _setFieldValuesFromEditor(closeSurveyWindow = false): void {
    let tempJsonData: any;
    let tempHtmlData: any;

    this.editor.saveDesign((data) => {
      tempJsonData = JSON.stringify(data);
      this.editor.exportHtml((data) => {
        tempHtmlData = data;

        this.form.get('channel.email.templateData')?.setValue(tempJsonData);
        this.form.get('channel.email.body')?.setValue(tempHtmlData.html);
        console.log({ tempJsonData }, { tempHtmlData });

        this._zone.run(() => this._onSubmit(closeSurveyWindow));
      });
    });
  }

  private _onSubmit(closeSurveyWindow = false): void {
    this._setLoading(true);
    let payload: any = {};

    let channel = {};
    if (this.channelConfig.enableEmail) {
      channel = {
        email: this.form.get('channel.email')?.value,
      };
    }

    if (this.channelConfig.enableSms) {
      channel = {
        ...channel,
        sms: this.form.get('channel.sms')?.value,
      };
    }
    if (this.channelConfig.enableWhatsApp) {
      channel = {
        ...channel,
        whatsApp: this.form.get('channel.whatsApp')?.value,
      };
    }

    payload = {
      ...this.form.value,
      channel,
      ...this.survey,
      surveyType:
        this.survey.surveyPages.length > 1
          ? SurveyType.multi
          : SurveyType.single,
    };

    consoleLog({
      valuesArr: [
        'survey onSubmit()',
        'this.accessMode',
        this.accessMode,

        'payload',
        payload,
      ],
    });

    const createOrUpdate: Observable<any> =
      this.accessMode === AccessModes.Edit
        ? this._responseAIService.updateSurvey(
            this.currentFeature,
            this._id,
            payload
          )
        : this._responseAIService.createSurvey(this.currentFeature, payload);

    this._loadingService
      .showProgressBarUntilCompleted(createOrUpdate)
      .subscribe(
        (response) => {
          this._setLoading(false);
          this.form.markAsPristine();

          this._snackbarService.showSuccess(
            `Survey '${payload?.name}(${payload?.code})' ${
              this.accessMode === AccessModes.Edit ? 'updated' : 'created'
            } successfully!`
          );

          if (
            this.accessMode === AccessModes.Add ||
            this.accessMode === AccessModes.Copy ||
            (this.accessMode === AccessModes.Edit && closeSurveyWindow)
          ) {
            /** Set submit mode to true, so that CanDeactivate knows to allow navigation for this explicit routing */
            this._submitMode = true;
            this.onCancel();
          }
        },
        (error) => {
          this._setLoading(false);
        }
      );
  }

  onCancel(): void {
    /** Go back two-levels up to Roles, for accessMode other than 'Add'. This explicit redirection should trigger CanDeactivate */
    this._router.navigate(
      [this.accessMode === AccessModes.Add ? '../' : '../../'],
      { relativeTo: this._route }
    );
  }

  /** The object data based on interfaces needs to be converted to class objects to use the underlying class methods */
  private _reconstructSurveyClasses(): Promise<Page[]> {
    return new Promise((resolve) => {
      const surveyPages: Page[] = this.currentSurveyData.surveyPages.map(
        (surveyPage: SurveyPage) =>
          new Page(
            surveyPage.pageNumber,
            surveyPage.pageHeading,
            surveyPage.pageSections.map(
              (pageSection: SurveySection) =>
                new Section(
                  pageSection.sectionNumber,
                  pageSection.sectionHeading,
                  pageSection.sectionQuestions.map(
                    (sectionQuestion: SurveyQuestion) =>
                      new Question(
                        sectionQuestion.questionNumber,
                        sectionQuestion.questionText,
                        sectionQuestion.questionType,
                        sectionQuestion.questionTypeStructure,
                        sectionQuestion.required,
                        sectionQuestion.responseIdentifierText,
                        sectionQuestion.questionNumberOrderToDisplay,
                        sectionQuestion.subQuestionText
                      )
                  )
                )
            )
          )
      );

      resolve(surveyPages);
    });
  }

  private _loadFormControls(): void {
    console.log('_loadFormControls');

    this.form.patchValue({
      dataDomain: this.currentSurveyData?.dataDomain ?? this.currentFeature,
      holdingOrg: this._currentHoldingOrg,
      memberOrg: this._currentMemberOrg,
      code: this.currentSurveyData?.code,
      name: this.currentSurveyData?.name,
      introText: this.currentSurveyData?.introText,
      status: this.currentSurveyData?.status ?? 1,
      title: this.currentSurveyData?.title,
      showLogo:
        this.accessMode === AccessModes.Add
          ? true
          : this.currentSurveyData?.showLogo,
    });

    this._setRequiredForMessageTemplate(
      'email',
      this.channelConfig.enableEmail
    );
    this._setRequiredForMessageTemplate('sms', this.channelConfig.enableSms);
    this._setRequiredForMessageTemplate(
      'whatsApp',
      this.channelConfig.enableWhatsApp
    );

    this.form.get('channel.email')?.patchValue(<SurveyEmailTemplate>{
      subject: this.currentSurveyData?.channel?.email?.subject,
      body: this.currentSurveyData?.channel?.email?.body,
      templateData: this.currentSurveyData?.channel?.email?.templateData,
    });

    this.form.get('channel.sms')?.patchValue(<SurveySmsTemplate>{
      text: this.currentSurveyData?.channel?.sms?.text,
    });

    this.form.get('channel.whatsApp')?.patchValue(<SurveyWhatsAppTemplate>{
      text: this.currentSurveyData?.channel?.whatsApp?.text,
    });

    let tempBody: any;
    tempBody = this.currentSurveyData?.channel?.email?.templateData
      ? JSON.parse(this.currentSurveyData?.channel?.email?.templateData)
      : undefined;

    if (this.viewOnly) {
      this.form.disable();
    }

    setTimeout(() => {
      if (tempBody) {
        this.editor?.loadDesign(tempBody);
      }
    }, 300);

    this.surveyOrgData = {
      currentOrgIdentifier: this._currentOrgIdentifier,
      holdingOrg: this._currentHoldingOrg,
      memberOrg: this._currentMemberOrg,
    };
  }

  private _setLoading(value: boolean): void {
    this.isLoading = value;
    if (!value) this._loadingService.loadingOff();
  }

  get isDisabledSubmitSurvey(): boolean {
    return (
      this.survey.surveyPages.length === 0 ||
      (this.isAnySurveyQuestionInvalid ? true : false)
    );
  }

  get isAnySurveyQuestionInvalid(): InvalidPageIndexes | undefined {
    if (!this.survey) return undefined;
    let returnTabsInvalid: InvalidPageIndexes | undefined;

    for (let i = 0; i < this.survey.surveyPages.length; i++) {
      const page = this.survey.surveyPages[i];
      for (let j = 0; j < page.pageSections.length; j++) {
        const section = page.pageSections[j];
        for (let k = 0; k < section.sectionQuestions.length; k++) {
          const question = section.sectionQuestions[k];

          if (question && question.isQuestionFormInvalid) {
            returnTabsInvalid = {
              pageTabIndex: i,
              sectionTabIndex: j,
            };

            return returnTabsInvalid;
          }
        }
      }
    }

    return returnTabsInvalid;
  }

  private _setRequiredForMessageTemplate(
    messageType: MessageType,
    isRequired: boolean
  ): void {
    Promise.resolve().then(() => {
      switch (messageType) {
        case 'email':
          if (isRequired) {
            this.form
              .get('channel.email.subject')
              ?.setValidators(Validators.required);
          } else {
            this.form.get('channel.email.subject')?.clearValidators();
          }

          this.form.get('channel.email.subject')?.updateValueAndValidity();
          return;

        case 'sms':
          if (isRequired) {
            this.form
              .get('channel.sms.text')
              ?.setValidators(Validators.required);
          } else {
            this.form.get('channel.sms.text')?.clearValidators();
          }

          this.form.get('channel.sms.text')?.updateValueAndValidity();
          return;

        case 'whatsApp':
          if (isRequired) {
            this.form
              .get('channel.whatsApp.text')
              ?.setValidators(Validators.required);
          } else {
            this.form.get('channel.whatsApp.text')?.clearValidators();
          }

          this.form.get('channel.whatsApp.text')?.updateValueAndValidity();
          return;
      }
    });
  }

  loadEditor(evt: any): void {
    console.log(
      'loadEditor',
      !!this.form.get('channel.email.templateData')?.value
    );

    let tempBody: any;
    tempBody = this.form.get('channel.email.templateData')?.value
      ? JSON.parse(this.form.get('channel.email.templateData')?.value)
      : unsubscribeContent;

    setTimeout(() => {
      this.editor.loadDesign(tempBody);
    }, 500);
  }

  getTotalQuestions(page: Page): number {
    const totalLength = page?.pageSections?.map(
      (section) => section?.sectionQuestions?.length ?? 0
    );
    /** 05022021 - Gaurav - Fixed bug for reducing empty array */
    return totalLength.length > 0
      ? totalLength.reduce((total, num) => total + num)
      : 0;
  }

  onPageMove(setCurrentPageTabIndex: number): void {
    this.selectedPageTabIndex = setCurrentPageTabIndex;
  }

  onPageAdd(): void {
    if (this.survey?.surveyPages?.length > 0) {
      this.selectedPageTabIndex = this.survey.surveyPages.length - 1;
    }
  }
}
