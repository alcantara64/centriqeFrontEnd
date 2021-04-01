/** 24112020 - Gaurav - Init version
 * 25112020 - Added Activated Route and action button process
 * 26112020 - Added status update, loading listener and snackbar
 * 28112020 - Updated CSS path file to shared one
 * 10122020 - Gaurav - Fix to show 'Name (Code)', removed 'Code' column from display and introduced 'Business Vertical' column
 * 08022021 - Gaurav - Added code for new progress-bar service
 */
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';

import { dashboardRouteLinks } from '../../../shared/components/menu/constants.routes';

/** Material Table related */
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

/** Services */
import { ClientSetupService } from '../client-setup.service';
import { DialogService } from 'src/app/dashboard/shared/components/dialog/dialog.service';
import { DashboardService } from 'src/app/dashboard/dashboard.service';
import { SnackbarService } from 'src/app/shared/components/snackbar.service';

/** System Dialog related interfaces/enums */
import {
  DialogConditionType,
  SystemDialogReturnType,
  SystemDialogType,
} from 'src/app/dashboard/shared/components/dialog/dialog.model';
import { consoleLog, ConsoleTypes } from 'src/app/shared/util/common.util';
import { LoadingService } from 'src/app/shared/services/loading.service';
import {AppConfigService} from 'src/app/shared/services/app-config.service';

@Component({
  selector: 'app-holding-org-setup',
  templateUrl: './holding-org-setup.component.html',
  styleUrls: ['../../../shared/styling/setup-table-list.shared.css'],
})
export class HoldingOrgSetupComponent implements OnInit, OnDestroy {
  isLoading = false;
  private _showEditComponents = false;
  private _getOrgSub$!: Subscription;
  private _holdingOrgs: any[] = [];

  /** Cols chosen to be displayed on the table */
  displayedColumns: string[] = [
    'name',
    'bussinessVertical',
    'websiteAddress',
    'status',
    'action_buttons',
  ];
  dataSource!: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private _clientSetupService: ClientSetupService,
    private _dialogService: DialogService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _snackbarService: SnackbarService,
    public appConfigService: AppConfigService,
    private _loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    this._setLoading(true);

    this._showEditComponents =
      this._route.snapshot.routeConfig?.path ===
      dashboardRouteLinks.CLIENT_SETUP_MANAGE_HOLDINGORG.routerLink;

    this._getHoldingOrgs();
  }

  ngOnDestroy(): void {
    /** http subscriptions are unsubscribed by Angular on garbage collection, still unsubscribing it from here */
    this._getOrgSub$.unsubscribe();
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
  onAddHoldingOrg(): void {
    this._router.navigate(['add'], { relativeTo: this._route });
  }

  onEditOrg(id: string): void {
    this._router.navigate(['edit', id], {
      relativeTo: this._route,
    });
  }

  onViewOrg(id: string): void {
    this._router.navigate(['view', id], { relativeTo: this._route });
  }

  onStatusChange(currentStatus: number, id: string, orgName: string): void {
    this._dialogService
      .openSystemDialog({
        alertType: SystemDialogType.warning_alert_yes_no,
        dialogConditionType: DialogConditionType.prompt_custom_data,
        title: 'Status Holding Organization',
        body: `Do you want to ${
          currentStatus === 0 ? 'activate' : 'inactivate'
        } this organization?`,
      })
      .then((response) => {
        /** Only process confirmation requests */
        if (response === SystemDialogReturnType.continue_yes) {
          this._setLoading(true);

          /** Update status in backend */
          const status = currentStatus === 0 ? 1 : 0;

          this._loadingService
            .showProgressBarUntilCompleted(
              this._clientSetupService.updateHoldingOrg(id, {
                status,
              })
            )
            .subscribe(
              (result) => {
                /** Show snackbar to user */
                this._snackbarService.showSuccess(
                  `${orgName} is ${status === 1 ? 'activated' : 'inactivated'}!`
                );

                /** 26112020 - Gaurav - Note: Instead of fetching all the orgs again,
                 * just locally update the status of the successfully updated backend record.
                 * Beware, this shall NOT update the listener used when the orgs are fetched from the API, and to which the
                 * Holding Org component for ADD/EDIT/VIEW listens to. But since they do not process 'status' field, no need
                 * to fetch data again or update the listener here
                 */
                const index = this._holdingOrgs.findIndex(
                  (org) => org._id === id
                );
                this._holdingOrgs[index].status = status;
                this._setLoading(false);
              },
              (error) => {
                /** Handled by Http Interceptor */
                this._setLoading(false);
              }
            );
        }
      })
      .catch((error) => {
        // DEV team => Pass VALID parameters to this service method
      });
  }

  private _setLoading(value: boolean): void {
    this.isLoading = value;
    if (!value) this._loadingService.loadingOff();
  }

  private _getHoldingOrgs(): void {
    const getOrgsObs: Observable<any> = this._clientSetupService.getHoldingOrgs();

    this._getOrgSub$ = this._loadingService
      .showProgressBarUntilCompleted(getOrgsObs, 'query')
      .subscribe(
        async (response: any) => {
          this._holdingOrgs = response?.results;
          // console.log(this._holdingOrgs);
          this.dataSource = await new MatTableDataSource(this._holdingOrgs);
          this.dataSource.paginator = await this.paginator;
          this.dataSource.sort = await this.sort;
          this._setLoading(false);
        },
        (error) => {
          consoleLog({ consoleType: ConsoleTypes.error, valuesArr: [error] });
          this._setLoading(false);
        }
      );
  }
}
