/** 30112020 - Gaurav - Init version
 * 01122020 - Gaurav - Added Profile and Roles
 * 02122020 - Gaurav - Added Client Data Access - Row Level Security
 * 04122020 - Gaurav: Fixed random ExpressionChangedAfterItHasBeenCheckedError and console warnings by Angular
 * on reactive form components for using [disabled] attribute in template.
 * 09122020 - Frank - Added subtitle
 * 09122020 - Frank - Inverted password checkbox logic
 * 08022021 - Gaurav - Added code for new progress-bar service
 * 09022021 - Abhishek - Added new checkbox on user edit screen with Label: AllowGlobalOrgSelector and added its control in form.
 * 15032021 - Gaurav - Use enum AccessModes from constants file instead of local one
 * */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { concatMap, map, take, tap } from 'rxjs/operators';

/** Material */
import { MatCheckboxChange } from '@angular/material/checkbox';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';

/** Services */
import { UserManagementService } from '../user-management.service';
import { DialogService } from 'src/app/dashboard/shared/components/dialog/dialog.service';
import { SnackbarService } from 'src/app/shared/components/snackbar.service';

/** System Dialog Related */
import {
  DialogConditionType,
  SystemDialogReturnType,
  SystemDialogType,
} from 'src/app/dashboard/shared/components/dialog/dialog.model';

import {
  AccessModes,
  DashboardMenuEnum,
  dashboardRouteLinks,
  MenuAccessEnum,
} from 'src/app/dashboard/shared/components/menu/constants.routes';
import { ClientSetupService } from '../../client-setup/client-setup.service';
import { MatSelect } from '@angular/material/select';

import {
  consoleLog,
  ConsoleTypes,
  generateNameAndCodeString,
} from 'src/app/shared/util/common.util';
import { LoadingService } from 'src/app/shared/services/loading.service';
import { AuthService, SelectedMenuLevels } from 'src/app/auth/auth.service';

interface Role {
  _id: string;
  code: string;
  name: string;
  status: number;
  privileges: string[];
}

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html'
})
export class UsersComponent implements OnInit, OnDestroy {
  isLoading = false;
  accessModes = AccessModes;
  accessMode: AccessModes = AccessModes.View;
  passwordChecked = false;
  showMenuReadOnlyList = false;
  private _observableSub$!: Subscription;
  private _selectedMenuLevels!: SelectedMenuLevels;
  private _submitMode = false;
  private _id!: string;
  private _currentUserData: any;

  private _tabIndex = {
    USER_PROFILE: 0,
    USER_ROLES_ASSIGNMENT: 1,
    USER_CLIENT_DATA_ACCESS: 2,
  };
  selectedIndex = 0;

  userProfileForm!: FormGroup;

  /** Roles related */
  private _allRolesList!: Role[];
  availableRoles: any[] = [];
  assignedRoles: any[] = [];

  /** Roles Menu Options display-only table
   * Hard-coded Data Domains here in this read-only display since we're short on time for
   * other modules */
  menuAccess = MenuAccessEnum;
  menuOptions: any[] = [];

  /** Client Data Access Related */
  userClientDataAccessForm!: FormGroup;
  dataDomainList: any[] = [];
  holdingOrgsList: any[] = [];
  private _memberOrgsList: any[] = [];
  singleModeDataDomains: string[] = [];

  constructor(
    private _userManagementService: UserManagementService,
    private _clientSetupService: ClientSetupService,
    private _dialogService: DialogService,
    private _snackbarService: SnackbarService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _loadingService: LoadingService,
    private _authService: AuthService
  ) {}

  ngOnInit(): void {
    this._setLoading(true);

    /** Set access mode, default is view-only */
    if (
      this._route.snapshot.routeConfig?.path ===
      dashboardRouteLinks.USER_MANAGEMENT_MANAGE_USERS_ADD.routerLink
    ) {
      this.accessMode = this.accessModes.Add;
    } else if (
      this._route.snapshot.routeConfig?.path ===
      dashboardRouteLinks.USER_MANAGEMENT_MANAGE_USERS_EDIT.routerLink
    ) {
      this.accessMode = this.accessModes.Edit;
    }

    this._id = this._route.snapshot.params['id'];

    /** Get and store the current selected menu level */
    this._authService
      .getSelectedMenuLevelsListenerObs()
      .pipe(take(1))
      .subscribe(
        (value: SelectedMenuLevels) => (this._selectedMenuLevels = value)
      );

    const initUsersObs: Observable<any> = this._userManagementService
      .getUsersListListenerObs()
      .pipe(
        map((users) => {
          if (this._id) {
            this._currentUserData = users?.results?.find(
              (user: { _id: string }) => user._id === this._id
            );
          }

          consoleLog({
            valuesArr: ['this._currentUserData', this._currentUserData],
          });

          return users;
        }),
        concatMap((users) => {
          /** 02122020 - Gaurav - Use listener instead of API. Listener called from User List Setup */
          return this._userManagementService.getRolesListListenerObs();
        }),
        tap((rolesData) => {
          this._allRolesList = rolesData.results.map((role: any) => {
            return {
              _id: role._id,
              code: role.code,
              name: role.name,
              status: role.status,
              privileges: role.privileges ?? [],
            };
          });
        }),
        concatMap((roles) => {
          return this._clientSetupService.getDataDomainStaticsListener();
        }),
        concatMap((dataDomains) => {
          if (dataDomains) {
            this.dataDomainList = Object.values(dataDomains);

            this.singleModeDataDomains = this.dataDomainList
              .filter((dataDomain) => dataDomain.mode === 'single')
              .map((dataDomain) => dataDomain.name.toLowerCase());
          }

          return this._clientSetupService.getHoldingOrgListListener();
        }),
        concatMap((holdingOrgs) => {
          this.holdingOrgsList = holdingOrgs?.results;
          return this._clientSetupService.getAllMemberOrgsListener();
        })
      );

    this._observableSub$ = this._loadingService
      .showProgressBarUntilCompleted(initUsersObs, 'query')
      .subscribe(
        async (memberOrgs) => {
          this._memberOrgsList = memberOrgs?.results;

          if (
            this._currentUserData?.roles &&
            this._currentUserData?.roles?.length > 0
          ) {
            this.assignedRoles = this._allRolesList.filter((role) =>
              this._currentUserData.roles.some(
                (assignedRole: any) => assignedRole._id === role._id
              )
            );

            this.availableRoles = this._allRolesList.filter(
              (role) =>
                !this._currentUserData.roles.some(
                  (assignedRole: any) => assignedRole._id === role._id
                ) && role.status === 1
            );
          } else {
            this.availableRoles = this._allRolesList.filter(
              (role) => role.status === 1
            );
          }

          await this.populateReadOnlyMenuOptions();
          await this._initForm();
        },
        (error) => {
          consoleLog({ consoleType: ConsoleTypes.error, valuesArr: [error] });
          this._setLoading(false);
        }
      );
  }

  ngOnDestroy(): void {
    this._observableSub$.unsubscribe();
  }

  isSubMitMode(): boolean {
    return this._submitMode;
  }

  getTitle(): string {
    return `${this.accessMode} User`;
  }

  getSubTitle(): string {
    let fullName = '';
    const firstName = this.userProfileForm?.controls?.firstName.value;
    const lastName = this.userProfileForm?.controls?.lastName.value;

    if (firstName) {
      fullName = firstName;
    }
    if (lastName && fullName.length > 0) {
      fullName = `${firstName} ${lastName}`;
    } else if (lastName) {
      fullName = lastName;
    }

    return generateNameAndCodeString(
      this.userProfileForm?.controls?.userId.value,
      fullName
    );
  }

  /** Can User Add or Edit */
  isCanDo(): boolean {
    return (
      this.accessMode === this.accessModes.Add ||
      this.accessMode === this.accessModes.Edit
    );
  }

  getActionButtonText(): string {
    if (this.accessMode === this.accessModes.Add) return 'Add';
    if (this.accessMode === this.accessModes.Edit) return 'Update';
    return '';
  }

  /** 02122020 - Gaurav - a getter for formArray!
   * formArray.controls won't be an accessible prop in a regular array, cast it to formarray
   * Row level security methods - Starts */
  get rowLevelSecurityFromUi() {
    return (<FormArray>(
      this.userClientDataAccessForm?.get('rowLevelSecurityFromUi')
    ))?.controls;
  }

  getMemberOrgs(holdingOrgId: string): any[] {
    return (
      this._memberOrgsList.filter(
        (member) => member.holdingOrg === holdingOrgId
      ) ?? []
    );
  }

  hasMemberOrgs(holdingOrgId: string): boolean {
    return this._memberOrgsList.some(
      (member) => member.holdingOrg === holdingOrgId
    );
  }

  isDisabled(dataDomain: string, elementRef: MatSelect): boolean {
    if (!this.isCanDo()) return true;
    if (!dataDomain) return true;

    if (this.singleModeDataDomains.includes(dataDomain.toLowerCase())) {
      return elementRef.value ? true : false;
    }

    return false;
  }

  isRolesAssignmentFormValid(): boolean {
    const isAdmin = this.userProfileForm?.controls['isAdmin']?.value;
    return isAdmin || this.assignedRoles?.length > 0;
  }

  isRowLevelSecurityFormValid(): boolean {
    /** 20201209 - FK - Updated to force at least one rowLevelSecurity row if not admin */

    /** Is the user an admin? */
    const isAdmin = this.userProfileForm?.controls['isAdmin']?.value;

    /** If no rows, we need to block */
    const hasRows =
      this.rowLevelSecurityFromUi && this.rowLevelSecurityFromUi.length > 0;

    /** Data Domains is a mandatory field */
    const isDataDomainsSelectedForAllRows = this.rowLevelSecurityFromUi?.every(
      (row) => row.value.dataDomain
    );

    /** Check that either the Holding Org or the Member Org values are set for the data domains */
    const isNoValueSetForSomeRows = this.rowLevelSecurityFromUi?.some(
      (row) =>
        !row.value.holHoldingOrg &&
        !row.value.molHoldingOrg &&
        (!row.value.molMemberOrgs || row.value.molMemberOrgs.length === 0)
    );

    /** Putting it all together */
    let isValid: boolean =
      isAdmin ||
      (hasRows &&
        this.userClientDataAccessForm &&
        isDataDomainsSelectedForAllRows &&
        !isNoValueSetForSomeRows);

    return isValid;
  }

  onDataDomainChanged(
    index: number,
    dataDomain: string,
    holHoldingOrgRef: MatSelect,
    molHoldingOrgRef: MatSelect,
    molMemberOrgsRef: MatSelect
  ): void {
    if (this.singleModeDataDomains.includes(dataDomain.toLowerCase())) {
      this.rowLevelSecurityFromUi[index].value.holHoldingOrg = null;
      this.rowLevelSecurityFromUi[index].value.molHoldingOrg = null;
      this.rowLevelSecurityFromUi[index].value.molMemberOrgs = [];
      holHoldingOrgRef.value = null;
      molHoldingOrgRef.value = null;
      molMemberOrgsRef.value = [];
    } else {
      /** 04122020 - Gaurav - If singlemode, follow the logic else enable any locked MOL or HOL Holding Orgs */
      this.rowLevelSecurityFromUi[index].get('holHoldingOrg')?.enable();
      this.rowLevelSecurityFromUi[index].get('molHoldingOrg')?.enable();
    }
  }

  /** 04122020 - Gaurav - Fix for angular shouting on usign [disabled] in template.
   * Not disabling memberORgs since would not hold no value if molHO is not selected */
  onHoldingOrgChanged(
    index: number,
    dataDomain: string,
    holdingOrgValue: string,
    isMOL: boolean
  ): void {
    /** IF isMol, disable holHoldingOrg ELSE molHoldingOrg */
    const holdingOrgFieldType = isMOL ? 'holHoldingOrg' : 'molHoldingOrg';
    const singleMode =
      dataDomain &&
      this.singleModeDataDomains.includes(dataDomain!.toLowerCase());

    /** If singlemode, follow the logic else enable any locked MOL or HOL Holding Orgs */
    if (singleMode) {
      if (holdingOrgValue) {
        this.rowLevelSecurityFromUi[index].get(holdingOrgFieldType)?.disable();
      } else {
        this.rowLevelSecurityFromUi[index].get(holdingOrgFieldType)?.enable();
      }
    } else {
      this.rowLevelSecurityFromUi[index].get(holdingOrgFieldType)?.enable();
    }
  }

  onAddRowLevelSecurity(
    dataDomain?: string,
    holHoldingOrg?: string | null,
    molHoldingOrg?: string | null,
    molMemberOrgs?: string[]
  ) {
    /** Where: HOL = Holding Org Level, MOL = Member Org Level */
    (<FormArray>(
      this.userClientDataAccessForm.get('rowLevelSecurityFromUi')
    )).push(
      new FormGroup({
        dataDomain: new FormControl(dataDomain, Validators.required),
        holHoldingOrg: new FormControl(holHoldingOrg),
        molHoldingOrg: new FormControl(molHoldingOrg),
        molMemberOrgs: new FormControl(molMemberOrgs ?? []),
      })
    );

    /** 04122020 - Gaurav - Fix for angular shouting on usign [disabled] in template, but phunk didn't set any value when programmatically using
     * new FormControl({value: holHoldingOrg, disable: molHoldingOrg ? true : false}).
     * Used an alternative to disable the appropriate fields on form load, not disabling memberORgs since would not hold no value if molHO is not selected */
    if (
      dataDomain &&
      this.singleModeDataDomains.includes(dataDomain!.toLowerCase())
    ) {
      if (holHoldingOrg) {
        this.rowLevelSecurityFromUi[this.rowLevelSecurityFromUi.length - 1]
          .get('molHoldingOrg')
          ?.disable();
      } else {
        this.rowLevelSecurityFromUi[this.rowLevelSecurityFromUi.length - 1]
          .get('holHoldingOrg')
          ?.disable();
      }
    }
  }

  onDeleteRowLevelSecurity(index: number): void {
    (<FormArray>(
      this.userClientDataAccessForm.get('rowLevelSecurityFromUi')
    )).removeAt(index);
  }
  /** Row level security methods - Ends */

  onPasswordCheckBox($event: MatCheckboxChange) {
    this.setPasswordField($event.checked);
  }

  setPasswordField(isPasswordChecked: boolean) {
    this.passwordChecked = isPasswordChecked;
    if (isPasswordChecked || this.accessMode === this.accessModes.Add) {
      this.userProfileForm.controls['password'].enable();
      this.userProfileForm.controls['password'].setValidators(
        Validators.required
      );
      this.userProfileForm.controls['password'].setValue(null);
    } else {
      this.userProfileForm.controls['password'].disable();
      this.userProfileForm.controls['password'].clearValidators();
      this.userProfileForm.controls['password'].setValue('********');
    }
  }

  onIsAdminChek($event: MatCheckboxChange) {
    this.userProfileForm.controls['canUseGlobalOrgSelector'].setValue(
      $event.checked
    );
    $event.checked
      ? this.userProfileForm.controls['canUseGlobalOrgSelector'].disable()
      : this.userProfileForm.controls['canUseGlobalOrgSelector'].enable();
  }

  onSubmit(): void {
    //Safety check
    if (this.accessMode === this.accessModes.View) return;

    if (!this.userProfileForm.valid) return;

    const isCDAFormValid = this.isRowLevelSecurityFormValid();
    if (!isCDAFormValid) return;

    this._setLoading(true);

    this.rowLevelSecurityFromUi.forEach((row) => {
      /** Change the dataDomain named per the accpeted enum */
      const valArray = row.value.dataDomain.split(' ');
      valArray[0] = valArray[0].toLowerCase();
      row.value.dataDomain = valArray.join('');
    });

    let payload = {
      userId: this.userProfileForm.controls['userId'].value,
      firstName: this.userProfileForm.controls['firstName'].value,
      lastName: this.userProfileForm.controls['lastName'].value,
      email: this.userProfileForm.controls['email'].value,
      password:
        this.accessMode === this.accessModes.Add || this.passwordChecked
          ? this.userProfileForm.controls['password'].value
          : undefined,
      title: this.userProfileForm.controls['title'].value,
      isAdmin: this.userProfileForm.controls['isAdmin'].value ?? false,
      canUseGlobalOrgSelector:
        this.userProfileForm.controls['canUseGlobalOrgSelector'].value ?? false,
      status:
        this.accessMode === this.accessModes.Add
          ? 1
          : this._currentUserData.status,
      roles: this.userProfileForm.controls['isAdmin'].value
        ? []
        : this.assignedRoles.map((role) => role._id),
      /** 04122020 - Gaurav - Fix for angular shouting on usign [disabled] in template. Now phunk CLEARED the fields
       * and did not return any value objects for disable() fields */
      rowLevelSecurityFromUi: this.userProfileForm.controls['isAdmin'].value
        ? []
        : this.rowLevelSecurityFromUi.map((row) => {
            let values = row.value;
            if (!values?.holHoldingOrg) {
              values = {
                ...values,
                holHoldingOrg: null,
              };
            }

            if (!values?.molHoldingOrg) {
              values = {
                ...values,
                molHoldingOrg: null,
                molMemberOrgs: [],
              };
            }

            return values;
          }),
    };

    console.log('payload', payload);
    // return;

    const addOrEdit: Observable<any> =
      this.accessMode === this.accessModes.Add
        ? this._userManagementService.addUser({...payload, resetPasswordNextLogon:true})
        : this._userManagementService.updateUser(this._id, payload);

    this._loadingService.showProgressBarUntilCompleted(addOrEdit).subscribe(
      (result) => {
        // console.log(result);

        /** Show snackbar to user */
        this._snackbarService.showSuccess(
          `${payload.firstName} ${payload.lastName} is ${
            this.accessMode === this.accessModes.Add ? 'added' : 'updated'
          } successfully!`
        );

        this._setLoading(false);

        /** Set submit mode to true, so that CanDeactivate knows to allow navigation
         * for this explicit routing */
        this._submitMode = true;
        /** Take user back to holdingOrg setup page, which fetches the orgs and updates listeners on ngOnInit.
         * So fetching the holdingOrgs again to refresh data is not required here */
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
    /** Go back two-levels up to Users, for accessMode other than 'Add'. This explicit redirection should trigger CanDeactivate */
    this._router.navigate(
      [this.accessMode === this.accessModes.Add ? '..' : '../../'],
      { relativeTo: this._route }
    );
  }

  /** To be called by the CanDeactivate service.
   * Gaurav - Note: I could have copied this method to the CanDeactivate Service but kept it here since wish to have component to decide
   * and have more contol on the action  */
  onUserNavigation(
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot
  ): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.userProfileForm?.dirty) {
        /** CanDeactivate would be triggered when user is explicitly routed back to the Users page
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
              /** CanDeactivate did not allow the page/route to change BUT it did retained the menu selection which the user tried navigating to.
               * Navigate back to current menu selection. */
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

  async toggleRoleMenuDisplay(value: boolean) {
    /** Refresh menu list if showing - some error in reduce due to assignedRoelsValues */
    if (value && this.isCanDo()) await this.populateReadOnlyMenuOptions();
    this.showMenuReadOnlyList = value;
  }

  /** 21122020 - Abhishek - Added NPS and INSIGHT in menu options */

  async populateReadOnlyMenuOptions() {
    this.menuOptions = [
      {
        name: 'Ask Buddy',
        menuName: `${DashboardMenuEnum.ASK_BUDDY}`,
        privileges: [],
      },
      {
        name: 'Communication AI',
        menuName: `${DashboardMenuEnum.COMM_AI}`,
        privileges: [],
      },
      {
        name: 'NPS',
        menuName: `${DashboardMenuEnum.NPS}`,
        privileges: [],
      },
      {
        name: 'Response AI',
        menuName: `${DashboardMenuEnum.RESP_AI}`,
        privileges: [],
      },
      {
        name: 'Market Place AI',
        menuName: `${DashboardMenuEnum.MARKET_AI}`,
        privileges: [],
      },
      {
        name: 'Profit Edge',
        menuName: `${DashboardMenuEnum.PROF_EDGE}`,
        privileges: [],
      },
      {
        name: 'Insight',
        menuName: `${DashboardMenuEnum.INSIGHT}`,
        privileges: [],
      },
      {
        name: 'Client Setup',
        menuName: `${DashboardMenuEnum.CLIENT_SETUP}`,
        privileges: [],
      },
      {
        name: 'User Administration',
        menuName: `${DashboardMenuEnum.USER_ADMIN}`,
        privileges: [],
      },
      {
        name: 'Billing',
        menuName: `${DashboardMenuEnum.BILLING}`,
        privileges: [],
      },
    ];

    if (this.assignedRoles && this.assignedRoles.length > 0) {
      this.menuOptions = await this.menuOptions.map((menuOption) => {
        return {
          ...menuOption,
          privileges: [
            ...new Set(
              this.assignedRoles
                .filter(
                  (role) =>
                    role.privileges.length > 0 &&
                    role.privileges.some((privilege: string) =>
                      privilege.includes(menuOption.menuName)
                    )
                )
                .map((role) =>
                  role.privileges.filter((privileges: string) =>
                    privileges.includes(menuOption.menuName)
                  )
                )
                .reduce((pre, cursor) => pre.concat(cursor), [])
            ),
          ],
        };
      });
    }
  }

  private _initForm(): void {
    this.userProfileForm = new FormGroup({
      userId: new FormControl(
        this._currentUserData?.userId,
        Validators.required
      ),
      firstName: new FormControl(
        this._currentUserData?.firstName,
        Validators.required
      ),
      lastName: new FormControl(
        this._currentUserData?.lastName,
        Validators.required
      ),
      email: new FormControl(this._currentUserData?.email, [
        Validators.required,
        Validators.email,
      ]),
      password: new FormControl({
        value: this._currentUserData?.password,
        disabled: true,
      }),
      title: new FormControl(this._currentUserData?.title, Validators.required),
      isAdmin: new FormControl(this._currentUserData?.isAdmin),
      canUseGlobalOrgSelector: new FormControl(
        this._currentUserData?.isAdmin
          ? { value: this._currentUserData?.isAdmin, disabled: true }
          : {
              value: this._currentUserData?.canUseGlobalOrgSelector,
              disabled: false,
            }
      ),
    });

    this.userClientDataAccessForm = new FormGroup({
      rowLevelSecurityFromUi: new FormArray([]),
    });

    /** Populate rowLevelSecurityFromUi from last saved data: TODO: UNDER CONSTRUCTION */
    this._currentUserData?.rowLevelSecurityFromUi?.forEach((row: any) => {
      let dataDomain =
        row.dataDomain.charAt(0).toUpperCase() + row.dataDomain.slice(1);
      /** TODO: Remove this hard-coded values in future if there is any matching data field found */
      if (row.dataDomain === 'profitEdge') dataDomain = 'Profit Edge';
      if (row.dataDomain === 'marketPlace') dataDomain = 'Market Place';
      if (row.dataDomain === 'nps') dataDomain = 'NPS';

      this.onAddRowLevelSecurity(
        dataDomain,
        row.holHoldingOrg,
        row.molHoldingOrg,
        row.molMemberOrgs
      );
    });

    if (this.accessMode === this.accessModes.Add) {
      this.userProfileForm.get('password')?.enable();
      this.userProfileForm.get('password')?.setValidators(Validators.required);
    }

    if (this.accessMode === this.accessModes.Edit)
      this.userProfileForm.get('userId')?.disable();

    if (this.accessMode === this.accessModes.View) {
      this.userProfileForm.disable();
      this.userClientDataAccessForm.disable();
    }

    this.setPasswordField(false);

    this._setLoading(false);
  }

  private _setLoading(value: boolean): void {
    this.isLoading = value;
    if (!value) this._loadingService.loadingOff();
  }

  /** Angular Material: Drag-Drop method */
  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }
}
