/** 08032021 - Gaurav - JIRA-CA-217: Init version of System Config - UI for Customer Attribute Group configuration */
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import {
  DashboardService,
  HoldingOrg,
} from 'src/app/dashboard/dashboard.service';

import { CustomerDataAttributeGroup } from '../../../../shared/models/data-attributes.model';
import { SnackbarService } from 'src/app/shared/components/snackbar.service';
import { SystemAdminService } from '../../system-admin.service';
import { LoadingService } from 'src/app/shared/services/loading.service';
import { Subscription } from 'rxjs';
import { TemplateFieldValidationService } from 'src/app/dashboard/shared/services/template-field-validation.service';

@Component({
  templateUrl: './data-attributes-group.component.html',
  styleUrls: ['./data-attributes-group.component.css'],
})
export class DataAttributesGroupComponent implements OnInit, OnDestroy {
  isLoading = false;
  form: FormGroup = new FormGroup({});
  private _selectedHoldingOrg!: HoldingOrg;
  private _holdingOrgListenerSub$!: Subscription;

  displayedColumns: string[] = [
    'Drag',
    'Code',
    'Name',
    'Display Order',
    'Hide Display',
    'Delete',
  ];

  constructor(
    private _dashboardService: DashboardService,
    private _snackbarService: SnackbarService,
    private _systemAdminService: SystemAdminService,
    private _loadingService: LoadingService,
    public fieldValidator: TemplateFieldValidationService
  ) {}

  /** All ng lifecycles goes here */
  ngOnInit(): void {
    this._holdingOrgListenerSub$ = this._dashboardService
      .getCurrentHoldingOrgListenerObs()
      .subscribe((selectedHoldingOrg) => {
        this._selectedHoldingOrg = selectedHoldingOrg;
        // console.log({ selectedHoldingOrg });

        this._populateFormArray();
      });
  }

  ngOnDestroy(): void {
    this._holdingOrgListenerSub$?.unsubscribe();
  }

  /** All getters-setters goes here */
  get dataAttributeGroupControls() {
    return (<FormArray>this.form?.get('dataAttributeGroups'))?.controls;
  }

  get dataAttributeGroupsArray(): FormArray {
    return this.form.get('dataAttributeGroups') as FormArray;
  }

  get isDuplicateGroupCodes(): boolean {
    const uniqueGroupCodes = new Set(
      this.dataAttributeGroupsArray.value.map(
        (el: CustomerDataAttributeGroup) => el.code
      )
    );

    return uniqueGroupCodes.size !== this.dataAttributeGroupsArray.length;
  }

  /** All private methods goes here */
  private _populateFormArray(): void {
    //Clear form array
    while (
      this.dataAttributeGroupsArray &&
      this.dataAttributeGroupsArray?.length !== 0
    ) {
      this.dataAttributeGroupsArray.removeAt(0);
    }

    const dataGroups: CustomerDataAttributeGroup[] =
      this._selectedHoldingOrg?.systemConfig?.dataConfig?.customer
        ?.dataGroups ?? <CustomerDataAttributeGroup[]>[];

    this.form.addControl(
      'dataAttributeGroups',
      new FormArray([], Validators.required)
    );

    dataGroups.forEach((row: CustomerDataAttributeGroup) => {
      this.onAddElement({
        code: row.code,
        name: row.name,
        detailViewOrder: row.detailViewOrder,
        hideFromDisplay: row.detailViewOrder > 0 ? false : true,
      });
    });
  }

  private _recalculateDetailViewOrder(): void {
    // Re-calculate order based on available and not (hideFromDisplay === true) rows
    let counter = 0;
    this.dataAttributeGroupControls.forEach((group: AbstractControl) => {
      if (!group.value?.hideFromDisplay) {
        counter++;
        group.get('detailViewOrder')?.setValue(counter);
        group.get('displayOrder')?.setValue(counter);
      }
    });
  }

  private _isUsedByDataAttribute(groupCode: string): boolean {
    if (!groupCode || groupCode === '') return false;

    const dataAttributes: any[] =
      this._selectedHoldingOrg?.systemConfig?.dataConfig?.customer
        ?.dataAttributes ?? <any[]>[];

    return dataAttributes.some((r: any) => r.groupCode === groupCode);
  }

  private _setLoading(value: boolean): void {
    this.isLoading = value;
    if (!value) this._loadingService.loadingOff();
  }

  /** All public methods goes here */
  onAddElement(el?: CustomerDataAttributeGroup): void {
    const hidefromDisplay: boolean =
      el && el?.detailViewOrder <= 0 ? true : false;

    const defaultOrder = this.dataAttributeGroupsArray.length + 1;

    /** Added duplicate, view-only field displayOrder, because disabled form control values are not captured */
    this.dataAttributeGroupsArray.push(
      new FormGroup({
        code: new FormControl(el?.code, Validators.required),
        name: new FormControl(el?.name, Validators.required),
        detailViewOrder: new FormControl(
          el?.detailViewOrder ?? defaultOrder,
          Validators.required
        ),
        displayCode: new FormControl(el?.code, Validators.required),
        displayOrder: new FormControl(el?.detailViewOrder ?? defaultOrder),
        hideFromDisplay: new FormControl(hidefromDisplay, Validators.required),
      })
    );

    this.dataAttributeGroupControls[this.dataAttributeGroupControls.length - 1]
      .get('displayOrder')
      ?.disable();

    if (this._isUsedByDataAttribute(el?.code ?? '')) {
      this.dataAttributeGroupControls[
        this.dataAttributeGroupControls.length - 1
      ]
        .get('displayCode')
        ?.disable();
    }

    if (!el) {
      // Re-calculate display order
      this._recalculateDetailViewOrder();
    }
  }

  onDeleteElement(index: number): void {
    const code = this.dataAttributeGroupControls[index].value?.code ?? '';

    /** Before deleting check that the data attribute group to be deleted is not tied to ANY data attribute */
    if (this._isUsedByDataAttribute(code)) {
      // Can't delete linked groups
      this._snackbarService.showError(
        'Cannot delete this group since it is currently being used by a data attribute!',
        3000
      );
      return;
    }

    this.dataAttributeGroupsArray.removeAt(index);
  }

  onChangeDisplayCode(index: number): void {
    this.dataAttributeGroupControls[index]
      .get('code')
      ?.setValue(this.dataAttributeGroupControls[index].value?.displayCode);
  }

  onChangeGroupName(index: number): void {
    const checkCode = this.dataAttributeGroupControls[index].value?.displayCode;

    // Set the code IFF it is NOT blank
    if (
      this.dataAttributeGroupControls[index].value?.name &&
      (!checkCode || checkCode === '')
    ) {
      const generatedCode = this.fieldValidator.getSanitizedCamelCaseValue(
        this.dataAttributeGroupControls[index].value?.name
      );

      this.dataAttributeGroupControls[index]
        .get('displayCode')
        ?.setValue(generatedCode);

      this.dataAttributeGroupControls[index]
        .get('code')
        ?.setValue(generatedCode);
    }
  }

  onChangeHideFromDisplay(index: number): void {
    if (this.dataAttributeGroupControls[index].value?.hideFromDisplay) {
      this.dataAttributeGroupControls[index]
        .get('detailViewOrder')
        ?.setValue(-1);
      this.dataAttributeGroupControls[index].get('displayOrder')?.setValue(-1);
    }

    // Re-calculate display order
    this._recalculateDetailViewOrder();
  }

  isDisabledDrag(index: number): boolean {
    return this.dataAttributeGroupControls[index].value?.hideFromDisplay;
  }

  onSubmit(): void {
    if (this.isDuplicateGroupCodes) {
      this._snackbarService.showError(
        'Please remove duplicate group codes!',
        5000
      );
      return;
    }

    this._setLoading(true);

    const payload =
      this.dataAttributeGroupsArray.value.map(
        (el: CustomerDataAttributeGroup) => {
          return {
            code: el.code,
            name: el.name,
            detailViewOrder: el.detailViewOrder,
          };
        }
      ) ?? [];

    this._loadingService
      .showProgressBarUntilCompleted(
        this._systemAdminService.updateCustomerDataAttributeGroups(payload)
      )
      .subscribe(
        (response) => {
          // console.log({ response });

          // Update the system cache of the selected holdingOrg for the Customer Data Attribute Groups
          this._selectedHoldingOrg.systemConfig.dataConfig.customer.dataGroups = response;

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

  onReset(): void {
    //Clear form array
    while (this.dataAttributeGroupsArray.length !== 0) {
      this.dataAttributeGroupsArray.removeAt(0);
    }

    // Repopulate form array from original (server) values
    this._populateFormArray();
  }

  drop(event: CdkDragDrop<FormGroup[]>) {
    moveItemInArray(
      this.dataAttributeGroupControls,
      event.previousIndex,
      event.currentIndex
    );

    // Re-calculate display order
    this._recalculateDetailViewOrder();
  }
}
