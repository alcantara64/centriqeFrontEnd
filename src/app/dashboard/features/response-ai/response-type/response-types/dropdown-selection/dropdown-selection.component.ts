/** 05012021 - Gaurav - Init version */
import { Component, Injector, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import {
  DropDownApperance,
  DropDownValuesStruct,
} from '../../../data-models/question.model';
import { BaseTypeComponent } from '../base-type/base-type.component';

@Component({
  selector: 'app-dropdown-selection',
  templateUrl: './dropdown-selection.component.html',
  styleUrls: ['./dropdown-selection.component.css'],
})
export class DropdownSelectionComponent
  extends BaseTypeComponent
  implements OnInit {
  selectDropDownAppearance = [
    { value: DropDownApperance.standard, viewValue: 'Standard' },
    { value: DropDownApperance.outline, viewValue: 'Outline' },
    { value: DropDownApperance.fill, viewValue: 'Fill' },
  ];

  constructor(injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.form.addControl(
      'dropDownName',
      new FormControl(
        this.responseTypeData?.questionTypeStructure?.dropDownName ??
          this.question?.questionTypeStructure?.dropDownName ??
          this.templateFieldValidationService.getRandomString(
            this.generateNameAttribIDLen
          ),
        Validators.required
      )
    );

    if (this.question) {
      this.question.questionTypeStructure.dropDownName = this.form.get(
        'dropDownName'
      )?.value;
    }

    this.form.addControl(
      'dropDownApperance',
      new FormControl(
        this.responseTypeData?.questionTypeStructure?.dropDownApperance ??
          this.question?.questionTypeStructure?.dropDownApperance ??
          DropDownApperance.outline,
        Validators.required
      )
    );

    if (this.question) {
      this.question.questionTypeStructure.dropDownApperance = this.form.get(
        'dropDownApperance'
      )?.value;
    }

    this.form.addControl(
      'dropDownLabel',
      new FormControl(
        this.responseTypeData?.questionTypeStructure?.dropDownLabel ??
          this.question?.questionTypeStructure?.dropDownLabel,
        Validators.required
      )
    );

    this.form.addControl(
      'dropDownValues',
      new FormArray([], Validators.required)
    );
    this._loadSavedElements(
      this.responseTypeData?.questionTypeStructure.dropDownValues ??
        this.question?.questionTypeStructure?.dropDownValues
    );

    /** Reset name OR id attribute values if in copy or survey modes. */
    this.resetNameAttribValue('dropDownName');
    this.resetNameAttribValue('additionalTextName');

    /** Disable field and form:
     * 1. send array of fieldNames to disable
     * 2. would disable complete form if view-only mode */
    this.disableForm(['dropDownName', 'additionalTextName']);
  }

  /** Form array methods */
  get dropDownValues() {
    return (<FormArray>this.form?.get('dropDownValues'))?.controls;
  }

  private _loadSavedElements(arr: DropDownValuesStruct[]): void {
    arr &&
      arr.forEach((row: DropDownValuesStruct) => {
        this.onAddElement({
          value: row.value,
          viewValue: row.viewValue,
        });
      });
  }

  onAddElement(el?: DropDownValuesStruct): void {
    (<FormArray>this.form.get('dropDownValues')).push(
      new FormGroup({
        value: new FormControl(el?.value, Validators.required),
        viewValue: new FormControl(el?.viewValue, Validators.required),
      })
    );

    /** This shall copy some empty values for undefind entries */
    this._populateQuesionObjectForFormArrayValues();
  }

  onChangeElementValue(): void {
    /** This shall update the empty values or undefind entries */
    this._populateQuesionObjectForFormArrayValues();
  }

  onDeleteElement(index: number): void {
    (<FormArray>this.form.get('dropDownValues')).removeAt(index);

    /** This shall update the removed entries */
    this._populateQuesionObjectForFormArrayValues();
  }

  private _populateQuesionObjectForFormArrayValues(): void {
    this.question &&
      (this.question.questionTypeStructure.dropDownValues = this.form.get(
        'dropDownValues'
      )?.value);
  }

  /** To be called by the event emitter only */
  _getFormData(): any {
    let questionTypeStruct = {};

    questionTypeStruct = {
      dropDownName: this.form.get('dropDownName')?.value,
      dropDownApperance: this.form.get('dropDownApperance')?.value,
      dropDownLabel: this.form.get('dropDownLabel')?.value,
      dropDownValues: this.form.get('dropDownValues')?.value,
      addAdditionalTextField: this.form.get('addAdditionalTextField')?.value,
    };

    if (this.form.get('addAdditionalTextField')?.value) {
      questionTypeStruct = {
        ...questionTypeStruct,
        additionalText: {
          name: this.form.get('additionalTextName')?.value,
          maxLength: this.form.get('additionalTextMaxLength')?.value,
          rows: this.form.get('additionalTextRows')?.value,
        },
      };
    }

    let returnData = {
      ...super._getFormData(),
      questionTypeStructure: {
        ...questionTypeStruct,
      },
    };

    return {
      ...returnData,
    };
  }
}
