/** 30112020 - Gaurav - Init version
 * 10122020 - Gaurav - Fix to show 'Name (Code)' and removed 'Code' column from display
 * 08022021 - Gaurav - Added code for new progress-bar service
 * 31032021 - Gaurav - JIRA-CA-310: Componentize setup-list action buttons
 */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';

import { dashboardRouteLinks } from 'src/app/dashboard/shared/components/menu/constants.routes';

/** Services */
import { SnackbarService } from 'src/app/shared/components/snackbar.service';
import { DialogService } from 'src/app/dashboard/shared/components/dialog/dialog.service';
import {
  DialogConditionType,
  SystemDialogReturnType,
  SystemDialogType,
} from 'src/app/dashboard/shared/components/dialog/dialog.model';
import { UserManagementService } from '../user-management.service';
import { LoadingService } from 'src/app/shared/services/loading.service';
import { AppConfigService } from 'src/app/shared/services/app-config.service';
import {
  AppButtonTypes,
  ButtonRowClickedParams,
} from 'src/app/dashboard/shared/components/buttons/buttons.model';

@Component({
  selector: 'app-roles-setup',
  templateUrl: './roles-setup.component.html',
})
export class RolesSetupComponent implements OnInit {
  isLoading = false;
  readonly appButtonType = AppButtonTypes;
  private _showEditComponents = false;
  _rolesList: any[] = [];

  /** Cols chosen to be displayed on the table */
  displayedColumns: string[] = ['name', 'status', 'action_buttons'];
  dataSource!: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private _userManagementService: UserManagementService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _snackbarService: SnackbarService,
    private _dialogService: DialogService,
    public appConfigService: AppConfigService,
    private _loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    this._setLoading(true);

    this._showEditComponents =
      this._route.snapshot.routeConfig?.path ===
      dashboardRouteLinks.USER_MANAGEMENT_MANAGE_ROLES.routerLink;

    this._getRoles();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  isShowEditComponents(): boolean {
    /** Secure any side-effect() to change this variable apart from those intended */
    return this._showEditComponents;
  }

  /** Action buttons */
  onButtonRowClicked(args: ButtonRowClickedParams) {
    console.log({ args });

    switch (args.appButtonType) {
      case AppButtonTypes.edit:
        return this.onEditRole(args._id);
      case AppButtonTypes.status:
        return this.onStatusChange(args?.status!, args._id, args?.name!);
      case AppButtonTypes.view:
        return this.onViewRole(args._id);
      case AppButtonTypes.delete:
        return this.onDeleteRole(args._id, args?.name!);
    }
  }

  onAddRole(): void {
    this._router.navigate(['add'], { relativeTo: this._route });
  }

  onEditRole(id: string): void {
    this._router.navigate(['edit', id], {
      relativeTo: this._route,
    });
  }

  onViewRole(id: string): void {
    this._router.navigate(['view', id], { relativeTo: this._route });
  }

  onDeleteRole(id: string, roleName: string): void {
    this._dialogService
      .openSystemDialog({
        alertType: SystemDialogType.warning_alert_yes_no,
        dialogConditionType: DialogConditionType.prompt_custom_data,
        title: 'Delete Role',
        body: `Do you want to delete role '${roleName}?'`,
      })
      .then((response) => {
        /** Only process confirmation requests */
        if (response === SystemDialogReturnType.continue_yes) {
          this._setLoading(true);

          this._userManagementService.deleteRole(id).subscribe(
            (result) => {
              /** Show snackbar to user */
              this._snackbarService.showSuccess(`${roleName} is deleted!`);

              /** 26112020 - Gaurav - Note: Instead of fetching all the member orgs again,
               * just locally delete the record. */
              const index = this._rolesList.findIndex(
                (user) => user._id === id
              );
              this.dataSource.data.splice(index, 1);
              /* 21122020 - Abhishek - remove splice fuction from template list */
              // this._rolesList.splice(index, 1);
              this.dataSource._updateChangeSubscription();
              this._setLoading(false);
            },
            (error) => {
              /** Handled by Http Interceptor */
              this._setLoading(false);
            }
          );
        }
      });
  }

  onStatusChange(currentStatus: number, id: string, roleName: string): void {
    this._dialogService
      .openSystemDialog({
        alertType: SystemDialogType.warning_alert_yes_no,
        dialogConditionType: DialogConditionType.prompt_custom_data,
        title: 'Status Role',
        body: `Do you want to ${
          currentStatus === 0 ? 'activate' : 'inactivate'
        } role '${roleName}?'`,
      })
      .then((response) => {
        /** Only process confirmation requests */
        if (response === SystemDialogReturnType.continue_yes) {
          this._setLoading(true);

          /** Update status in backend */
          const status = currentStatus === 0 ? 1 : 0;

          this._loadingService
            .showProgressBarUntilCompleted(
              this._userManagementService.updateRole(id, {
                status,
              })
            )
            .subscribe(
              (result) => {
                /** Show snackbar to user */
                this._snackbarService.showSuccess(
                  `${roleName} is ${
                    status === 1 ? 'activated' : 'inactivated'
                  }!`
                );

                /** Instead of fetching all the member orgs again,
                 * just locally update the status of the successfully updated backend record. */
                const index = this._rolesList.findIndex(
                  (user) => user._id === id
                );
                this._rolesList[index].status = status;
                this._setLoading(false);
              },
              (error) => {
                /** Handled by Http Interceptor */
                this._setLoading(false);
              }
            );
        }
      });
  }

  private _getRoles(): void {
    this._loadingService
      .showProgressBarUntilCompleted(
        this._userManagementService.getRolesList(),
        'query'
      )
      .subscribe(
        async (response) => {
          this._rolesList = response?.results;
          this.dataSource = await new MatTableDataSource(this._rolesList);
          this.dataSource.paginator = await this.paginator;
          this.dataSource.sort = await this.sort;
          this._setLoading(false);
        },
        (error) => {
          // shall be handled by Http Interceptor
          this._setLoading(false);
        }
      );
  }

  private _setLoading(value: boolean): void {
    this.isLoading = value;
    if (!value) this._loadingService.loadingOff();
  }
}
