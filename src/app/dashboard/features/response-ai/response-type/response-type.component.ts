/** 17122020 - Gaurav - Init version
 * 22122020 - Gaurav - Moved response type related fields to here
 * 28122020 - Gaurav - Added preview tab
 * 04212021 - Gaurav - Added NPS related code, to reuse this object
 * 19012021 - Gaurav - Added code and removed displayName
 * 20012021 - Gaurav - Added subtitle (used common util method)
 * 22012021 - Gaurav - Fixed issue by replacing identifier for the OrgId received
 * 22012021 - Gaurav - Added subQuestionText field
 * 08022021 - Gaurav - Added code for new progress-bar service
 * 22022021 - Gaurav - JIRA Bug CA-158: implement feature guard for Response AI/NPS Questions create/edit page
 * 15032021 - Gaurav - Use enum AccessModes from constants file instead of local one */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { delay, map, startWith, switchMap, take, tap } from 'rxjs/operators';
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
import { OrgIdentifier } from 'src/app/dashboard/shared/components/org-dropdownlist/org-dropdownlist.component';
import { TemplateFieldValidationService } from 'src/app/dashboard/shared/services/template-field-validation.service';
import { LoadingService } from 'src/app/shared/services/loading.service';
import {
  consoleLog,
  generateNameAndCodeString,
} from 'src/app/shared/util/common.util';
import { QuestionTypes } from '../data-models/question.model';
import {
  ComponentCategory,
  ResponseTypeStruct,
} from '../data-models/survey.model';
import { ResponseAIService } from '../response-ai.service';

@Component({
  selector: 'app-response-type',
  templateUrl: './response-type.component.html',
  styleUrls: ['./response-type.component.css'],
})
export class ResponseTypeComponent implements OnInit, OnDestroy {
  isLoading = false;
  selectedIndex = 0;
  viewOnly = false;
  readonly componentCategory = ComponentCategory;
  readonly questionTypesEnum = QuestionTypes;
  readonly accessModes = AccessModes;
  readonly dataDomainList = DataDomainConfig;
  readonly questionFieldLengthConfig = {
    code: 10,
    name: 50,
  };
  private _questionsListenerObsSub$!: Subscription;
  private _id!: string;
  accessMode: AccessModes = AccessModes.View; //default

  selectedResponseCategory = ComponentCategory.question;
  selectedQuestionType!: QuestionTypes | undefined;
  displayQuestionTypes!: any[];
  currentResponseTypeData!: ResponseTypeStruct;
  currentHoldingOrgId!: string;
  currentMemberOrgId!: string;

  form: FormGroup = new FormGroup({
    dataDomain: new FormControl(DataDomainConfig.response, Validators.required),
    holdingOrg: new FormControl(null),
    memberOrg: new FormControl(null),
    code: new FormControl(null, Validators.required),
    name: new FormControl(null, Validators.required),
    componentCategory: new FormControl(null, Validators.required),
    status: new FormControl(1, Validators.required),
  });

  private _formPayload: any;
  isFormValid$!: Observable<boolean>;
  currentFeature!: DataDomainConfig;

  /** For the CanDeactivate */
  private _submitMode = false;
  private _selectedMenuLevels!: SelectedMenuLevels;

  constructor(
    private _responseAIService: ResponseAIService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _dialogService: DialogService,
    public templateFieldValidationService: TemplateFieldValidationService,
    private _loadingService: LoadingService,
    private _authService: AuthService
  ) {
    /** Set current feature: nps OR response */
    switch (this._route.snapshot.routeConfig?.path) {
      case dashboardRouteLinks.NPS_MANAGE_NPS_MASTER_ADD.routerLink:
      case dashboardRouteLinks.NPS_MANAGE_NPS_MASTER_EDIT.routerLink:
      case dashboardRouteLinks.NPS_MANAGE_NPS_MASTER_COPY.routerLink:
      case dashboardRouteLinks.NPS_MANAGE_NPS_MASTER_VIEW.routerLink:
      case dashboardRouteLinks.NPS_NPS_MASTER_VIEW.routerLink:
        this.currentFeature = DataDomainConfig.nps;
        break;

      default:
        this.currentFeature = DataDomainConfig.response;
    }

    /** Set access mode, default is view-only */
    switch (this._route.snapshot.routeConfig?.path) {
      case dashboardRouteLinks.RESPONSE_MANAGE_RESPONSE_TYPES_ADD.routerLink:
      case dashboardRouteLinks.NPS_MANAGE_NPS_MASTER_ADD.routerLink:
        if (
          <OrgIdentifier>this._route?.snapshot?.queryParams?.holOrMol ===
          OrgIdentifier.mol
        ) {
          this.currentMemberOrgId = this._route?.snapshot?.queryParams?.orgId;
        } else {
          this.currentHoldingOrgId = this._route?.snapshot?.queryParams?.orgId;
        }

        this.accessMode = this.accessModes.PreAdd;
        break;

      case dashboardRouteLinks.RESPONSE_MANAGE_RESPONSE_TYPES_EDIT.routerLink:
      case dashboardRouteLinks.NPS_MANAGE_NPS_MASTER_EDIT.routerLink:
        this.accessMode = this.accessModes.Edit;
        break;

      case dashboardRouteLinks.RESPONSE_MANAGE_RESPONSE_TYPES_COPY.routerLink:
      case dashboardRouteLinks.NPS_MANAGE_NPS_MASTER_COPY.routerLink:
        this.accessMode = this.accessModes.Copy;
        break;

      default:
        this.accessMode = this.accessModes.View;
        this.viewOnly = true;
    }
  }

  ngOnInit(): void {
    this._setLoading(true);
    this.displayQuestionTypes = this._responseAIService.getDisplayQuestionTypes(
      this.currentFeature
    );

    this._id = this._route.snapshot.params['id'];

    const initQuestionsObs: Observable<any> = this._authService
      .getSelectedMenuLevelsListenerObs()
      .pipe(
        take(1),
        switchMap((value: SelectedMenuLevels) => {
          /** Get and store the current selected menu level */
          this._selectedMenuLevels = value;

          /** Get questions from cache stored by response/nps questions-setup */
          return this._responseAIService.getQuestionsListenerObs();
        }),
        map((resTypes) => {
          return resTypes.find(
            (resType: ResponseTypeStruct) => resType._id === this._id
          );
        }),
        tap((response: any) => {
          // consoleLog({ valuesArr: ['3. inside subscribe response', response] });
          if (this.accessMode === this.accessModes.Copy) {
            /** Extra code to spread the objects, else they would carry over memory reference*/

            this.currentResponseTypeData = <ResponseTypeStruct>{ ...response };
            this.currentResponseTypeData.code =
              this.currentResponseTypeData.code.substring(
                0,
                this.questionFieldLengthConfig.code - 2
              ) + '_c';
            this.currentResponseTypeData.name =
              this.currentResponseTypeData.name.substring(
                0,
                this.questionFieldLengthConfig.code - 5
              ) + '_copy';

            if (
              this.currentResponseTypeData.componentCategory ===
              ComponentCategory.question
            ) {
              /** Pass a copy to avoid reference to copied object's memory location */
              let copyOfQuestionTypeStructure = {
                ...(<ResponseTypeStruct>response).questionTypeStructure,
              };

              if (
                (<ResponseTypeStruct>response)?.questionTypeStructure
                  ?.additionalText
              ) {
                copyOfQuestionTypeStructure = {
                  ...copyOfQuestionTypeStructure,
                  additionalText: {
                    ...(<ResponseTypeStruct>response)?.questionTypeStructure
                      ?.additionalText,
                  },
                };
              }

              this.currentResponseTypeData.questionTypeStructure = copyOfQuestionTypeStructure;
            }

            if (
              this.currentResponseTypeData.componentCategory ===
              ComponentCategory.section
            ) {
              this.currentResponseTypeData.sectionQuestions = (<
                ResponseTypeStruct
              >response).sectionQuestions.map((question: any) => question);
            }
          } else {
            this.currentResponseTypeData =
              <ResponseTypeStruct>response ?? undefined;
          }

          console.log(
            'this.currentResponseTypeData',
            this.currentResponseTypeData
          );

          if (this.currentResponseTypeData?.componentCategory) {
            this.selectedResponseCategory = this.currentResponseTypeData?.componentCategory;
          }

          if (this.selectedResponseCategory === ComponentCategory.question) {
            this.selectedQuestionType = this.currentResponseTypeData?.questionType;
          }

          if (this.currentResponseTypeData?.holdingOrg) {
            this.currentHoldingOrgId = this.currentResponseTypeData?.holdingOrg;
          }

          if (this.currentResponseTypeData?.memberOrg) {
            this.currentMemberOrgId = this.currentResponseTypeData?.memberOrg;
          }
        })
      );

    this._questionsListenerObsSub$ = this._loadingService
      .showProgressBarUntilCompleted(initQuestionsObs, 'query')
      .subscribe(
        async (response) => {
          await this._loadFormControls();
          this._setLoading(false);
        },
        (error) => {
          this._setLoading(false);
        }
      );
  }

  ngOnDestroy(): void {
    this._questionsListenerObsSub$?.unsubscribe();
  }

  getTitle(): string {
    if (this.accessMode === this.accessModes.PreAdd) {
      return `Select ${
        this.currentFeature === DataDomainConfig.nps ? 'NPS' : 'Response AI'
      } Question Category to Add`;
    }
    return `${this.accessMode} ${
      this.currentFeature === DataDomainConfig.nps ? 'NPS' : 'Response AI'
    } Question`;
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
      this.accessMode === this.accessModes.PreAdd ||
      this.accessMode === this.accessModes.Add ||
      this.accessMode === this.accessModes.Edit ||
      this.accessMode === this.accessModes.Copy
    );
  }

  isDisableButton(): boolean {
    /** Do not combine these conditions into one, as they are purposefully separate to act based on access modes */
    if (this.isLoading) return true;

    if (this.accessMode === this.accessModes.PreAdd) {
      if (
        this.selectedResponseCategory === ComponentCategory.question &&
        !this.selectedQuestionType
      ) {
        return true;
      }

      return false;
    }

    // consoleLog({ valuesArr: ['this.form', this.form] });
    // consoleLog({ valuesArr: ['this._formPayload', this._formPayload] });

    if (!this.form.valid || !this._formPayload) return true;

    return false;
  }

  getActionButtonText(): string {
    if (this.accessMode === this.accessModes.PreAdd) return 'Continue';
    if (
      this.accessMode === this.accessModes.Add ||
      this.accessMode === this.accessModes.Copy
    )
      return 'Add';
    if (this.accessMode === this.accessModes.Edit) return 'Update';
    return '';
  }

  /** Get and store emitted form payload from child component */
  getFormPayload($event: any) {
    this._formPayload = $event;
  }

  /** To be called by the CanDeactivate service */
  isSubMitMode(): boolean {
    return this._submitMode;
  }

  onUserNavigation(
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot
  ): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.form?.dirty || !this.form?.valid) {
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

  onSubmit(closeQuestionWindow = false): void {
    if (this.accessMode === this.accessModes.PreAdd) {
      this.accessMode = this.accessModes.Add;
      return;
    }

    console.log('this.form.valid', this.form.valid, 'this.form', this.form);

    if (!this.form.valid || !this._formPayload) return;

    let payload = {
      dataDomain: this.form?.get('dataDomain')?.value,
      holdingOrg: this.form?.get('holdingOrg')?.value,
      memberOrg: this.form?.get('memberOrg')?.value,
      code: this.form?.get('code')?.value,
      name: this.form?.get('name')?.value,
      componentCategory: this.form?.get('componentCategory')?.value,
      status: this.form?.get('status')?.value,
    };

    if (this.selectedResponseCategory === ComponentCategory.question) {
      payload = <ResponseTypeStruct>{
        ...payload,
        questionNumber: this._formPayload.questionNumber,
        questionType: this._formPayload.questionType,
        questionText: this._formPayload.questionText,
        questionTypeStructure: this._formPayload.questionTypeStructure,
        required: this._formPayload.required,
        responseIdentifierText: this._formPayload.responseIdentifierText,
        questionNumberOrderToDisplay: this._formPayload
          .questionNumberOrderToDisplay,
        subQuestionText: this._formPayload.subQuestionText,
      };
    }

    consoleLog({ valuesArr: ['payload', payload] });

    this._setLoading(true);

    const createOrUpdate: Observable<any> =
      this.accessMode === AccessModes.Edit
        ? this._responseAIService.updateQuestion(
            this.currentFeature,
            this._id,
            payload
          )
        : this._responseAIService.createQuestion(this.currentFeature, payload);

    this._loadingService
      .showProgressBarUntilCompleted(createOrUpdate)
      .subscribe(
        (response) => {
          consoleLog({
            valuesArr: [
              'RespType component: onSubmit() => postResponseTypes() response',
              response,
            ],
          });

          this._setLoading(false);
          this.form.markAsPristine();

          if (
            this.accessMode === AccessModes.Add ||
            this.accessMode === AccessModes.Copy ||
            (this.accessMode === AccessModes.Edit && closeQuestionWindow)
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
      [
        this.accessMode === this.accessModes.PreAdd ||
        this.accessMode === this.accessModes.Add
          ? '../'
          : '../../',
      ],
      { relativeTo: this._route }
    );
  }

  onChangeQuestionType(): void {
    this.form.patchValue({
      componentCategory: this.selectedResponseCategory,
    });
  }

  private _loadFormControls(): void {
    /** Important!!! Match the db fields names with the form field names.
     * The submit payload is constructed in the base-type component for common fields, and the questiontypestruct payload is constructed by each respectiv response-type component */
    this.form.patchValue({
      dataDomain:
        this.currentResponseTypeData?.dataDomain ?? this.currentFeature,
      holdingOrg: this.currentHoldingOrgId,
      memberOrg: this.currentMemberOrgId,
      code: this.currentResponseTypeData?.code,
      name: this.currentResponseTypeData?.name,
      componentCategory:
        this.currentResponseTypeData?.componentCategory ??
        this.selectedResponseCategory,
      status: this.currentResponseTypeData?.status ?? 1,
    });

    this.isFormValid$ = this.form.statusChanges.pipe(
      startWith(false),
      map((formStatus) => formStatus === 'VALID' || formStatus === 'DISABLED'),
      delay(0)
    );
  }

  private _setLoading(value: boolean): void {
    this.isLoading = value;

    if (value) {
      this.form.get('name')?.disable();
      this.form.get('code')?.disable();
    } else {
      if (!this.viewOnly) {
        this.form.get('name')?.enable();
        this.form.get('code')?.enable();
      }
      this._loadingService.loadingOff();
    }
  }
}
