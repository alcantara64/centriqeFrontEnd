/** 25112020 - Gaurav - Init version: Component to ADD/EDIT/VIEW Holding Org
 * 26112020 - Gaurav - Added update and add holding org code
 * 27112020 - Gaurav - Added CanDeactivate guard for unsaved changes
 * 28112020 - Gaurav - Added Config tab CRU operations
 * 28/11/2020 - Gaurav - Fix: CanDeactivate should allow navigation for explicit routing by this component
 * (e.g. when user is routed back to org page on sucessful create or update of record)
 * 30112020 - Gaurav - Modified to use dataDomainConfig object instead of an array
 * 09122020 - Frank - Made all dataDomainConfig objects required
 * 09122020 - Frank - Added subtitle
 * 10122020 - Gaurav - Fixed check-box edit issue by modifying my crap check-box handling logic
 * 10122020 - Gaurav - Fixed to remove unnecessary code for radio boxes
 * 16122020 - Gaurav - Add 'Healthcare' to business vertical drop-down (issue tracker# 35)
 * 08022021 - Gaurav - Added code for new progress-bar service
 * 09022021 - Abhishek - Added holdingOrgLogoUrl property for holding org logo preview.
 * 09022021 - Gaurav - Show mat-progress-spinner on Submit instead of mat-progress-bar
 * 15032021 - Gaurav - Use enum AccessModes from constants file instead of local one
 * 22032021 - Gaurav - JIRA-CA-220: Org Config - UI for Data Attribute configuration
 */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable, of, Subscription } from 'rxjs';

import {
  AccessModes,
  dashboardRouteLinks,
} from '../../../shared/components/menu/constants.routes';

/** Services */
import { ClientSetupService } from '../client-setup.service';
import { SnackbarService } from 'src/app/shared/components/snackbar.service';
import { DialogService } from 'src/app/dashboard/shared/components/dialog/dialog.service';
import {
  DialogConditionType,
  SystemDialogReturnType,
  SystemDialogType,
} from 'src/app/dashboard/shared/components/dialog/dialog.model';
import { delay, map, switchMap, take, tap } from 'rxjs/operators';

import {
  consoleLog,
  ConsoleTypes,
  generateNameAndCodeString,
} from 'src/app/shared/util/common.util';
import { LoadingService } from 'src/app/shared/services/loading.service';
import { AuthService, SelectedMenuLevels } from 'src/app/auth/auth.service';
import {
  CustomerDataAttributes,
  OrgDataAttributesFormData,
} from '../../../shared/models/data-attributes.model';
import { DataAttributes } from 'src/app/dashboard/shared/components/data-attributes/classes/data-attributes';

/** Combine dataDomains Statics and dataDomainConfig values */
interface DataBinding {
  businessName: string;
  mode: string;
  name: string;
  key: string;
  holdingOrgLevel: boolean;
  memberOrgLevel: boolean;
}

@Component({
  selector: 'app-holding-org',
  templateUrl: './holding-org.component.html'
})
export class HoldingOrgComponent implements OnInit, OnDestroy {
  isLoading = false;
  readonly accessModes = AccessModes;
  accessMode: AccessModes = AccessModes.View;
  private _holdingOrgListenerSub$!: Subscription;
  private _formStatusSub$!: Subscription;
  private _submitMode = false;

  private _tabIndex = {
    ORG_PROFILE: 0,
    ORG_CONFIG: 1,
    ORG_DATA_ATTRIBUTES: 2,
  };
  selectedIndex = 0;

  orgProfileForm!: FormGroup;
  orgConfigForm!: FormGroup;
  orgDataAttributesFormData!: OrgDataAttributesFormData;
  orgDataAttributeInstance!: DataAttributes;
  isDataAttributeFormInvalid = false;
  selectedDataAttribChildTab = 0;

  /** 20201-02-04 - Frank - Added new business vertical (Restaurant) */
  businessVerticalStatics: any[] = [
    { text: 'Banking', value: 'Banking' },
    { text: 'Financial', value: 'Financial' },
    { text: 'Healthcare', value: 'Healthcare' },
    { text: 'Hospitality', value: 'Hospitality' },
    { text: 'Manufacturing', value: 'Manufacturing' },
    { text: 'Restaurant', value: 'Restaurant' },
    { text: 'Retail', value: 'Retail' },
    { text: 'Service Industry', value: 'dropService Industrydown' },
  ];
  maxOrgNameLength = 50;

  /** Config tab related */
  dataBindingSelection: DataBinding[] = [];
  holdingOrgImage: any = null;

  private _id!: string;
  private _currentOrgData: any;
  holdingOrgLogoUrl!: any;
  private _selectedMenuLevels!: SelectedMenuLevels;
  dataBindingStatics: any[] = [];

  constructor(
    private _route: ActivatedRoute,
    private _clientSetupService: ClientSetupService,
    private _router: Router,
    private _snackbarService: SnackbarService,
    private _dialogService: DialogService,
    private _loadingService: LoadingService,
    private _authService: AuthService
  ) {
    if (
      this._route.snapshot.routeConfig?.path ===
      dashboardRouteLinks.CLIENT_SETUP_MANAGE_HOLDINGORG_ADD.routerLink
    ) {
      this.accessMode = AccessModes.Add;
    } else if (
      this._route.snapshot.routeConfig?.path ===
      dashboardRouteLinks.CLIENT_SETUP_MANAGE_HOLDINGORG_EDIT.routerLink
    ) {
      this.accessMode = AccessModes.Edit;
    }

    this._id = this._route.snapshot.params['id'];
  }

  get dataAttributes(): CustomerDataAttributes {
    return (
      this._currentOrgData?.dataConfig?.customer?.dataAttributes ??
      <CustomerDataAttributes[]>[]
    );
  }

  ngOnInit(): void {
    this._setLoading(true);

    /** It was required to pass an :id to show it in the address bar as well, however,
     * I wish to use the local holding org records fetched instead of fetching the :id record from the API.
     * So, created a listener after the holding orgs records are fetched and using it here */
    const initHoldingOrgObs: Observable<any> = this._clientSetupService
      .getDataBindingStatics()
      .pipe(
        map((result) => {
          return result?.dataDomains;
        }),
        switchMap((dataDomains) => {
          this.dataBindingStatics = dataDomains;
          return this._clientSetupService.getHoldingOrgListListener();
        }),
        map((orgs) => {
          if (this._id) {
            this._currentOrgData = orgs?.results?.find(
              (org: { _id: string }) => org._id === this._id
            );
          }
          this.holdingOrgLogoUrl = this._currentOrgData?.logoUrl;

          console.log('this._currentOrgData', this._currentOrgData);

          return orgs;
        }),
        tap(async () => {
          await this._generateDataBindingDisplay();
          await this._initForm();
        })
      );

    this._holdingOrgListenerSub$ = this._loadingService
      .showProgressBarUntilCompleted(initHoldingOrgObs, 'query')
      .subscribe(
        () => {
          this._setLoading(false);
        },
        (error) => {
          consoleLog({ consoleType: ConsoleTypes.error, valuesArr: [error] });
          this._setLoading(false);
        }
      );

    /** Get and store the current selected menu level */
    this._authService
      .getSelectedMenuLevelsListenerObs()
      .pipe(take(1))
      .subscribe(
        (value: SelectedMenuLevels) => (this._selectedMenuLevels = value)
      );
  }

  async setRadioOption(index: number, value: number) {
    this.dataBindingSelection[index] = await {
      ...this.dataBindingSelection[index],
      holdingOrgLevel: value === 1,
      memberOrgLevel: value === 2,
    };
  }

  async setCheckOptions(index: number, isHoldingOrg: boolean, value: boolean) {
    if (isHoldingOrg) {
      this.dataBindingSelection[index] = await {
        ...this.dataBindingSelection[index],
        holdingOrgLevel: value,
      };
    } else {
      this.dataBindingSelection[index] = await {
        ...this.dataBindingSelection[index],
        memberOrgLevel: value,
      };
    }
  }

  ngOnDestroy(): void {
    this._holdingOrgListenerSub$?.unsubscribe();
    this._formStatusSub$?.unsubscribe();
  }
  onFileSelect(event: FileList) {
    this.holdingOrgLogoUrl = this._currentOrgData?.logoUrl;
    this.holdingOrgImage = null;
    if (event && event.length > 0) {
      const file = event[0];
      this.holdingOrgImage = file;
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        this.holdingOrgLogoUrl = reader.result;
      };
    }
  }

  getOrgDataAttributeInstance(instance: DataAttributes) {
    this.orgDataAttributeInstance = instance;
    console.log('orgDataAttributeInstance', this.orgDataAttributeInstance);

    this._formStatusSub$ = this.orgDataAttributeInstance.form.statusChanges
      .pipe(delay(0))
      .subscribe((formStatus: string) => {
        this.isDataAttributeFormInvalid = formStatus !== 'VALID';
      });
  }

  onSubmit(): void {
    //Safety check
    if (this.accessMode === AccessModes.View) return;

    if (!this.orgProfileForm.valid) return;

    this.orgDataAttributesFormData = {
      formStatus: this.orgDataAttributeInstance?.form?.status,
      formPayload: {
        dataConfig: {
          customer: {
            dataAttributes: this.orgDataAttributeInstance?.payload,
          },
        },
      },
    };

    const recordWithEmptyEnumType = this.orgDataAttributeInstance?.isEmptyEnumType();
    if (recordWithEmptyEnumType) {
      this._snackbarService.showError(
        `Enum Type is required when Data Provider Type is set to 'enum' for attribute name '${recordWithEmptyEnumType.value.name}' within group '${recordWithEmptyEnumType.value.groupCode}'`,
        9000
      );

      return;
    }

    this._setLoading(true);

    let dataBinding = {};
    this.dataBindingSelection.forEach((data) => {
      dataBinding = {
        ...dataBinding,
        [data.key]: {
          holdingOrgLevel: data.holdingOrgLevel,
          memberOrgLevel: data.memberOrgLevel,
        },
      };
    });
    const payload = {
      ...this.orgProfileForm.value,
      ...this.orgConfigForm.value,
      status:
        this.accessMode === this.accessModes.Add
          ? 1
          : this._currentOrgData.status,
    };

    const newFormData = new FormData();
    newFormData.set('dataDomainConfig', JSON.stringify(dataBinding));

    /**  23032021 - Gaurav - The following line of code gave a 404 and 'cast to object' failed errors.
     newFormData.set(
      'dataConfig',
       JSON.stringify(this.orgDataAttributesFormData.formPayload)
     );

     * instead used a separate update API call to update the dataConfig data down below
    */

    for (const [key, value] of Object.entries(payload)) {
      if (value) {
        newFormData.append(key, value as any);
      }
    }
    if (this.holdingOrgImage) {
      newFormData.append('file', this.holdingOrgImage);
    }

    console.log(
      'this.orgDataAttributesFormData.formPayload',
      this.orgDataAttributesFormData.formPayload
    );
    // return;

    const addOrEdit: Observable<any> =
      this.accessMode === AccessModes.Add
        ? this._clientSetupService.createHoldingOrg(newFormData).pipe(
            switchMap((createdHoldingOrg) => {
              /** 23032021 - Gaurav - Data Attributes tab is a lazy load module, only update if the instance is created */
              if (this.orgDataAttributeInstance) {
                // console.log(
                //   'CREATE PROCESS: inside another update for dataConfig',
                //   { createdHoldingOrg }
                // );
                return this._clientSetupService.updateHoldingOrg(
                  createdHoldingOrg._id,
                  { ...this.orgDataAttributesFormData.formPayload }
                );
              }

              return of(true);
            })
          )
        : this._clientSetupService.updateHoldingOrg(this._id, newFormData).pipe(
            switchMap((resultOfFirstUpdate) => {
              /** 23032021 - Gaurav - Data Attributes tab is a lazy load module, only update if the instance is created */
              if (this.orgDataAttributeInstance) {
                // console.log(
                //   'UPDATE PROCESS: inside another update for dataConfig',
                //   { resultOfFirstUpdate }
                // );
                return this._clientSetupService.updateHoldingOrg(this._id, {
                  ...this.orgDataAttributesFormData.formPayload,
                });
              }
              return of(true);
            })
          );

    this._loadingService.showSpinnerUntilCompleted(addOrEdit).subscribe(
      (result) => {
        console.log({ result });

        /** Show snackbar to user */
        this._snackbarService.showSuccess(
          `${payload.name} is ${
            this.accessMode === AccessModes.Add ? 'added' : 'updated'
          } successfully!`
        );

        this._setLoading(false);

        /** 28/11/2020 - Gaurav - Fix: Set submit mode to true, so that CanDeactivate knows to allow navigation
         * for this explicit routing */
        this._submitMode = true;
        /** Take user back to holdingOrg setup page, which fetches the orgs and updates listeners on ngOnInit.
         * So fetching the holdingOrgs again to refresh data is not required here */
        this._router.navigate(
          [this.accessMode === AccessModes.Add ? '..' : '../../'],
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

    /** Go back two-levels up to holdingOrg, for accessMode other than 'Add' */
    this._router.navigate(
      [this.accessMode === AccessModes.Add ? '..' : '../../'],
      { relativeTo: this._route }
    );
  }

  onDataAttributesInstanceUpdated(switchTab: boolean): void {
    if (switchTab) {
      this.selectedDataAttribChildTab = 0;
    }
  }

  /** To be called by the CanDeactivate service */
  onUserNavigation(
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot
  ): Promise<boolean> {
    return new Promise((resolve) => {
      if (
        this.orgProfileForm?.dirty ||
        this.orgDataAttributeInstance?.form?.dirty ||
        this.orgDataAttributeInstance?.form?.touched
      ) {
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

  getTitle(): string {
    return `${this.accessMode} Holding Organization`;
  }

  getSubTitle(): string {
    return generateNameAndCodeString(
      this.orgProfileForm?.controls?.code.value,
      this.orgProfileForm?.controls?.name.value
    );
  }

  /** Can User Add or Edit */
  isCanDo(): boolean {
    return (
      this.accessMode === AccessModes.Add ||
      this.accessMode === AccessModes.Edit
    );
  }

  isSubMitMode(): boolean {
    return this._submitMode;
  }

  getActionButtonText(): string {
    if (this.accessMode === AccessModes.Add) return 'Add';
    if (this.accessMode === AccessModes.Edit) return 'Update';
    return '';
  }

  isPendingDataBindingRequired(): boolean {
    return this.dataBindingSelection.some(
      (data) => !data.holdingOrgLevel && !data.memberOrgLevel
    );
  }

  private _generateDataBindingDisplay() {
    let displayArray = [];

    for (const staticProperty in this.dataBindingStatics) {
      const staticPropValue = this.dataBindingStatics[staticProperty];
      let dataDomainConfig = null;

      /** Check if any records in holding org that has values, and merge them with the data domain statics
       * to create a display table for Data Binding in the Config tab */
      if (
        this._currentOrgData?.dataDomainConfig?.hasOwnProperty(staticProperty)
      ) {
        dataDomainConfig = this._currentOrgData?.dataDomainConfig[
          staticProperty
        ];
      } else {
        dataDomainConfig = {
          holdingOrgLevel: false,
          memberOrgLevel: false,
        };
      }

      displayArray.push({
        ...staticPropValue,
        ...dataDomainConfig,
        key: staticProperty,
      });
    }

    this.dataBindingSelection = [...displayArray];
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
      bussinessVertical: new FormControl(
        this._currentOrgData?.bussinessVertical?.[0],
        Validators.required
      ),
      addressLine1: new FormControl(this._currentOrgData?.addressLine1),
      addressLine2: new FormControl(this._currentOrgData?.addressLine2),
      country: new FormControl(
        this._currentOrgData?.country,
        Validators.required
      ),
      state: new FormControl(this._currentOrgData?.state),
      city: new FormControl(this._currentOrgData?.city),
      zipCode: new FormControl(this._currentOrgData?.zipCode),
      phone: new FormControl(this._currentOrgData?.phone),
      fax: new FormControl(this._currentOrgData?.fax),
      tollFreeNumber: new FormControl(this._currentOrgData?.tollFreeNumber),
      email: new FormControl(this._currentOrgData?.email, Validators.email),
      websiteAddress: new FormControl(this._currentOrgData?.websiteAddress),
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
      /** 11122020 - Gaurav - Added logoUrl */
      logoUrl: new FormControl(this._currentOrgData?.logoUrl ?? null),
    });

    if (this.accessMode === AccessModes.Edit)
      this.orgProfileForm.controls.code.disable();

    if (this.accessMode === AccessModes.View) {
      this.orgProfileForm.disable();
      this.orgConfigForm.disable();
    }
  }
}
interface HTMLInputEvent extends Event {
  target: HTMLInputElement & EventTarget;
}
