/** 22032021 - Gaurav - JIRA-CA-220: Org Config - UI for Data Attribute configuration */
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import {
  CustomerDataAttributeDataProviderType,
  CustomerDataAttributeDataType,
  CustomerDataAttributes,
  DataAttributeClassParams,
} from 'src/app/dashboard/features/system-admin/models/data-attributes.model';
import { DataAttributes } from './data-attributes';

export class OrgAttributes extends DataAttributes {
  constructor(protected _params: DataAttributeClassParams) {
    super(_params);
    this.displayedColumns = [
      'Code',
      'Name',
      'Short Name',
      'Load Attribute Name',
      'Group',
      'Table View Order',
      'Groupwise Display Order',
      'Data Type',
      'Provider Type',
      'Enum Type',
      'Use In Campaign Filter',
      'Use In Table View',
      'Use In Detail View',
    ];
    this._setDefaultGroupCodeDrDwFilter(true);
  }

  // code	name	shortName	tableViewOrder		useInCampaignFilter	dataProviderType	groupCode	detailViewOrder	type	useInTableView	useInDetailView

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
          loadAttributeName: el.loadAttributeName,
          useInCampaignFilter: el.useInCampaignFilter,
          useInDetailView: el.useInDetailView,
          useInTableView: el.useInTableView,
          tableViewOrder: el.tableViewOrder,
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

    if (!this.form?.controls?.dataAttributes) {
      this.form.addControl(
        'dataAttributes',
        new FormArray([], Validators.required)
      );
    }

    this._dataAttributesList.forEach((row: CustomerDataAttributes) => {
      this.onAddElement({
        code: row?.code,
        name: row?.name,
        detailViewOrder: row?.detailViewOrder,
        hideFromDisplay: row?.detailViewOrder > 0 ? false : true,
        shortName: row?.shortName,
        groupCode: row?.groupCode,
        data: row?.data,
        type: row?.type,
        dataProviderType: row?.dataProviderType,
        loadAttributeName: row?.loadAttributeName,
        useInCampaignFilter: row?.useInCampaignFilter,
        useInDetailView: row?.useInDetailView,
        useInTableView: row?.useInTableView,
        tableViewOrder: row?.tableViewOrder,
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
        _id: new FormControl(el?._id),
        code: new FormControl(el?.code, Validators.required),
        name: new FormControl(el?.name, Validators.required),
        detailViewOrder: new FormControl(
          el?.detailViewOrder ?? defaultOrder,
          Validators.required
        ),
        displayCode: new FormControl(el?.code),
        displayOrder: new FormControl(el?.detailViewOrder),
        hideFromDisplay: new FormControl(hidefromDisplay),
        shortName: new FormControl(el?.shortName, Validators.required),
        groupCode: new FormControl(
          el?.groupCode ?? this.selectedGroupCodeFilter,
          Validators.required
        ),
        displayGroupCode: new FormControl(
          el?.groupCode ?? this.selectedGroupCodeFilter
        ),
        type: new FormControl(
          el?.type ?? CustomerDataAttributeDataType.string,
          Validators.required
        ),
        displayType: new FormControl(
          el?.type ?? CustomerDataAttributeDataType.string
        ),
        dataProviderType: new FormControl(
          el?.dataProviderType ?? CustomerDataAttributeDataProviderType.none,
          Validators.required
        ),
        data: new FormControl(el?.data ?? []),
        loadAttributeName: new FormControl(
          el?.loadAttributeName ?? el?.shortName,
          Validators.required
        ),
        useInCampaignFilter: new FormControl(
          el?.useInCampaignFilter ?? false,
          Validators.required
        ),
        useInDetailView: new FormControl(
          el?.useInDetailView ?? true,
          Validators.required
        ),
        useInTableView: new FormControl(
          el?.useInTableView ?? false,
          Validators.required
        ),
        tableViewOrder: new FormControl(el?.tableViewOrder),
      })
    );

    this.dataAttributeControls[this.dataAttributeControls.length - 1]
      .get('displayOrder')
      ?.disable();

    this.dataAttributeControls[this.dataAttributeControls.length - 1]
      .get('displayCode')
      ?.disable();

    this.dataAttributeControls[this.dataAttributeControls.length - 1]
      .get('displayGroupCode')
      ?.disable();

    this.dataAttributeControls[this.dataAttributeControls.length - 1]
      .get('displayType')
      ?.disable();
  }

  isDisabledDrag(_: number): boolean {
    return true;
  }

  onChangeGroupName(_: number): void {
    //DO NOTHING
  }

  onChangeUseInTableView(index: number): void {
    const changedValue = this.dataAttributeControls[index].value
      ?.useInTableView;

    if (changedValue) {
      const uniqueTableViewOrderValue = Math.max(
        ...this.dataAttributeControls.map((ctrl) =>
          typeof ctrl.value.tableViewOrder === 'number'
            ? ctrl.value.tableViewOrder
            : -1
        )
      );

      this.dataAttributeControls[index]
        .get('tableViewOrder')
        ?.setValue(
          uniqueTableViewOrderValue > 0 ? uniqueTableViewOrderValue + 1 : 1
        );
    } else {
      this.dataAttributeControls[index].get('tableViewOrder')?.setValue(null);
    }
  }

  onChangeTableViewOrder(index: number): void {
    const changedValue = this.dataAttributeControls[index].value
      ?.tableViewOrder;

    if (typeof changedValue === 'number') {
      this.dataAttributeControls[index]
        .get('useInTableView')
        ?.setValue(changedValue !== -1);

      let lastChangedValue = changedValue;
      let lastChangedIndex = index;
      let foundIndex = this.dataAttributeControls.findIndex(
        (control, controlIndex) =>
          control.value.tableViewOrder === lastChangedValue &&
          lastChangedIndex !== controlIndex
      );

      while (foundIndex !== -1) {
        lastChangedValue = lastChangedValue + 1;
        lastChangedIndex = foundIndex;
        this.dataAttributeControls[foundIndex]
          ?.get('tableViewOrder')
          ?.setValue(lastChangedValue);

        foundIndex = this.dataAttributeControls.findIndex(
          (control, controlIndex) =>
            control.value.tableViewOrder === lastChangedValue &&
            lastChangedIndex !== controlIndex
        );
      }
    } else {
      this.dataAttributeControls[index].get('useInTableView')?.setValue(false);
    }
  }
}
