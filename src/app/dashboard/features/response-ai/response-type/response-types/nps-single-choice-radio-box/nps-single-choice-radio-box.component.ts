/** 05012021 - Gaurav - Init version
 * 12012021 - Gaurav - Some validation changes
 * 25012021 - Gaurav - Added additional text fields for single-choice-radiobox question type
 */
import { Component, Injector, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { BaseTypeComponent } from '../base-type/base-type.component';

@Component({
  selector: 'app-nps-single-choice-radio-box',
  templateUrl: './nps-single-choice-radio-box.component.html',
})
export class NpsSingleChoiceRadioBoxComponent
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
        this.responseTypeData?.questionTypeStructure?.groupName ??
          this.question?.questionTypeStructure?.groupName ??
          this.templateFieldValidationService.getRandomString(
            this.generateNameAttribIDLen
          ),
        Validators.required
      )
    );

    if (this.question) {
      this.question.questionTypeStructure.groupName = this.form.get(
        'groupName'
      )?.value;
    }

    this.form.addControl(
      'groupElementsCount',
      new FormControl(
        this.responseTypeData?.questionTypeStructure?.groupElementsCount ??
          this.question?.questionTypeStructure?.groupElementsCount,
        [Validators.required, Validators.min(1), Validators.max(11)]
      )
    );

    if (this.question) {
      this.question.questionTypeStructure.groupElementsCount = this.form.get(
        'groupElementsCount'
      )?.value;
    }

    this.form.addControl(
      'leftHintText',
      new FormControl(
        this.responseTypeData?.questionTypeStructure?.leftHintText ??
          this.question?.questionTypeStructure?.leftHintText ??
          'Not at all Likely',
        Validators.required
      )
    );

    if (this.question) {
      this.question.questionTypeStructure.leftHintText = this.form.get(
        'leftHintText'
      )?.value;
    }

    this.form.addControl(
      'rightHintText',
      new FormControl(
        this.responseTypeData?.questionTypeStructure?.rightHintText ??
          this.question?.questionTypeStructure?.rightHintText ??
          'Extremely Likely',
        Validators.required
      )
    );

    if (this.question) {
      this.question.questionTypeStructure.rightHintText = this.form.get(
        'rightHintText'
      )?.value;
    }

    /** Reset name OR id attribute values if in copy or survey modes. */
    this.resetNameAttribValue('groupName');
    this.resetNameAttribValue('additionalTextName');

    /** Disable field and form:
     * 1. send array of fieldNames to disable
     * 2. would disable complete form if view-only mode */
    this.disableForm(['groupName', 'additionalTextName']);
  }

  /** To be called by the event emitter only */
  _getFormData(): any {
    let questionTypeStruct = {};

    questionTypeStruct = {
      groupName: this.form.get('groupName')?.value,
      groupElementsCount: this.form.get('groupElementsCount')?.value,
      leftHintText: this.form.get('leftHintText')?.value,
      rightHintText: this.form.get('rightHintText')?.value,
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

    return {
      ...super._getFormData(),
      questionTypeStructure: {
        ...questionTypeStruct,
      },
    };
  }
}
