/** 10032021 - Gaurav - JIRA-CA-218: System Config - UI for Customer Attribute configuration
 * 22032021 - Gaurav - JIRA-CA-220: Org Config - UI for Data Attribute configuration
 */
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';

import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  DashboardService,
  HoldingOrg,
} from 'src/app/dashboard/dashboard.service';
import {
  CustomerDataAttributeEnums,
  CustomerDataAttributeGroup,
  CustomerDataAttributes,
  DataAttributeClassParams,
  OrgDataAttributesFormData,
} from 'src/app/dashboard/features/system-admin/models/data-attributes.model';
import { SystemAdminService } from 'src/app/dashboard/features/system-admin/system-admin.service';
import { SnackbarService } from 'src/app/shared/components/snackbar.service';
import { LoadingService } from 'src/app/shared/services/loading.service';
import { TemplateFieldValidationService } from '../../services/template-field-validation.service';
import {
  DashboardMenuEnum,
  dashboardRouteLinks,
} from '../menu/constants.routes';
import { DataAttributes } from './classes/data-attributes';
import { OrgAttributes } from './classes/org-attributes';
import { SystemAttributes } from './classes/system-attributes';

@Component({
  selector: 'app-data-attributes',
  templateUrl: './data-attributes.component.html',
  styleUrls: ['./data-attributes.component.css'],
})
export class DataAttributesComponent implements OnInit, OnDestroy {
  @Input() orgDataAttributes?: CustomerDataAttributes;
  @Output() dataAttribInstanceEmitter = new EventEmitter<DataAttributes>();

  readonly parentList = DashboardMenuEnum;
  isLoading = false;
  private _isViewOnly = false;
  currentParent!: DashboardMenuEnum;
  currentParentName!: string;
  private _selectedHoldingOrg!: HoldingOrg;
  private _holdingOrgListenerSub$!: Subscription;
  private _formStatusSub$!: Subscription;
  attributesInstance!: DataAttributes;

  constructor(
    private _route: ActivatedRoute,
    private _loadingService: LoadingService,
    private _snackbarService: SnackbarService,
    private _dashboardService: DashboardService,
    private _systemAdminService: SystemAdminService,
    public fieldValidator: TemplateFieldValidationService
  ) {
    const routerPath = this._route.snapshot.routeConfig?.path;
    switch (routerPath) {
      case dashboardRouteLinks.SYSTEM_ADMIN_MANAGE_CUSTOMER_DATA_ATTRIBUTES
        .routerLink:
        this.currentParent = DashboardMenuEnum.SYSTEM_ADMIN;
        this.currentParentName = 'System';
        break;

      case dashboardRouteLinks.CLIENT_SETUP_MANAGE_HOLDINGORG_ADD.routerLink:
      case dashboardRouteLinks.CLIENT_SETUP_MANAGE_HOLDINGORG_EDIT.routerLink:
      case dashboardRouteLinks.CLIENT_SETUP_MANAGE_HOLDINGORG_VIEW.routerLink:
      case dashboardRouteLinks.CLIENT_SETUP_HOLDINGORG_VIEW_VIEW.routerLink:
        this.currentParent = DashboardMenuEnum.CLIENT_SETUP;
        this.currentParentName = 'Org';

        this._isViewOnly = [
          dashboardRouteLinks.CLIENT_SETUP_MANAGE_HOLDINGORG_VIEW.routerLink,
          dashboardRouteLinks.CLIENT_SETUP_HOLDINGORG_VIEW_VIEW.routerLink,
        ].includes(routerPath);

        break;
      default:
        this._snackbarService.showError(
          'Invalid access to Data Attributes page!'
        );
    }
  }

  get isViewOnly(): boolean {
    return this._isViewOnly;
  }

  get isDisableButton(): boolean {
    return this.isLoading || !this.attributesInstance || this._isViewOnly;
  }

  ngOnInit(): void {
    if (!this.currentParent) return; // Don't load anything
    if (
      ![
        DashboardMenuEnum.SYSTEM_ADMIN,
        DashboardMenuEnum.CLIENT_SETUP,
      ].includes(this.currentParent)
    )
      return;

    this._initClass();
  }

  ngOnDestroy(): void {
    this._holdingOrgListenerSub$?.unsubscribe();
    this._formStatusSub$?.unsubscribe();
  }

  private _initClass(): void {
    this._holdingOrgListenerSub$ = this._dashboardService
      .getCurrentHoldingOrgListenerObs()
      .subscribe((selectedHoldingOrg: HoldingOrg) => {
        this._selectedHoldingOrg = { ...selectedHoldingOrg };

        const dataAttributesList =
          this.currentParent === DashboardMenuEnum.SYSTEM_ADMIN
            ? this._selectedHoldingOrg?.systemConfig?.dataConfig?.customer
                ?.dataAttributes
            : this.orgDataAttributes ?? <CustomerDataAttributes[]>[];

        const params = <DataAttributeClassParams>{
          dataAttributesList,
          sysDataAttributesList:
            this._selectedHoldingOrg?.systemConfig?.dataConfig?.customer
              ?.dataAttributes ?? <CustomerDataAttributes[]>[],
          dataAttributeGroups:
            this._selectedHoldingOrg?.systemConfig?.dataConfig?.customer
              ?.dataGroups ?? <CustomerDataAttributeGroup[]>[],
          dataEnumTypes:
            this._selectedHoldingOrg?.systemConfig?.dataConfig?.customer
              ?.dataEnumTypes ?? <CustomerDataAttributeEnums[]>[],
          isViewOnly: this._isViewOnly,
        };

        this.attributesInstance =
          this.currentParent === DashboardMenuEnum.SYSTEM_ADMIN
            ? new SystemAttributes(params)
            : new OrgAttributes(params);

        if (this.currentParent === DashboardMenuEnum.CLIENT_SETUP) {
          this.dataAttribInstanceEmitter.emit(this.attributesInstance);
        }
      });
  }

  private _setLoading(value: boolean): void {
    this.isLoading = value;
    if (!value) this._loadingService.loadingOff();
  }

  async onSubmit(): Promise<void> {
    const recordWithEmptyEnumType = this.attributesInstance.isEmptyEnumType();
    if (recordWithEmptyEnumType) {
      this._snackbarService.showError(
        `Enum Type is required when Data Provider Type is set to 'enum' for attribute name '${recordWithEmptyEnumType.value.name}' within group '${recordWithEmptyEnumType.value.groupCode}'`,
        9000
      );

      return;
    }

    if (!this.attributesInstance.form.valid) return;

    this._setLoading(true);

    const payload = this.attributesInstance?.payload;
    console.log('data attribs', { payload });

    this._loadingService
      .showProgressBarUntilCompleted(
        this._systemAdminService.updateCustomerDataAttributes(payload)
      )
      .subscribe(
        (response) => {
          // console.log({ response });
          // Update the system cache of the selected holdingOrg for the Customer Data Attributes
          this._selectedHoldingOrg.systemConfig.dataConfig.customer.dataAttributes = response;
          this._dashboardService.setSelectedHoldingOrg(
            this._selectedHoldingOrg
          );
          // User need to logon to refresh user logon state with the new system settings
          this._snackbarService.showSuccess(
            'Please logout and log in again to use the new settings!',
            3000
          );
          this._setLoading(false);
        },
        () => {
          this._setLoading(false);
        }
      );
  }
}
