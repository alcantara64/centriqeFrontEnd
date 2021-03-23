/** 30112020 - Gaurav - Init version
 * 02122020 - Gaurav - Injected client service to fetch and update listeners to be used by User CRUD operations
 * 10122020 - Gaurav - Fix to show 'Name (Code)' and removed 'UserId' column from display
 * 08022021 - Gaurav - Added code for new progress-bar service
 */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';

import { dashboardRouteLinks } from 'src/app/dashboard/shared/components/menu/constants.routes';

/** Services */
import { DashboardService } from 'src/app/dashboard/dashboard.service';
import { SnackbarService } from 'src/app/shared/components/snackbar.service';
import { DialogService } from 'src/app/dashboard/shared/components/dialog/dialog.service';
import {
  DialogConditionType,
  SystemDialogReturnType,
  SystemDialogType,
} from 'src/app/dashboard/shared/components/dialog/dialog.model';
import { UserManagementService } from '../user-management.service';
import { ClientSetupService } from '../../client-setup/client-setup.service';
import { mergeMap } from 'rxjs/operators';
import { LoadingService } from 'src/app/shared/services/loading.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-users-setup',
  templateUrl: './users-setup.component.html',
  styleUrls: ['../../../shared/styling/setup-table-list.shared.css'],
})
export class UsersSetupComponent implements OnInit {
  isLoading = false;
  private _showEditComponents = false;
  _usersList: any[] = [];

  /** Cols chosen to be displayed on the table */
  displayedColumns: string[] = [
    'name',
    'email',
    'title',
    'isAdmin',
    'status',
    'action_buttons',
  ];
  dataSource!: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private _dashboardService: DashboardService,
    private _userManagementService: UserManagementService,
    private _clientSetupService: ClientSetupService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _snackbarService: SnackbarService,
    private _dialogService: DialogService,
    private _loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    this._setLoading(true);

    this._showEditComponents =
      this._route.snapshot.routeConfig?.path ===
      dashboardRouteLinks.USER_MANAGEMENT_MANAGE_USERS.routerLink;

    this._getUsers();
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
  onAddUser(): void {
    this._router.navigate(['add'], { relativeTo: this._route });
  }

  onEditUser(id: string): void {
    this._router.navigate(['edit', id], {
      relativeTo: this._route,
    });
  }

  onViewUser(id: string): void {
    this._router.navigate(['view', id], { relativeTo: this._route });
  }

  onDeleteUser(id: string, userName: string): void {
    this._dialogService
      .openSystemDialog({
        alertType: SystemDialogType.warning_alert_yes_no,
        dialogConditionType: DialogConditionType.prompt_custom_data,
        title: 'Delete User',
        body: `Do you want to delete user '${userName}?'`,
      })
      .then((response) => {
        /** Only process confirmation requests */
        if (response === SystemDialogReturnType.continue_yes) {
          this._setLoading(true);

          this._loadingService
            .showProgressBarUntilCompleted(
              this._userManagementService.deleteUser(id)
            )
            .subscribe(
              (result) => {
                /** Show snackbar to user */
                this._snackbarService.showSuccess(`${userName} is deleted!`);

                /** 26112020 - Gaurav - Note: Instead of fetching all the member orgs again,
                 * just locally delete the record. */
                const index = this._usersList.findIndex(
                  (user) => user._id === id
                );
                this.dataSource.data.splice(index, 1);
                /* 21122020 - Abhishek - remove splice fuction from template list */
                // this._usersList.splice(index, 1);
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

  onStatusChange(currentStatus: number, id: string, userName: string): void {
    this._dialogService
      .openSystemDialog({
        alertType: SystemDialogType.warning_alert_yes_no,
        dialogConditionType: DialogConditionType.prompt_custom_data,
        title: 'Status User',
        body: `Do you want to ${
          currentStatus === 0 ? 'activate' : 'inactivate'
        } user '${userName}?'`,
      })
      .then((response) => {
        /** Only process confirmation requests */
        if (response === SystemDialogReturnType.continue_yes) {
          this._setLoading(true);

          /** Update status in backend */
          const status = currentStatus === 0 ? 1 : 0;

          this._loadingService
            .showProgressBarUntilCompleted(
              this._userManagementService.updateUser(id, {
                status,
              })
            )
            .subscribe(
              (result) => {
                /** Show snackbar to user */
                this._snackbarService.showSuccess(
                  `${userName} is ${
                    status === 1 ? 'activated' : 'inactivated'
                  }!`
                );

                /** Instead of fetching all the member orgs again,
                 * just locally update the status of the successfully updated backend record. */
                const index = this._usersList.findIndex(
                  (user) => user._id === id
                );
                this._usersList[index].status = status;
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

  private _getUsers(): void {
    /** 02122020 - Gaurav - Instead of fetching statics, holdingOrgs and memberOrgs for each User Add-Edit-View operation,
     * fetch them here and update the listeners, for them to be used later in the User Add-Edit-View operations */
    const initUserSetupObs: Observable<any> = this._clientSetupService
      .getDataBindingStatics()
      .pipe(
        mergeMap(() => {
          return this._clientSetupService.getHoldingOrgs();
        }),
        mergeMap(() => {
          /** Gaurav - TODO: In future, instead of fetching hundreds or thousands of Member Orgs from the database ,
           * we may have to fetch this dynamically for each selected holdingOrg
           * inside the Member Org Level drop-down of Holding Org (inside Row Level Security)
           */
          return this._clientSetupService.getAllMemberOrgs();
        }),
        mergeMap(() => {
          return this._userManagementService.getRolesList();
        }),
        mergeMap(() => {
          return this._userManagementService.getUsersList();
        })
      );

    this._loadingService
      .showProgressBarUntilCompleted(initUserSetupObs, 'query')
      .subscribe(
        async (response) => {
          this._usersList = response?.results;
          this.dataSource = await new MatTableDataSource(this._usersList);
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
