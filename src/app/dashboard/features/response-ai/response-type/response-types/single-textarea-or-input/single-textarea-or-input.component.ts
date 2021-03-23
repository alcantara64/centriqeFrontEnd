/** 17122020 - Gaurav - Init version: This component is to be shared between creating new response/question type and by the survey component
 * 22122020 - Gaurav - Moved response type related fields to response-type component. Disabled 'id' and 'name' attribute fields to be disabled from
 * user input and to populate values automatically. Also, send the payload to the parent component when the form is valid (only when not in survey mode)
 * 22122020 - Gaurav - Set the validity of this form in the class instance, when in survey-mode
 * 24122020 - Gaurav - Suffix _copy/Copy to selected fields and regenerate name attribute value when in copy/duplicate mode
 * 28122020 - Gaurav - Moved all response-types common code to base response-type and extended this component from that
 * 12012021 - Gaurav - Some validation changes
 */
import { Component, Injector, OnInit } from '@angular/core';
import { BaseTypeComponent } from '../base-type/base-type.component';
import { FormControl, Validators } from '@angular/forms';
import { QuestionTypes } from '../../../data-models/question.model';

@Component({
  selector: 'app-single-textarea-or-input',
  templateUrl: './single-textarea-or-input.component.html',
})
export class SingleTextAreaOrInputComponent
  extends BaseTypeComponent
  implements OnInit {
  readonly singleTextInput = Object.freeze({
    maxLength: {
      min: 10,
      max: 100,
    },
  });
  maxLengthMin!: number;
  maxLengthMax!: number;

  inputTypes!: any[];
  constructor(injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.maxLengthMin =
      this.questionType === QuestionTypes.singleTextArea
        ? this.additionalInputSettings.maxLength.min
        : this.singleTextInput.maxLength.min;

    this.maxLengthMax =
      this.questionType === QuestionTypes.singleTextArea
        ? this.additionalInputSettings.maxLength.max
        : this.singleTextInput.maxLength.max;

    this.inputTypes = this._responseAIService.getInputTypes();

    this.form.addControl(
      'questionFieldLabel',
      new FormControl(
        this.responseTypeData?.questionTypeStructure?.label ??
          this.question?.questionTypeStructure?.label
      )
    );
    this.form.addControl(
      'questionFieldID',
      new FormControl(
        this.responseTypeData?.questionTypeStructure?.id ??
          this.question?.questionTypeStructure?.id ??
          this.templateFieldValidationService.getRandomString(
            this.generateNameAttribIDLen
          )
      )
    );

    if (this.question) {
      this.question.questionTypeStructure.id = this.form.get(
        'questionFieldID'
      )?.value;
    }

    if (this.questionType === QuestionTypes.singleTextInput) {
      this.form.addControl(
        'questionFieldType',
        new FormControl(
          this.responseTypeData?.questionTypeStructure?.type ??
            this.question?.questionTypeStructure?.type,
          Validators.required
        )
      );
    }

    this.form.addControl(
      'questionFieldName',
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
        'questionFieldName'
      )?.value;
    }

    this.form.addControl(
      'questionFieldMaxLength',
      new FormControl(
        this.responseTypeData?.questionTypeStructure?.maxLength ??
          this.question?.questionTypeStructure?.maxLength,
        [
          Validators.required,
          Validators.min(this.maxLengthMin),
          Validators.max(this.maxLengthMax),
        ]
      )
    );

    if (this.questionType === QuestionTypes.singleTextArea) {
      this.form.addControl(
        'questionFieldRows',
        new FormControl(
          this.responseTypeData?.questionTypeStructure?.rows ??
            this.question?.questionTypeStructure?.rows,
          [
            Validators.required,
            Validators.min(this.additionalInputSettings.rows.min),
            Validators.max(this.additionalInputSettings.rows.max),
          ]
        )
      );
    }

    /** Reset name OR id attribute values if in copy or survey modes. */
    this.resetNameAttribValue('name', 'questionFieldName');
    this.resetNameAttribValue('id', 'questionFieldID');

    /** Disable field and form:
     * 1. send array of fieldNames to disable
     * 2. would disable complete form if view-only mode */
    this.disableForm(['questionFieldID', 'questionFieldName']);
  }

  /** To be called by the event emitter only */
  _getFormData(): any {
    return {
      ...super._getFormData(),
      questionTypeStructure: {
        label: this.form.get('questionFieldLabel')?.value,
        id: this.form.get('questionFieldID')?.value,
        type: this.form.get('questionFieldType')?.value,
        name: this.form.get('questionFieldName')?.value,
        maxLength: this.form.get('questionFieldMaxLength')?.value,
        rows: this.form.get('questionFieldRows')?.value,
      },
    };
  }
}
