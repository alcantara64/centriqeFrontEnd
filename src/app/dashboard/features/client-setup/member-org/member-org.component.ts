/** 27/11/2020 - Gaurav - Init version: Created separate versions for Holding and Member org compoents for ease in software maintenance
 * 28112020 - Gaurav - Added Config tab CRU operations
 * 28/11/2020 - Gaurav - Fix: CanDeactivate should allow navigation for explicit routing by this component
 * (e.g. when user is routed back to org page on sucessful create or update of record)
 * 09122020 - Frank - Added subtitle
 * 08022021 - Gaurav - Added code for new progress-bar service
 * 15032021 - Gaurav - Use enum AccessModes from constants file instead of local one
 */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { take, tap } from 'rxjs/operators';

import {
  AccessModes,
  dashboardRouteLinks,
} from 'src/app/dashboard/shared/components/menu/constants.routes';

/** Services */
import {
  DashboardService,
  HoldingOrg,
} from 'src/app/dashboard/dashboard.service';
import { DialogService } from 'src/app/dashboard/shared/components/dialog/dialog.service';
import { SnackbarService } from 'src/app/shared/components/snackbar.service';
import { ClientSetupService } from '../client-setup.service';
import {
  DialogConditionType,
  SystemDialogReturnType,
  SystemDialogType,
} from 'src/app/dashboard/shared/components/dialog/dialog.model';

import {
  consoleLog,
  ConsoleTypes,
  generateNameAndCodeString,
} from 'src/app/shared/util/common.util';
import { LoadingService } from 'src/app/shared/services/loading.service';
import { AuthService, SelectedMenuLevels } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-member-org',
  templateUrl: './member-org.component.html'
})
export class MemberOrgComponent implements OnInit, OnDestroy {
  isLoading = false;
  accessModes = AccessModes;
  accessMode: AccessModes = AccessModes.View;
  private _observableSub$!: Subscription;
  private _selectedMenuLevels!: SelectedMenuLevels;
  private _submitMode = false;

  private _tabIndex = {
    ORG_PROFILE: 0,
    ORG_CONFIG: 1,
  };
  selectedIndex = 0;

  private _holdingOrgId!: string;
  private _memberOrgId!: string;
  private _currentOrgData: any;
  orgProfileForm!: FormGroup;
  orgConfigForm!: FormGroup;
  maxOrgNameLength = 50;

  constructor(
    private _clientSetupService: ClientSetupService,
    private _dashboardService: DashboardService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _snackbarService: SnackbarService,
    private _dialogService: DialogService,
    private _loadingService: LoadingService,
    private _authService: AuthService
  ) {}

  ngOnInit(): void {
    this._setLoading(true);

    if (
      this._route.snapshot.routeConfig?.path ===
      dashboardRouteLinks.CLIENT_SETUP_MANAGE_MEMBERORG_ADD.routerLink
    ) {
      this.accessMode = this.accessModes.Add;
    } else if (
      this._route.snapshot.routeConfig?.path ===
      dashboardRouteLinks.CLIENT_SETUP_MANAGE_MEMBERORG_EDIT.routerLink
    ) {
      this.accessMode = this.accessModes.Edit;
    }

    this._memberOrgId = this._route.snapshot.params['id'];

    /** Get the currently fetched member org list */
    const getOrgsObs: Observable<any> = this._clientSetupService
      .getMemberOrgListListener()
      .pipe(
        tap(async (orgs) => {
          /** Extract the data from the member org list for the EDIT or VIEW memberOrgId */
          if (this._memberOrgId) {
            this._currentOrgData = orgs.find(
              (org: { _id: string }) => org._id === this._memberOrgId
            );
          }

          if (this._currentOrgData) {
            consoleLog({
              valuesArr: ['current member org data', this._currentOrgData],
            });
          } else {
            consoleLog({
              consoleType: ConsoleTypes.warn,
              valuesArr: ['current member org data', this._currentOrgData],
            });
          }

          await this._initForm();
        })
      );

    this._observableSub$ = this._loadingService
      .showProgressBarUntilCompleted(getOrgsObs, 'query')
      .subscribe(
        () => {
          this._setLoading(false);
        },
        (error) => {
          this._setLoading(false);
        }
      );

    /** Get the current globally selected Holding Org from the header sub-menu */
    this._dashboardService
      .getCurrentHoldingOrgListenerObs()
      .pipe(take(1))
      .subscribe((selectedHoldingOrgData: HoldingOrg) => {
        console.log({ selectedHoldingOrgData });
        this._holdingOrgId = selectedHoldingOrgData._id;
      });

    /** Get and store the current selected menu level */
    this._authService
      .getSelectedMenuLevelsListenerObs()
      .pipe(take(1))
      .subscribe(
        (value: SelectedMenuLevels) => (this._selectedMenuLevels = value)
      );
  }

  ngOnDestroy(): void {
    this._observableSub$.unsubscribe();
  }

  onSubmit(): void {
    //Safety check
    if (this.accessMode === this.accessModes.View) return;

    if (!this.orgProfileForm.valid) return;

    this._setLoading(true);

    let payload = {
      name: this.orgProfileForm.controls['name'].value,
      code: this.orgProfileForm.controls['code'].value,
      addressLine1: this.orgProfileForm.controls['addressLine1'].value,
      addressLine2: this.orgProfileForm.controls['addressLine2'].value,
      zipCode: this.orgProfileForm.controls['zipCode'].value,
      city: this.orgProfileForm.controls['city'].value,
      state: this.orgProfileForm.controls['state'].value,
      phone: this.orgProfileForm.controls['phone'].value,
      country: this.orgProfileForm.controls['country'].value,
      fax: this.orgProfileForm.controls['fax'].value,
      tollFreeNumber: this.orgProfileForm.controls['tollFreeNumber'].value,
      email: this.orgProfileForm.controls['email'].value,
      websiteAddress: this.orgProfileForm.controls['websiteAddress'].value,
      status:
        this.accessMode === this.accessModes.Add
          ? 1
          : this._currentOrgData.status,
      /** 2020-12-08 FK - Added fields for new messaging channels */
      defaultEmailSender: this.orgConfigForm.controls['defaultEmailSender']
        .value,
      defaultWhatsAppSender: this.orgConfigForm.controls[
        'defaultWhatsAppSender'
      ].value,
      defaultSmsSender: this.orgConfigForm.controls['defaultSmsSender'].value,
    };

    // console.log('member org payload', payload);

    const addOrEdit: Observable<any> =
      this.accessMode === this.accessModes.Add
        ? this._clientSetupService.createMemberOrg({
            ...payload,
            holdingOrg: this._holdingOrgId,
          })
        : this._clientSetupService.updateMemberOrg(this._memberOrgId, payload);

    this._loadingService.showProgressBarUntilCompleted(addOrEdit).subscribe(
      (result) => {
        /** Show snackbar to user */
        this._snackbarService.showSuccess(
          `${payload.name} is ${
            this.accessMode === this.accessModes.Add ? 'added' : 'updated'
          } successfully!`
        );

        this._setLoading(false);

        /** 28/11/2020 - Gaurav - Fix: Set submit mode to true, so that CanDeactivate knows to allow navigation
         * for this explicit routing */
        this._submitMode = true;
        /** Take user back to memberOrg setup page, which fetches the orgs and updates listeners on ngOnInit.
         * So fetching the memberOrgs again to refresh data is not required here */
        this._router.navigate(
          [this.accessMode === this.accessModes.Add ? '..' : '../../'],
          { relativeTo: this._route }
        );
      },
      (error) => {
        /** Shall be handled by the Http Interceptor */
        consoleLog({ consoleType: ConsoleTypes.error, valuesArr: [error] });
        this._setLoading(false);
      }
    );
  }

  onCancel(): void {
    /** Check if the data is dirty/modified on the form, prompt user to save changes.
     * Also apply CanDeactivate in the route for any pending changes */

    /** Go back two-levels up to memberOrg, for accessMode other than 'Add' */
    this._router.navigate(
      [this.accessMode === this.accessModes.Add ? '..' : '../../'],
      { relativeTo: this._route }
    );
  }

  /** To be called by the CanDeactivate service */
  onUserNavigation(
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot
  ): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.orgProfileForm?.dirty) {
        /** 28112020 - Gaurav - Fix: CanDeactivate would be triggered when user is explicitly routed back to the Orgs page
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

  getTitle(): string {
    return `${this.accessMode} Member Organization`;
  }

  getSubTitle(): string {
    return generateNameAndCodeString(
      this.orgProfileForm?.controls?.code.value,
      this.orgProfileForm?.controls?.name.value
    );
  }

  isCanDo(): boolean {
    return (
      this.accessMode === this.accessModes.Add ||
      this.accessMode === this.accessModes.Edit
    );
  }

  isSubMitMode(): boolean {
    return this._submitMode;
  }

  getActionButtonText(): string {
    if (this.accessMode === this.accessModes.Add) return 'Add';
    if (this.accessMode === this.accessModes.Edit) return 'Update';
    return '';
  }

  private _setLoading(value: boolean): void {
    this.isLoading = value;
    if (!value) this._loadingService.loadingOff();
  }

  private _initForm() {
    this.orgProfileForm = new FormGroup({
      code: new FormControl(this._currentOrgData?.code, Validators.required),
      name: new FormControl(this._currentOrgData?.name, [
        Validators.required,
        Validators.maxLength(this.maxOrgNameLength),
      ]),
      addressLine1: new FormControl(
        this._currentOrgData?.addressLine1,
        Validators.required
      ),
      addressLine2: new FormControl(this._currentOrgData?.addressLine2),
      country: new FormControl(
        this._currentOrgData?.country,
        Validators.required
      ),
      state: new FormControl(this._currentOrgData?.state, Validators.required),
      city: new FormControl(this._currentOrgData?.city),
      zipCode: new FormControl(
        this._currentOrgData?.zipCode,
        Validators.required
      ),
      phone: new FormControl(this._currentOrgData?.phone, Validators.required),
      fax: new FormControl(this._currentOrgData?.fax),
      tollFreeNumber: new FormControl(this._currentOrgData?.tollFreeNumber),
      email: new FormControl(this._currentOrgData?.email, [
        Validators.email,
        Validators.required,
      ]),
      websiteAddress: new FormControl(
        this._currentOrgData?.websiteAddress,
        Validators.required
      ),
    });

    this.orgConfigForm = new FormGroup({
      defaultEmailSender: new FormControl(
        this._currentOrgData?.defaultEmailSender ?? null
      ),
      /** 2020-12-08 FK - Added fields for new messaging channels */
      defaultWhatsAppSender: new FormControl(
        this._currentOrgData?.defaultWhatsAppSender ?? null
      ),
      defaultSmsSender: new FormControl(
        this._currentOrgData?.defaultSmsSender ?? null
      ),
    });

    if (this.accessMode === this.accessModes.Edit)
      this.orgProfileForm.controls.code.disable();

    if (this.accessMode === this.accessModes.View) {
      this.orgProfileForm.disable();
      this.orgConfigForm.disable();
    }
  }
}
