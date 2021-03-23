/** 30112020 - Gaurav - Init version
 * 09122020 - Frank - Added subtitle
 * 10122020 - Gaurav - Fix for at least one privilege to be selected for a role
 * 10122020 - Gaurav - Fixed the check-box behaviour and removed some crap code (my own) for check-boxes handling logic
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
import { map, take } from 'rxjs/operators';

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

import {
  consoleLog,
  ConsoleTypes,
  generateNameAndCodeString,
} from 'src/app/shared/util/common.util';
import { LoadingService } from 'src/app/shared/services/loading.service';
import { AuthService, SelectedMenuLevels } from 'src/app/auth/auth.service';

interface MenuOptions {
  name: string;
  menuName: string;
  privileges: string[];
}

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html'
})
export class RolesComponent implements OnInit, OnDestroy {
  isLoading = false;
  accessModes = AccessModes;
  accessMode: AccessModes = AccessModes.View;
  private _observableSub$!: Subscription;
  private _selectedMenuLevels!: SelectedMenuLevels;
  private _submitMode = false;
  private _id!: string;
  private _currentRoleData: any;

  roleProfileForm!: FormGroup;

  private _assignedPrivileges: string[] = [];
  menuName = DashboardMenuEnum;
  menuAccess = MenuAccessEnum;

  /** 21122020 - Abhishek - Added NPS and INSIGHT in menu options */
  menuOptions: MenuOptions[] = [
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
      name: 'Response AI',
      menuName: `${DashboardMenuEnum.RESP_AI}`,
      privileges: [],
    },
    {
      name: 'NPS',
      menuName: `${DashboardMenuEnum.NPS}`,
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

  constructor(
    private _userManagementService: UserManagementService,
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
      dashboardRouteLinks.USER_MANAGEMENT_MANAGE_ROLES_ADD.routerLink
    ) {
      this.accessMode = this.accessModes.Add;
    } else if (
      this._route.snapshot.routeConfig?.path ===
      dashboardRouteLinks.USER_MANAGEMENT_MANAGE_ROLES_EDIT.routerLink
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

    const initRolesObs: Observable<any> = this._userManagementService
      .getRolesListListenerObs()
      .pipe(
        map((roles) => {
          if (this._id) {
            this._currentRoleData = roles?.results?.find(
              (role: { _id: string }) => role._id === this._id
            );
          }

          // console.log(this._currentRoleData);

          this._populateMenuOptions();

          return roles;
        })
      );

    this._observableSub$ = this._loadingService
      .showProgressBarUntilCompleted(initRolesObs, 'query')
      .subscribe(
        async (roles) => {
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
    return `${this.accessMode} Role`;
  }

  getSubTitle(): string {
    return generateNameAndCodeString(
      this.roleProfileForm?.controls?.code.value,
      this.roleProfileForm?.controls?.name.value
    );
  }

  /** Can User Add or Edit */
  isCanDo(): boolean {
    return (
      this.accessMode === this.accessModes.Add ||
      this.accessMode === this.accessModes.Edit
    );
  }

  /** 10122020 - Gaurav - Check isPrivilegeSelected() on disable of add/edit button and on the column headers in template  */
  isPrivilegeSelected(): boolean {
    return this.menuOptions.some((option) => option.privileges.length > 0);
  }

  getActionButtonText(): string {
    if (this.accessMode === this.accessModes.Add) return 'Add';
    if (this.accessMode === this.accessModes.Edit) return 'Update';
    return '';
  }

  async setCheckOptions(index: number, privilege: string, allow: any) {
    const menuOption: any = await this.menuOptions[index];

    if (allow) {
      await menuOption.privileges.push(privilege);
    } else {
      menuOption.privileges = await menuOption.privileges.filter(
        (access: string) => access !== privilege
      );
    }

    this.menuOptions[index] = menuOption;
  }

  onSubmit(): void {
    //Safety check
    if (this.accessMode === this.accessModes.View) return;

    /** Reset this._assignedPrivileges */
    this._assignedPrivileges = [];
    this.menuOptions.forEach((option) => {
      if (option.privileges.length > 0) {
        this._assignedPrivileges = [
          ...this._assignedPrivileges,
          ...option.privileges,
        ];
      }
    });

    if (!this.roleProfileForm.valid) return;

    this._setLoading(true);

    let payload = {
      code: this.roleProfileForm.controls['code'].value,
      name: this.roleProfileForm.controls['name'].value,
      privileges: this._assignedPrivileges,
      status:
        this.accessMode === this.accessModes.Add
          ? 1
          : this._currentRoleData.status,
    };

    // console.log('payload', payload);

    const addOrEdit: Observable<any> =
      this.accessMode === this.accessModes.Add
        ? this._userManagementService.addRole(payload)
        : this._userManagementService.updateRole(this._id, payload);

    this._loadingService.showProgressBarUntilCompleted(addOrEdit).subscribe(
      (result) => {
        /** Show snackbar to user */
        this._snackbarService.showSuccess(
          `${payload.name} is ${
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
    /** Go back two-levels up to Roles, for accessMode other than 'Add'. This explicit redirection should trigger CanDeactivate */
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
      if (this.roleProfileForm?.dirty) {
        /** CanDeactivate would be triggered when user is explicitly routed back to the Roles page
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

  private _populateMenuOptions() {
    if (this.accessMode === this.accessModes.Add) return;

    /** Populate Menu Options for last stored values if in EDIT or VIEW mode */
    this._assignedPrivileges = this._currentRoleData?.privileges ?? [];

    if (this._assignedPrivileges.length > 0) {
      this.menuOptions.forEach((feature) => {
        const featurePrivileges = this._assignedPrivileges.filter(
          (privilege) => privilege.search(feature.menuName) !== -1
        );

        feature.privileges = featurePrivileges ?? [];
      });
    }
  }

  private _initForm(): void {
    this.roleProfileForm = new FormGroup({
      code: new FormControl(this._currentRoleData?.code, Validators.required),
      name: new FormControl(this._currentRoleData?.name, Validators.required),
    });

    if (this.accessMode === this.accessModes.Edit)
      this.roleProfileForm.controls.code.disable();

    if (this.accessMode === this.accessModes.View)
      this.roleProfileForm.disable();

    this._setLoading(false);
  }

  private _setLoading(value: boolean): void {
    this.isLoading = value;
    if (!value) this._loadingService.loadingOff();
  }
}
