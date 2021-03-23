/** 23032021 - Gaurav - JIRA-CA-220: Get and reconcile sys data attributes */
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';

import { DataAttributes } from 'src/app/dashboard/shared/components/data-attributes/classes/data-attributes';
import { CustomerDataAttributes } from '../../../system-admin/models/data-attributes.model';

@Component({
  selector: 'app-reconcile-sys-data-attributes',
  templateUrl: './reconcile-sys-data-attributes.component.html',
  styleUrls: ['./reconcile-sys-data-attributes.component.css'],
})
export class ReconcileSysDataAttributesComponent implements OnInit {
  @Input() dataAttributesInstance!: DataAttributes;
  @Output() whenSwitchCurrentTab = new EventEmitter<boolean>(false);
  ELEMENT_DATA!: CustomerDataAttributes[];

  displayedColumns: { value: string; displayValue: string }[] = [
    { value: 'select', displayValue: 'select' },
    { value: 'code', displayValue: 'Code' },
    { value: 'name', displayValue: 'Name' },
    { value: 'shortName', displayValue: 'Short Name' },
    { value: 'groupCode', displayValue: 'Group' },
    { value: 'detailViewOrder', displayValue: 'Groupwise Display Order' },
    { value: 'type', displayValue: 'Data Type' },
    { value: 'dataProviderType', displayValue: 'Provider Type' },
  ];

  displayedColumnValues: string[] = this.displayedColumns.map(
    (col) => col.value
  );

  dataSource!: MatTableDataSource<CustomerDataAttributes>;
  selection!: SelectionModel<CustomerDataAttributes>;

  constructor() {}

  ngOnInit(): void {
    console.log('this.dataAttributesInstance', this.dataAttributesInstance);

    this.dataSource = new MatTableDataSource<CustomerDataAttributes>(
      this.dataAttributesInstance?.sysDataAttributesList.map((row, index) => {
        return <CustomerDataAttributes>{
          code: row.code,
          name: row.name,
          shortName: row.shortName,
          groupCode: row.groupCode,
          detailViewOrder: row.detailViewOrder,
          type: row.type,
          dataProviderType: row.dataProviderType,
          data: row.data,
          position: index + 1,
        };
      })
    );

    this.selection = new SelectionModel<CustomerDataAttributes>(
      true,
      <CustomerDataAttributes[]>[]
    );

    this.dataSource.data.forEach((row) => {
      const foundIndex = this.dataAttributesInstance?.dataAttributesList?.findIndex(
        (el) => el.code === row.code
      );

      if (foundIndex != -1) {
        this.selection.select(row);
      }
    });
  }

  private _isHiddenDetailViewOrderSelected(): boolean {
    return this.selection.selected.some((row) => row.detailViewOrder === -1);
  }

  onReconcile(readonly: boolean = false): void {
    // if (this._isHiddenDetailViewOrderSelected()) {
    //   this._snackbarService.showError(
    //     'Some selected rows have a Display Order of -1 i.e. hidden from display!'
    //   );
    //  // return from here for user to force uncheck it? ?
    // }

    let finalDataAttributesList: CustomerDataAttributes[] =
      this.selection.selected ?? <CustomerDataAttributes[]>[];

    if (
      finalDataAttributesList.length > 0 &&
      this.dataAttributesInstance?.dataAttributesList?.length > 0
    ) {
      finalDataAttributesList = finalDataAttributesList.map(
        (row: CustomerDataAttributes) => {
          let orgValues: CustomerDataAttributes = <CustomerDataAttributes>{};
          let sysValues: CustomerDataAttributes = {
            code: row.code,
            data: row.data,
            dataProviderType: row.dataProviderType,
            detailViewOrder: row.detailViewOrder,
            groupCode: row.groupCode,
            name: row.name,
            shortName: row.shortName,
            type: row.type,
          };

          const foundOrgRow = this.dataAttributesInstance?.dataAttributesList.find(
            (el: CustomerDataAttributes) => el.code === row.code
          );

          if (foundOrgRow) {
            orgValues = {
              ...sysValues,
              loadAttributeName: foundOrgRow.loadAttributeName,
              tableViewOrder: foundOrgRow.tableViewOrder,
              useInCampaignFilter: foundOrgRow.useInCampaignFilter,
              useInDetailView: foundOrgRow.useInDetailView,
              useInTableView: foundOrgRow.useInTableView,
              _id: foundOrgRow._id,
            };

            if (readonly) {
              /** Reset back the fields, to the last stored value, that are common between system and holding org data attributes and are editable */
              orgValues = {
                ...orgValues,
                name: foundOrgRow.name,
                shortName: foundOrgRow.shortName,
                dataProviderType: foundOrgRow.dataProviderType,
                data: foundOrgRow.data,
              };
            }
          }

          const finalValues: CustomerDataAttributes =
            Object.entries(orgValues).length > 0 ? orgValues : sysValues;
          return <CustomerDataAttributes>{
            ...finalValues,
          };
        }
      );
    }

    // console.log('this.selection.selected', this.selection.selected);
    console.log(
      'this.dataAttributesInstance?.dataAttributesList',
      this.dataAttributesInstance?.dataAttributesList
    );
    console.log({ finalDataAttributesList });

    this.dataAttributesInstance.reInitializeDataAttributes(
      finalDataAttributesList
    );

    this.whenSwitchCurrentTab.emit(true);
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach((row) => this.selection.select(row));
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: CustomerDataAttributes): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${
      row.position! + 1
    }`;
  }
}
