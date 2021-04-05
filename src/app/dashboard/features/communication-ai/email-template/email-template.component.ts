/**
 * 02/12/2020 - Ramesh - Init version: Created separate versions for Email template
 * 08022021 - Abhishek - Added getSubtitle() to set subtitle and import generateNameAndCodeString for sub title.
 * 08022021 - Gaurav - Added code for new progress-bar service
 * 15032021 - Gaurav - Use enum AccessModes from constants file instead of local one
 */
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, Subscription } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { HoldingOrg } from 'src/app/dashboard/dashboard.service';
import {
  AccessModes,
  dashboardRouteLinks,
} from '../../../shared/components/menu/constants.routes';
import { CommunicationAIService } from '../communication-ai.service';
import { DialogService } from 'src/app/dashboard/shared/components/dialog/dialog.service';
import { SnackbarService } from 'src/app/shared/components/snackbar.service';
import {
  DialogConditionType,
  SystemDialogReturnType,
  SystemDialogType,
} from 'src/app/dashboard/shared/components/dialog/dialog.model';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { EmailEditorComponent } from 'angular-email-editor';
import {
  consoleLog,
  ConsoleTypes,
  generateNameAndCodeString,
} from 'src/app/shared/util/common.util';
import { LoadingService } from 'src/app/shared/services/loading.service';
import { AuthService, SelectedMenuLevels } from 'src/app/auth/auth.service';
import { unsubscribeContent } from './email-template-content';
import { Channel } from 'src/app/core/enums/template-channel-enum';
/** Created enum, instead of using boolean values, in case more than two filters condition are introduced */

@Component({
  selector: 'app-email-template',
  templateUrl: './email-template.component.html'
})
export class EmailTemplateComponent implements OnInit, OnDestroy {
  isLoading = false;
  accessModes = AccessModes;
  accessMode: AccessModes = AccessModes.View;
  @ViewChild('editor') editor!: EmailEditorComponent;
  @ViewChild(EmailEditorComponent) _emailEditor!: EmailEditorComponent;
  templateFG!: FormGroup;
  templateEmailFG!: FormGroup;
  templateSMSFG!: FormGroup;
  templateWhatsAppFG!: FormGroup;

  private _observableSub$!: Subscription;
  private _showEditComponents = false;
  private _submitMode = false;
  private _selectedMenuLevels!: SelectedMenuLevels;
  private userAccessOrgData: any;
  private _id!: string;
  private _currentTempData: any;
  _emaiEditorHidden: boolean = true;
  selectedHoldingOrgData!: HoldingOrg;
  selectedMemberOrg!: any;

  dataSource!: MatTableDataSource<any>;
  memberOrgList: Array<Object> = [];
  orgLable: string = '';
  templateList: any;
  selectedIndex = 0;
  options = {};
  enableEmail = true;
  enableWhatsApp = false;
  enableSMS = false;


  //to set initial form
  private _initForm() {

    let tempBody: any;
    tempBody =
      this._currentTempData != undefined
        ? JSON.parse(this._currentTempData?.channel?.email?.templateData)
        : '';
    //Template formgroup declaraton
    this.templateFG = new FormGroup({
      memberOrg: new FormControl(
        this.selectedMemberOrg?.name,
        Validators.required
      ),
      tempCode: new FormControl(
        this._currentTempData?.code,
        Validators.required
      ),
      tempName: new FormControl(
        this._currentTempData?.name,
        Validators.required
      ),
      description: new FormControl(
        this._currentTempData?.description,
        Validators.required
      )
    });
    //Template Email formgroup declaration
    this.templateEmailFG = new FormGroup({
      subject: new FormControl(this._currentTempData?.channel?.email?.subject),
    });
    //Temlate SMS formgroup declaration
    this.templateSMSFG = new FormGroup({
      smsText: new FormControl(this._currentTempData?.channel?.sms?.text),
    });
    //Temlate SMS formgroup declaration
    this.templateWhatsAppFG = new FormGroup({
      whatsAppText: new FormControl(
        this._currentTempData?.channel?.whatsApp?.text
      ),
    });
    this.templateFG.controls.memberOrg.disable();
    if (this.accessMode === this.accessModes.Edit) {
      this.templateFG.controls.tempCode.disable();
    }
    this.enableEmail = this._currentTempData?.isEmailEnabled;
    this.enableSMS = this._currentTempData?.isSMSEnabled;
    this.enableWhatsApp = this._currentTempData?.isWhatsAppEnabled;

    if (this.accessMode === this.accessModes.View) {
      this.templateFG.disable();
    }

    setTimeout(() => {
      if (tempBody != '') {
        this.editor?.loadDesign(tempBody);
      }
      this._setLoading(false);
    }, 300);
  }
  constructor(
    private _communicationAIService: CommunicationAIService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _snackbarService: SnackbarService,
    private _dialogService: DialogService,
    private _loadingService: LoadingService,
    private _authService: AuthService
  ) { }

  ngOnInit(): void {
    this._setLoading(true);
    //Getting this member org list from email-template-setup.ts by using with serives
    this.userAccessOrgData = this._communicationAIService.getSelOrgData();
    this.memberOrgList = this.userAccessOrgData?.selOrgInfo?.memberOrgs;
    this.orgLable = this.userAccessOrgData?.orgType;
    this.selectedMemberOrg =
      this.orgLable == 'Holding Org'
        ? this.userAccessOrgData?.selOrgInfo
        : this.userAccessOrgData?.selMemberOrg;
    if (
      this._route.snapshot.routeConfig?.path ===
      dashboardRouteLinks.COMMUNICATION_MANAGE_TEMPLATE_ADD.routerLink
    ) {
      this.accessMode = this.accessModes.Add;
    } else if (
      this._route.snapshot.routeConfig?.path ===
      dashboardRouteLinks.COMMUNICATION_MANAGE_TEMPLATE_EDIT.routerLink
    ) {
      this.accessMode = this.accessModes.Edit;
    } else if (
      this._route.snapshot.routeConfig?.path ===
      dashboardRouteLinks.COMMUNICATION_MANAGE_TEMPLATE_COPY.routerLink
    ) {
      this.accessMode = this.accessModes.Copy;
    }
    this._id = this._route.snapshot.params['id'];

    const initEmailTemplateObs: Observable<any> = this._communicationAIService
      .getTemplateList(this.userAccessOrgData?.searchString)
      .pipe(
        map((temp) => {
          if (this._id) {
            this._currentTempData = temp?.results?.find(
              (temp: { _id: string }) => temp._id === this._id
            );
          }
          return temp;
        })
      );

    this._observableSub$ = this._loadingService
      .showProgressBarUntilCompleted(initEmailTemplateObs, 'query')
      .subscribe(
        async (tempList: any) => {
          await this._initForm();
        },
        (error) => {
          consoleLog({ consoleType: ConsoleTypes.error, valuesArr: [error] });
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
  updateVisibility(type:string ) {
    if (type === Channel.SMS) {
      this.enableSMS = !this.enableSMS
    }
    if (type === Channel.EMAIL) {
      this.enableEmail = !this.enableEmail
    }
    if (type === Channel.WHATSAPP) {
      this.enableWhatsApp = !this.enableWhatsApp
    }
  }
  ngOnDestroy(): void {
    this._observableSub$.unsubscribe();
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
      if (this.templateFG?.dirty) {
        /** 28112020 - Gaurav - Fix: CanDeactivate would be triggered when user is explicitly routed back to the HoldingOrgs page
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
  //to set add/copy/update button text function
  getActionButtonText(): string {
    if (this.accessMode === this.accessModes.Add) return 'Add';
    if (this.accessMode === this.accessModes.Copy) return 'Copy';
    if (this.accessMode === this.accessModes.Edit) return 'Update';
    return '';
  }
  //to show add/edit/copy button function
  isCanDo(): boolean {
    return (
      this.accessMode === this.accessModes.Add ||
      this.accessMode === this.accessModes.Edit ||
      this.accessMode === this.accessModes.Copy
    );
  }
  //on save / update template function
  onSubmit() {
    let tempJsonData: any;
    let tempHtmlData: any;
    let holdingOrgVal: any = null;
    let memberOrgVal: any = null;
    this._setLoading(true);

    this.editor.saveDesign((data) => {
      tempJsonData = JSON.stringify(data);
    });
    this.editor.exportHtml((data) => {
      tempHtmlData = data;
    });
    this.selectedMemberOrg =
      this.orgLable == 'Holding Org'
        ? this.userAccessOrgData?.selOrgInfo
        : this.userAccessOrgData?.selMemberOrg;
    if (this.orgLable == 'Holding Org') {
      holdingOrgVal = this.userAccessOrgData?.selOrgInfo?._id;
      memberOrgVal = null;
    } else {
      holdingOrgVal = null;
      memberOrgVal = this.userAccessOrgData?.selMemberOrg?._id;
    }

    setTimeout(() => {
      let postData = {
        code: this.templateFG.controls['tempCode'].value,
        name: this.templateFG.controls['tempName'].value,
        description: this.templateFG.controls['description'].value,
        memberOrg: memberOrgVal,
        holdingOrg: holdingOrgVal,
        channel: {
          email: {
            subject: this.templateEmailFG.controls['subject'].value,
            templateData: tempJsonData,
            body: tempHtmlData.html,
          },
          sms: {
            text: this.templateSMSFG.controls['smsText'].value,
          },
          whatsApp: {
            text: this.templateWhatsAppFG.controls['whatsAppText'].value,
          },
        },
        isEmailEnabled: this.enableEmail,
        isWhatsAppEnabled: this.enableWhatsApp,
        isSMSEnabled: this.enableSMS,
      };
      const addOrEdit: Observable<any> =
        this.accessMode === this.accessModes.Add ||
          this.accessMode === this.accessModes.Copy
          ? this._communicationAIService.createTemplate(postData)
          : this._communicationAIService.updateTemplate(postData, this._id);

      this._loadingService.showProgressBarUntilCompleted(addOrEdit).subscribe(
        (result) => {
          this.templateFG.reset();
          this._snackbarService.showSuccess(
            `${postData.name} is ${this.accessMode === this.accessModes.Add ||
              this.accessMode === this.accessModes.Copy
              ? 'added'
              : 'updated'
            } successfully!`
          );

          this._setLoading(false);

          this._router.navigate(
            [this.accessMode === this.accessModes.Add ? '..' : '../../'],
            { relativeTo: this._route }
          );
        },
        (error) => {
          consoleLog({ consoleType: ConsoleTypes.error, valuesArr: [error] });
          this._setLoading(false);
        }
      );
    }, 1000);
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
    return this.accessMode + ' Manage Message Template';
  }
  _editorLoaded(evt: any) {
    let tempBody: any;
    tempBody =
      this._currentTempData != undefined && this._currentTempData?.channel?.email?.templateData
        ? JSON.parse(this._currentTempData?.channel?.email?.templateData)
        : unsubscribeContent;
    setTimeout(() => {
      this.editor.loadDesign(tempBody);
    }, 400);
  }

  //Tab change function
  tabChangeFun(evt: any) {
    let tabName = evt?.tab?.textLabel;
    if (tabName == 'Email') {
      this._emaiEditorHidden = false;
    } else {
      this._emaiEditorHidden = true;
    }
  }

  getSubTitle(): string {
    return generateNameAndCodeString(
      this.templateFG?.controls?.tempCode.value,
      this.templateFG?.controls?.tempName.value
    );
  }

  private _setLoading(value: boolean): void {
    this.isLoading = value;
    if (!value) this._loadingService.loadingOff();
  }
}
