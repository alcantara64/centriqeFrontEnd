/** 10032021 - Gaurav - JIRA-CA-218: System Config - UI for Customer Attribute configuration
 * 22032021 - Gaurav - JIRA-CA-220: Org Config - UI for Data Attribute configuration
 */
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AbstractControl, FormArray, FormGroup } from '@angular/forms';
import {
  CustomerDataAttributeDataProviderType,
  CustomerDataAttributeDataType,
  CustomerDataAttributeEnums,
  CustomerDataAttributeGroup,
  CustomerDataAttributes,
  DataAttributeClassParams,
} from 'src/app/dashboard/features/system-admin/models/data-attributes.model';
import { TemplateFieldValidationService } from '../../../services/template-field-validation.service';

export abstract class DataAttributes {
  readonly dataProviderTypes = CustomerDataAttributeDataProviderType;
  form: FormGroup = new FormGroup({});
  displayedColumns: string[] = <string[]>[];
  linkedGroupCodesList: string[] = <string[]>[];
  dataTypesList: CustomerDataAttributeDataType[] = Object.values(
    CustomerDataAttributeDataType
  );
  dataProviderTypeList: CustomerDataAttributeDataProviderType[] = Object.values(
    CustomerDataAttributeDataProviderType
  );
  selectedGroupCodeFilter!: string;

  protected templateService = TemplateFieldValidationService.instance;
  protected _dataAttributesList!: CustomerDataAttributes[];
  protected _sysDataAttributesList!: CustomerDataAttributes[];
  protected _dataAttributeGroups!: CustomerDataAttributeGroup[];
  protected _dataEnumTypes!: CustomerDataAttributeEnums[];
  private _isViewOnly = false;

  constructor(protected _params: DataAttributeClassParams) {
    this._dataAttributesList = [..._params.dataAttributesList];
    this._sysDataAttributesList = [..._params.sysDataAttributesList];
    this._dataAttributeGroups = [..._params.dataAttributeGroups];
    this._dataEnumTypes = [..._params.dataEnumTypes];
    this._isViewOnly = _params.isViewOnly;
    this._init();
  }

  private _init(): void {
    this._initDataAttributesList();
    this._populateFormArray();
    if (this._isViewOnly) this.form.disable();
  }

  private _initDataAttributesList(): void {
    // Load the list with the CustomerDataAttributeGroup (dataGroups) stored in database
    this.linkedGroupCodesList = this._dataAttributeGroups.map(
      (el: CustomerDataAttributeGroup) => el.code
    );

    // Check for any other groupCode not present in dataGroups but uploaded from backend in bulk upload (should be a rare case)
    const uniqueGroupCodes = [
      ...new Set(
        this._dataAttributesList.map(
          (el: CustomerDataAttributes) => el.groupCode
        ) ?? []
      ),
    ];

    const groupCodesIntersection = uniqueGroupCodes.filter(
      (value) => !this.linkedGroupCodesList.includes(value)
    );

    if (groupCodesIntersection.length > 0) {
      this.linkedGroupCodesList = [
        ...this.linkedGroupCodesList,
        ...groupCodesIntersection,
      ];
    }

    console.log(
      'groupCodesIntersection',
      groupCodesIntersection,
      'this.linkedGroupCodesList',
      this.linkedGroupCodesList
    );

    this._dataAttributesList = this._sortArray(this._dataAttributesList);
    this._setDefaultGroupCodeDrDwFilter();
  }

  protected _setDefaultGroupCodeDrDwFilter(
    setAsAllCodes: boolean = false
  ): void {
    if (setAsAllCodes) {
      this.selectedGroupCodeFilter = 'showAllGroupCodes';
    } else {
      /** Set the first groupCode as selected for Group Code Filter which has any rows for it in the Data Attributes */
      for (const grpCode of this.linkedGroupCodesList) {
        if (this._dataAttributesList.some((row) => row.groupCode === grpCode)) {
          this.selectedGroupCodeFilter = grpCode;
          break;
        }
      }

      if (!this.selectedGroupCodeFilter) {
        this.selectedGroupCodeFilter = this.linkedGroupCodesList[0] ?? '';
      }
    }
  }

  protected abstract _populateFormArray(): void;
  abstract onAddElement(el?: CustomerDataAttributes): void;
  abstract get payload(): CustomerDataAttributes[];

  /** Common getters and methods, impletemented here */
  get isViewOnly(): boolean {
    return this._isViewOnly;
  }

  get dataAttributeGroups(): CustomerDataAttributeGroup[] {
    return [...this._dataAttributeGroups];
  }

  get dataAttributesList(): CustomerDataAttributes[] {
    return [...this.dataAttributesArray?.value];
  }

  get sysDataAttributesList(): CustomerDataAttributes[] {
    return [...this._sysDataAttributesList];
  }

  get enumTypesList(): CustomerDataAttributeEnums[] {
    return [...this._dataEnumTypes];
  }

  get dataAttributeControls(): AbstractControl[] {
    return (<FormArray>this.form?.get('dataAttributes'))?.controls;
  }

  get dataAttributesArray(): FormArray {
    return this.form.get('dataAttributes') as FormArray;
  }

  protected _sortArray(
    arrayToSort: CustomerDataAttributes[]
  ): CustomerDataAttributes[] {
    // The list should be sorted on groupCode's dataGroup list entry and NOT alphabetically
    if (arrayToSort.length > 0 && this._dataAttributeGroups) {
      let sortedByGroupCodeArray: CustomerDataAttributes[] = [];

      this.linkedGroupCodesList.forEach((groupCode: String) => {
        const groupWiseRecords = arrayToSort.filter(
          (el: CustomerDataAttributes) => el.groupCode === groupCode
        );
        if (groupWiseRecords.length > 0) {
          sortedByGroupCodeArray = [
            ...sortedByGroupCodeArray,
            ...groupWiseRecords,
          ];
        }
      });

      return [...sortedByGroupCodeArray];
      // console.table(sortedArray);
    }

    return arrayToSort;
  }

  recalculateDetailViewOrder(): void {
    // Re-calculate order based on available and not (hideFromDisplay === true) rows and groupCode
    this.linkedGroupCodesList.forEach((groupCode: string) => {
      let counter = 0;
      this.dataAttributeControls.forEach((group: AbstractControl) => {
        if (groupCode === group.value?.groupCode) {
          if (!group.value?.hideFromDisplay) {
            counter++;
            group.get('detailViewOrder')?.setValue(counter);
            group.get('displayOrder')?.setValue(counter);
          }
        }
      });
    });
  }

  onDeleteElement(index: number): void {
    this.dataAttributesArray.removeAt(index);
    this.recalculateDetailViewOrder();
  }

  onChangeGroupName(index: number): void {
    const checkCode = this.dataAttributeControls[index].value?.displayCode;
    const checkName = this.dataAttributeControls[index].value?.name;

    // Set the code IFF it is NOT blank
    if (
      this.dataAttributeControls[index].value?.shortName &&
      (!checkCode || checkCode === '')
    ) {
      const generatedCode = this.templateService.getSanitizedCamelCaseValue(
        this.dataAttributeControls[index].value?.shortName
      );

      this.dataAttributeControls[index]
        .get('displayCode')
        ?.setValue(generatedCode);

      this.dataAttributeControls[index].get('code')?.setValue(generatedCode);
    }

    // Set the name IFF it is NOT blank
    if (
      this.dataAttributeControls[index].value?.shortName &&
      (!checkName || checkName === '')
    ) {
      this.dataAttributeControls[index]
        .get('name')
        ?.setValue(this.dataAttributeControls[index].value?.shortName);
    }
  }

  onChangeDataProviderType(index: number): void {
    const dataProviderType = this.dataAttributeControls[index].value
      ?.dataProviderType;

    /** Reset value */
    if (dataProviderType !== this.dataProviderTypes.enum) {
      this.dataAttributeControls[index].get('data')?.setValue([]);
    }
  }

  onChangeHideFromDisplay(index: number): void {
    if (this.dataAttributeControls[index].value?.hideFromDisplay) {
      this.dataAttributeControls[index].get('detailViewOrder')?.setValue(-1);
      this.dataAttributeControls[index].get('displayOrder')?.setValue(-1);
    }

    // Re-calculate display order
    this.recalculateDetailViewOrder();
  }

  onChangeDisplayCode(index: number): void {
    this.dataAttributeControls[index]
      .get('code')
      ?.setValue(this.dataAttributeControls[index].value?.displayCode);
  }

  onChangeTableViewOrder(_: number): void {}
  onChangeUseInTableView(_: number): void {}

  isEmptyEnumType(): AbstractControl | undefined {
    return this.dataAttributeControls.find(
      (ctrl) =>
        ctrl.value.dataProviderType === this.dataProviderTypes.enum &&
        (!ctrl.value.data ||
          !Array.isArray(ctrl.value.data) ||
          !(ctrl.value.data.length > 0))
    );
  }

  isDisabledDrag(index: number): boolean {
    if (this._isViewOnly) return true;
    return this.dataAttributeControls[index].value?.hideFromDisplay;
  }

  onReset(): void {
    //Clear form array
    while (this.dataAttributesArray.length !== 0) {
      this.dataAttributesArray.removeAt(0);
    }

    // Repopulate form array from original (server) values
    this._populateFormArray();
  }

  reInitializeDataAttributes(
    newDataAttributesList: CustomerDataAttributes[]
  ): void {
    this._dataAttributesList = [...newDataAttributesList];
    while (this.dataAttributesArray.length !== 0) {
      this.dataAttributesArray.removeAt(0);
    }

    this._init();
    this._setDefaultGroupCodeDrDwFilter(true);
  }

  compareArrayObject(option: any, value: any): boolean {
    if (!option || !Array.isArray(option) || !option[0]?.value) return false;
    if (!value || !Array.isArray(value) || !value[0]?.value) return false;
    return option[0]?.value === value[0]?.value;
  }

  drop(event: CdkDragDrop<FormGroup[]>) {
    moveItemInArray(
      this.dataAttributeControls,
      event.previousIndex,
      event.currentIndex
    );
    // Re-calculate display order
    this.recalculateDetailViewOrder();
  }
}
