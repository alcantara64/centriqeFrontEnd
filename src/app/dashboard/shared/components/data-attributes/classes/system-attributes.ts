/** 10032021 - Gaurav - JIRA-CA-218: System Config - UI for Customer Attribute configuration */
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import {
  CustomerDataAttributeDataProviderType,
  CustomerDataAttributeDataType,
  CustomerDataAttributes,
  DataAttributeClassParams,
} from 'src/app/dashboard/shared/models/data-attributes.model';
import { DataAttributes } from './data-attributes';

export class SystemAttributes extends DataAttributes {
  constructor(protected _params: DataAttributeClassParams) {
    super(_params);

    this.displayedColumns = [
      'Drag',
      'Code',
      'Name',
      'Short Name',
      'Group',
      'Groupwise Display Order',
      'Data Type',
      'Provider Type',
      'Enum Type',
      'Hide Display',
      'Delete',
    ];
  }

  get payload(): CustomerDataAttributes[] {
    const payload =
      this.dataAttributesArray.value.map((el: CustomerDataAttributes) => {
        return {
          code: el.code,
          name: el.name,
          shortName: el.shortName,
          groupCode: el.groupCode,
          detailViewOrder: el.detailViewOrder,
          type: el.type,
          dataProviderType: el.dataProviderType,
          data: el.data,
        };
      }) ?? <CustomerDataAttributes[]>[];

    /** Sort the records here by the stored dataGroups sequence, so that when the cache is updated and so does the listener,
     * the data attributes components shall be refreshed with the sorted list  */
    return this._sortArray(payload);
  }

  protected _populateFormArray(): void {
    //Clear form array
    while (this.dataAttributesArray && this.dataAttributesArray?.length !== 0) {
      this.dataAttributesArray.removeAt(0);
    }

    this.form.addControl(
      'dataAttributes',
      new FormArray([], Validators.required)
    );

    this._dataAttributesList.forEach((row: CustomerDataAttributes) => {
      this.onAddElement({
        code: row.code,
        name: row.name,
        detailViewOrder: row.detailViewOrder,
        hideFromDisplay: row.detailViewOrder > 0 ? false : true,
        shortName: row.shortName,
        groupCode: row.groupCode,
        data: row.data,
        type: row.type,
        dataProviderType: row.dataProviderType,
      });
    });
  }

  onAddElement(el?: CustomerDataAttributes): void {
    const hidefromDisplay: boolean =
      el && el?.detailViewOrder <= 0 ? true : false;

    const defaultOrder = this.dataAttributesArray.length + 1;

    /** Added duplicate, view-only field displayOrder, because disabled form control values are not captured */
    this.dataAttributesArray.push(
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
        shortName: new FormControl(el?.shortName, Validators.required),
        groupCode: new FormControl(
          el?.groupCode ?? this.selectedGroupCodeFilter,
          Validators.required
        ),
        type: new FormControl(
          el?.type ?? CustomerDataAttributeDataType.string,
          Validators.required
        ),
        dataProviderType: new FormControl(
          el?.dataProviderType ?? CustomerDataAttributeDataProviderType.none,
          Validators.required
        ),
        data: new FormControl(el?.data ?? []),
      })
    );

    this.dataAttributeControls[this.dataAttributeControls.length - 1]
      .get('displayOrder')
      ?.disable();

    this.dataAttributeControls[this.dataAttributeControls.length - 1]
      .get('displayCode')
      ?.disable();

    if (!el) {
      // Re-calculate display order for new records
      this.recalculateDetailViewOrder();
    }
  }
}
