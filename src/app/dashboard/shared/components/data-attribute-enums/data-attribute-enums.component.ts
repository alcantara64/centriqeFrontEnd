/** 17032021 - Gaurav - CA-234: Init version */
import { Component, OnInit, ViewChild } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatAccordion } from '@angular/material/expansion';
import { Subscription } from 'rxjs';
import {
  DashboardService,
  HoldingOrg,
} from 'src/app/dashboard/dashboard.service';
import {
  CustomerDataAttributes,
  CustomerDataAttributeEnums,
} from 'src/app/dashboard/shared/models/data-attributes.model';
import { SystemAdminService } from 'src/app/dashboard/features/system-admin/system-admin.service';
import { SnackbarService } from 'src/app/shared/components/snackbar.service';
import { LoadingService } from 'src/app/shared/services/loading.service';
import { TemplateFieldValidationService } from '../../services/template-field-validation.service';

@Component({
  selector: 'app-data-attribute-enums',
  templateUrl: './data-attribute-enums.component.html',
  styleUrls: ['./data-attribute-enums.component.css'],
})
export class DataAttributeEnumsComponent implements OnInit {
  @ViewChild(MatAccordion) accordion!: MatAccordion;

  isLoading = false;
  form: FormGroup = new FormGroup({});
  private _selectedHoldingOrg!: HoldingOrg;
  private _holdingOrgListenerSub$!: Subscription;

  constructor(
    private _dashboardService: DashboardService,
    private _snackbarService: SnackbarService,
    private _systemAdminService: SystemAdminService,
    private _loadingService: LoadingService,
    public fieldValidator: TemplateFieldValidationService
  ) {}

  ngOnInit(): void {
    this._holdingOrgListenerSub$ = this._dashboardService
      .getCurrentHoldingOrgListenerObs()
      .subscribe((selectedHoldingOrg) => {
        this._selectedHoldingOrg = selectedHoldingOrg;
        this._populateFormArray();
      });
  }

  ngOnDestroy(): void {
    this._holdingOrgListenerSub$?.unsubscribe();
  }

  get dataAttributeEnumControls(): AbstractControl[] {
    return (<FormArray>this.form?.get('dataAttributeEnums'))?.controls;
  }

  get dataAttributeEnumsArray(): FormArray {
    return this.form.get('dataAttributeEnums') as FormArray;
  }

  /** All private methods goes here */
  private _populateFormArray(): void {
    //Clear form array
    while (
      this.dataAttributeEnumsArray &&
      this.dataAttributeEnumsArray?.length !== 0
    ) {
      this.dataAttributeEnumsArray.removeAt(0);
    }

    const dataEnumTypes: CustomerDataAttributeEnums[] =
      this._selectedHoldingOrg?.systemConfig?.dataConfig?.customer
        ?.dataEnumTypes ?? <CustomerDataAttributeEnums[]>[];

    this.form.addControl(
      'dataAttributeEnums',
      new FormArray([], Validators.required)
    );

    dataEnumTypes.forEach((row: CustomerDataAttributeEnums) => {
      this.onAddElement(<CustomerDataAttributeEnums>{
        code: row.code,
        name: row.name,
        data: row.data,
      });
    });
  }

  private _isUsedByDataAttribute(index: number): boolean {
    const enumData = this.dataAttributeEnumControls[index].value?.data ?? '';
    if (!enumData || enumData === '') return false;

    const dataAttributes: any[] =
      this._selectedHoldingOrg?.systemConfig?.dataConfig?.customer
        ?.dataAttributes ?? <any[]>[];

    return dataAttributes.some(
      (r: CustomerDataAttributes) =>
        Array.isArray(r.data) &&
        r.data[0]?.value &&
        r.data[0]?.value === enumData[0]?.value
    );
  }

  private _setLoading(value: boolean): void {
    this.isLoading = value;
    if (!value) this._loadingService.loadingOff();
  }

  /** All public methods goes here */
  onAddElement(el?: CustomerDataAttributeEnums): void {
    const data =
      el?.data?.map((enumEl: any) => {
        return new FormGroup({
          id: new FormControl(enumEl.id, Validators.required),
          value: new FormControl(enumEl.value, Validators.required),
        });
      }) ?? <any>[];

    this.dataAttributeEnumsArray.push(
      new FormGroup({
        code: new FormControl(el?.code, Validators.required),
        displayCode: new FormControl(el?.code, Validators.required),
        name: new FormControl(el?.name, Validators.required),
        data: new FormArray(data, Validators.required),
      })
    );

    if (
      this._isUsedByDataAttribute(this.dataAttributeEnumControls.length - 1)
    ) {
      this.dataAttributeEnumControls[this.dataAttributeEnumControls.length - 1]
        .get('displayCode')
        ?.disable();
    }
  }

  onDeleteElement(index: number): void {
    /** Before deleting check that the data attribute enum to be deleted is not tied to ANY data attribute */
    if (this._isUsedByDataAttribute(index)) {
      // Can't delete linked enum types
      this._snackbarService.showError(
        'Cannot delete this enum type since it is currently being used by a data attribute!',
        3000
      );
      return;
    }

    this.dataAttributeEnumsArray.removeAt(index);
  }

  getEnumStructureControls(enumType: any): AbstractControl[] {
    return enumType.controls.data.controls;
  }

  onAddEnumStructureElement(parentIndex: number): void {
    const data: FormArray = <FormArray>(
      this.dataAttributeEnumControls[parentIndex].get('data')
    );
    data.push(
      new FormGroup({
        id: new FormControl(data.length, Validators.required),
        value: new FormControl(null, Validators.required),
      })
    );
  }

  onDeleteEnumStructureElement(
    parentIndex: number,
    enumElmentIndex: number
  ): void {
    if (this._isUsedByDataAttribute(parentIndex)) {
      // Can't update linked enum types, since its structure may be referenced anywhere
      this._snackbarService.showError(
        'Cannot modify this enum type since it is currently being used by a data attribute!',
        3000
      );
      return;
    }

    const data: FormArray = <FormArray>(
      this.dataAttributeEnumControls[parentIndex].get('data')
    );
    data.removeAt(enumElmentIndex);
  }

  onChangeName(index: number): void {
    const checkCode = this.dataAttributeEnumControls[index].value?.displayCode;

    // Set the code IFF it is NOT blank
    if (
      this.dataAttributeEnumControls[index].value?.name &&
      (!checkCode || checkCode === '')
    ) {
      const generatedCode = this.fieldValidator.getSanitizedCamelCaseValue(
        this.dataAttributeEnumControls[index].value?.name
      );

      this.dataAttributeEnumControls[index]
        .get('code')
        ?.setValue(generatedCode);

      this.dataAttributeEnumControls[index]
        .get('displayCode')
        ?.setValue(generatedCode);
    }
  }

  onSubmit(): void {
    this._setLoading(true);

    const payload =
      this.dataAttributeEnumsArray.value.map(
        (el: CustomerDataAttributeEnums) => {
          return <CustomerDataAttributeEnums>{
            code: el.code,
            name: el.name,
            type: 'string',
            data: el.data,
          };
        }
      ) ?? [];

    console.log({ payload });

    this._loadingService
      .showProgressBarUntilCompleted(
        this._systemAdminService.updateCustomerDataAttributeEnums(payload)
      )
      .subscribe(
        (response) => {
          // console.log({ response });

          // Update the system cache of the selected holdingOrg for the Customer Data Attribute Enums
          this._selectedHoldingOrg.systemConfig.dataConfig.customer.dataEnumTypes = response;

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
    while (this.dataAttributeEnumsArray.length !== 0) {
      this.dataAttributeEnumsArray.removeAt(0);
    }

    // Repopulate form array from original (server) values
    this._populateFormArray();
  }
}
