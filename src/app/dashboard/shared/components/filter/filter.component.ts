/**
 * 05042021 - Abhishek - Init version
 * 05042021 - Abhishek - CA-212: Implement advanced search for customer list.
 */
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { SnackbarService } from '../../../../../app/shared/components/snackbar.service';

interface AttributeType {
  value: string;
  type: string;
}

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css']
})

export class FilterComponent implements OnInit {

  @Input() userAccessOrgData!:any;
  @Input() advancedFilterForm!: FormGroup;
  @Input() filterCriteria!: FormArray;
  @Input() isCanDo!:boolean;
  @Input() attributList: AttributeType[] = [];
  @Input() filterCriteriaArray!:any;
  @Input() dynamicDropDown: any = [];
  @Input() modalType: string = '';
  @Input() loginUserInfo: any;
  @Output() checkCriteria = new EventEmitter();


  displayedColumns: string[] = [
    'date',
    'status',
    'generated',
    'accepted',
    'opened',
    'rejected',
    'failed',
    'action_buttons',
  ];
  numberList: any = [
    { _id: 0, name: 'first' },
    { _id: 1, name: 'second' },
    { _id: 2, name: 'third' },
    { _id: 3, name: 'fourth' },
    { _id: 4, name: 'last' },
  ];
  weekDaysList: any = [
    { _id: 0, name: 'Sunday' },
    { _id: 1, name: 'Monday' },
    { _id: 2, name: 'Tuesday' },
    { _id: 3, name: 'Wednesday' },
    { _id: 4, name: 'Thursday' },
    { _id: 5, name: 'Friday' },
    { _id: 6, name: 'Saturday' },
  ];
  monthsList: any = [
    { _id: 0, name: 'January' },
    { _id: 1, name: 'February' },
    { _id: 2, name: 'March' },
    { _id: 3, name: 'April' },
    { _id: 4, name: 'May' },
    { _id: 5, name: 'June' },
    { _id: 6, name: 'July' },
    { _id: 7, name: 'August' },
    { _id: 8, name: 'September' },
    { _id: 9, name: 'October' },
    { _id: 10, name: 'November' },
    { _id: 11, name: 'December' },
  ];
  operatorList: any = {
    'number-enum': [
      { type: '=', view: 'Equal-to (=)' },
      { type: '!=', view: 'Does not equal-to (!=)' },
      { type: 'In List', view: 'In List' },
      { type: 'Not In List', view: 'Not In List' },
      { type: 'Is populated', view: 'Is populated' },
      { type: 'Is not populated', view: 'Is not populated' },
    ],
    'string-input': [
      { type: '=', view: 'Equal-to (=)' },
      { type: '!=', view: 'Does not equal-to (!=)' },
      { type: 'contains', view: 'Contains' },
      { type: 'Does not contain', view: 'Does Not Contain' },
      { type: 'Is populated', view: 'Is populated' },
      { type: 'Is not populated', view: 'Is not populated' },
    ],
    string: [
      { type: '=', view: 'Equal-to (=)' },
      { type: '!=', view: 'Does not equal-to (!=)' },
      { type: 'contains', view: 'Contains' },
      { type: 'Does not contain', view: 'Does Not Contain' },
      { type: 'In List', view: 'In List' },
      { type: 'Not In List', view: 'Not In List' },
      { type: 'Is populated', view: 'Is populated' },
      { type: 'Is not populated', view: 'Is not populated' },
    ],
    number: [
      { type: '=', view: 'Equal-to (=)' },
      { type: '!=', view: 'Does not equal-to (!=)' },
      { type: '>', view: 'Greater-than (>)' },
      { type: '<', view: 'Less-than (<)' },
      { type: '>=', view: 'Greater-than or Equal-to (>=)' },
      { type: '<=', view: 'Less-than or Equal-to (<=)' },
      { type: 'Is populated', view: 'Is populated' },
      { type: 'Is not populated', view: 'Is not populated' },
    ],
    date: [
      { type: 'days before', view: 'days before' }, //integer input
      { type: 'days after', view: 'days after' }, //integer input
      { type: 'Is populated', view: 'Is populated' },
      { type: 'Is not populated', view: 'Is not populated' },
    ],
    stringMonthDay: [
      { type: 'days before (no year)', view: 'days before' }, //integer input
      { type: 'days after (no year)', view: 'days after' }, //integer input
      { type: 'Is populated', view: 'Is populated' },
      { type: 'Is not populated', view: 'Is not populated' },
    ],
  };

  constructor(
    private formBuilder: FormBuilder,
    private _snackbarService: SnackbarService,
    ) { }

  ngOnInit(): void {
  }
  startParamFun(index: any, type: any) {
    let strValue = this.filterCriteriaArray[index].get('startParam')?.value;
    if (type == 'add') {
      if (strValue != null && strValue != 'null') {
        strValue = strValue + '( ';
      } else {
        strValue = '( ';
      }
    } else {
      if (strValue != null && strValue != 'null' && strValue.length > 0) {
        strValue = strValue.substring(0, strValue.length - 2);
      }
    }
    this.filterCriteriaArray[index].get('startParam')?.reset(strValue);
  }
  endParamFun(index: number, type: any) {
    let edValue = this.filterCriteriaArray[index].get('endParam')?.value;
    if (type == 'add') {
      if (edValue != null && edValue != 'null') {
        edValue = edValue + ') ';
      } else {
        edValue = ') ';
      }
    } else {
      if (edValue != null && edValue != 'null' && edValue.length > 0) {
        edValue = edValue.substring(0, edValue.length - 2);
      }
    }
    this.filterCriteriaArray[index].get('endParam')?.reset(edValue);
  }
  attrChangeFun(index: number) {
    this.filterCriteriaArray[index].get('operator')?.reset();
    this.attributeSetFun(index, 'attr');
  }
  attributeSetFun(index: number, dType: string) {
    //let fa = <FormArray>this.campaignFG.controls['filterCriteriaArray'];
    let attrValue = this.filterCriteriaArray[index].get('attributes')?.value;
    this.filterCriteriaArray[index].get('attrValue')?.reset();
    if (attrValue == null || attrValue == 'null') {
      this.filterCriteriaArray[index].get('attributes')?.reset(null);
      this.filterCriteriaArray[index].get('attrValueType')?.reset();
      return;
    }
    let dataType: any = '';
    this.loginUserInfo.filter((item: any) => {
      if (item['code'] == attrValue && dataType == '') {
        dataType = item;
      }
    });
    let optValue = this.filterCriteriaArray[index].get('operator')?.value;
    let type = dataType.type;
    if (dataType != '') {
      let doopList: any = [];
      let dropList: any = [];
      if (this.dynamicDropDown.length > 0) {
        this.dynamicDropDown[index] = [];
      }

      if (dType == 'attr') {
        this.filterCriteriaArray[index].get('attrType')?.reset(dataType.type);
      }
      switch (dataType.dataProviderType) {
        case 'enum':
          if (dataType.type == 'number') {
            this.filterCriteriaArray[index]
              .get('attrType')
              ?.reset('number-enum');
            type = 'string';
          }
          dropList = dataType.data;
          break;
        case 'dynamic':
          dataType.data.forEach((item: any) => {
            if (!doopList.includes(item)) {
              dropList.push({ id: item, value: item, dataT: type });
              doopList.push(item);
            }
          });
          break;
        default:
          if (dataType.type == 'string') {
            this.filterCriteriaArray[index]
              .get('attrType')
              ?.reset('string-input');
            type = 'Text';
          } else if (dataType.type == 'integer') {
            this.filterCriteriaArray[index].get('attrType')?.reset('number');
            type = dataType.type;
          } else if (dataType.type == 'date') {
            this.filterCriteriaArray[index].get('attrType')?.reset('date');
            type = dataType.type;
          } else if (dataType.type == 'stringMonthDay') {
            this.filterCriteriaArray[index]
              .get('attrType')
              ?.reset('stringMonthDay');
            type = dataType.type;
          }
          break;
      }

      if (this.dynamicDropDown[index] == undefined) {
        this.dynamicDropDown.push({ [index]: dropList });
      } else {
        this.dynamicDropDown[index] = { [index]: dropList };
      }
    }

    if (optValue != null && optValue != 'null') {
      switch (optValue) {
        case 'In List':
        case 'Not In List':
          if (dataType.data == undefined) {
            //fa.controls[index]['controls']['attrValueType'].reset('Chips');
            this.filterCriteriaArray[index].get('attrValueType')?.reset(type);
          } else {
            this.filterCriteriaArray[index]
              .get('attrValueType')
              ?.reset('Multiple');
          }
          break;
        case 'Is populated':
        case 'Is not populated':
          this.filterCriteriaArray[index].get('attrValueType')?.reset();
          break;
        case 'contains':
          this.filterCriteriaArray[index].get('attrValueType')?.reset('Text');
          break;
        case 'days before':
        case 'days after':
        case 'days before (no year)':
        case 'days after (no year)':
          this.filterCriteriaArray[index]
            .get('attrValueType')
            ?.reset('integer');
          break;
        default:
          this.filterCriteriaArray[index].get('attrValueType')?.reset(type);
          break;
      }
    } else {
      if (dataType.type == 'date' || dataType.type == 'stringMonthDay') {
        this.filterCriteriaArray[index].get('attrValueType')?.reset('integer');
      } else {
        this.filterCriteriaArray[index].get('attrValueType')?.reset(type);
      }
    }
  }
  operatorChange(index: number) {
    this.attributeSetFun(index, 'opr');
  }

  //Number change function in filter criteria
  numberChange(e: any): any {
    if (e.which == 45 || e.which == 44 || e.which == 46) {
      return false;
    }
  }
  filterIntegerChnage(type: any, evt: any) {
    if (type == 'integer') {
      if (
        (evt.which != 8 && evt.which != 0 && evt.which < 48) ||
        evt.which > 57
      ) {
        evt.preventDefault();
      }
    }
  }
  delRoleRow(index: any) {
    let checkVal = this.filterCriteriaArray[index].get('andOr')?.value;
    let operate = this.filterCriteriaArray[index].get('operator')?.value;
    if ((checkVal == null || checkVal == 'null') && this.dynamicDropDown > 1) {
      this.filterCriteriaArray[index - 1].get('andOr')?.reset(null);
    }
    let dropItems = this.dynamicDropDown;
    this.dynamicDropDown.splice(index, 1);
    dropItems.forEach((item: any, ind: number) => {
      if (index <= ind) {
        this.dynamicDropDown[ind][ind] = this.dynamicDropDown[ind][ind + 1];
      }
    });
    this.onDeleteRowFilterCriteria(index);
    if (this.dynamicDropDown.length == 0) {
      this.addRowCriteria();
    }
  }
//Add filter criteria row
addRowCriteria(): void {
  let fa = <FormArray>this.advancedFilterForm.controls['filterCriteriaArray'];
  fa.push(
    this.formBuilder.group({
      startParam: new FormControl(null),
      attributes: new FormControl(null),
      operator: new FormControl(null),
      attrValue: new FormControl(null),
      endParam: new FormControl(null),
      attrValueType: new FormControl(null),
      attrType: new FormControl(null),
      andOr: new FormControl(null),
    })
  );
  let index = fa.length;
  this.dynamicDropDown.push({ [index]: [] });
}
  onDeleteRowFilterCriteria(index: number): void {
    (<FormArray>this.advancedFilterForm.get('filterCriteriaArray')).removeAt(index);
  }
  customerFilterCr(type: any, index: number) {
    let stParam = this.filterCriteriaArray[index].get('startParam')?.value;
    let attr = this.filterCriteriaArray[index].get('attributes')?.value;
    let operate = this.filterCriteriaArray[index].get('operator')?.value;
    let attrValue = this.filterCriteriaArray[index].get('attrValue')?.value;
    let edParam = this.filterCriteriaArray[index].get('endParam')?.value;
    if (attr == null || operate == null || attrValue == null) {
      if (operate == 'Is populated' || operate == 'Is not populated') {
      } else {
        this._snackbarService.showError('Please fill all fields.');
        return;
      }
    }
    this.filterCriteriaArray[index].get('andOr')?.reset(type);
    this.addRowCriteria();
  }
  checkCriteriaFun() {
    this.checkCriteria.emit();
  }
}
