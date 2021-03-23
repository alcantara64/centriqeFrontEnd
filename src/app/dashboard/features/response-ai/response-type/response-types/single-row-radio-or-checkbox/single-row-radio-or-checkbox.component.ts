/** 05012021 - Gaurav - Init version
 * 12012021 - Gaurav - Some validation changes
 */
import { Component, Injector, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { consoleLog } from 'src/app/shared/util/common.util';
import { RadioOrCheckBoxElement } from '../../../data-models/question.model';
import { BaseTypeComponent } from '../base-type/base-type.component';

@Component({
  selector: 'app-single-row-radio-or-checkbox',
  templateUrl: './single-row-radio-or-checkbox.component.html',
  styleUrls: ['./single-row-radio-or-checkbox.component.css'],
})
export class SingleRowRadioOrCheckboxComponent
  extends BaseTypeComponent
  implements OnInit {
  constructor(injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.form.addControl(
      'groupName',
      new FormControl(
        this.responseTypeData?.questionTypeStructure?.name ??
          this.question?.questionTypeStructure?.name ??
          this.templateFieldValidationService.getRandomString(
            this.generateNameAttribIDLen
          ),
        Validators.required
      )
    );

    if (this.question) {
      this.question.questionTypeStructure.name = this.form.get(
        'groupName'
      )?.value;
    }

    this.form.addControl('elements', new FormArray([], Validators.required));
    this._loadSavedElements(
      this.responseTypeData?.questionTypeStructure.elements ??
        this.question?.questionTypeStructure?.elements
    );

    /** Reset name attribute values if in copy or survey modes. */
    this.resetNameAttribValue('name', 'groupName');
    this.resetNameAttribValue('additionalTextName');

    /** Disable field and form:
     * 1. send array of fieldNames to disable
     * 2. would disable complete form if view-only mode */
    this.disableForm(['groupName', 'additionalTextName']);
  }

  /** Form array methods */
  get elements() {
    return (<FormArray>this.form?.get('elements'))?.controls;
  }

  private _loadSavedElements(arr: RadioOrCheckBoxElement[]): void {
    arr &&
      arr.forEach((row: RadioOrCheckBoxElement) => {
        this.onAddElement({
          label: row.label,
          value: row.value,
          name:
            this.copyMode || this.surveyMode
              ? this.templateFieldValidationService.getRandomString(
                  this.generateNameAttribIDLen
                )
              : row.name,
        });
      });
  }

  onAddElement(el?: RadioOrCheckBoxElement): void {
    let newNameAttribVal = this.templateFieldValidationService.getRandomString(
      this.generateNameAttribIDLen
    );

    let name = el?.name ?? newNameAttribVal;

    (<FormArray>this.form.get('elements')).push(
      new FormGroup({
        label: new FormControl(el?.label, Validators.required),
        value: new FormControl(el?.value, Validators.required),
        name: new FormControl(name, Validators.required),
      })
    );

    /** This shall copy some empty values for undefind entries */
    this.question &&
      (this.question.questionTypeStructure.elements = this.form.get(
        'elements'
      )?.value);
  }

  onChangeElementValue(): void {
    /** This shall update the empty values or undefind entries */
    this.question &&
      (this.question.questionTypeStructure.elements = this.form.get(
        'elements'
      )?.value);
  }

  onDeleteElement(index: number): void {
    (<FormArray>this.form.get('elements')).removeAt(index);

    /** This shall update the removed entries */
    this.question &&
      (this.question.questionTypeStructure.elements = this.form.get(
        'elements'
      )?.value);
  }

  /** To be called by the event emitter only */
  _getFormData(): any {
    let questionTypeStruct = {};

    questionTypeStruct = {
      name: this.form.get('groupName')?.value,
      elements: this.form.get('elements')?.value,
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
