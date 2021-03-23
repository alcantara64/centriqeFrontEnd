/** 28122020 - Gaurav - Init: base response-type component for all response-types to extend
 * 29122020 - Gaurav - Added dataDomain and holdingOrg
 * 01012021 - Gaurav - Added mandatory field responseIdentifierText
 * 19012021 - Gaurav - Added code and removed displayName
 * 22012021 - Gaurav - Added subQuestionText field
 * 25012021 - Gaurav - Enabled additional text fields for single-choice-radiobox question type
 */
import {
  Component,
  EventEmitter,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { TemplateFieldValidationService } from 'src/app/dashboard/shared/services/template-field-validation.service';
import { SnackbarService } from 'src/app/shared/components/snackbar.service';
import { consoleLog } from 'src/app/shared/util/common.util';
import { Question, QuestionTypes } from '../../../data-models/question.model';
import { ResponseTypeStruct } from '../../../data-models/survey.model';
import { ResponseAIService } from '../../../response-ai.service';

@Component({
  template: '',
})
export class BaseTypeComponent implements OnInit, OnDestroy {
  protected generateNameAttribIDLen = 25;
  public templateFieldValidationService!: TemplateFieldValidationService;
  protected _responseAIService!: ResponseAIService;
  protected _snackbarService!: SnackbarService;

  private _formStatusSub$!: Subscription;

  @Input() question!: Question;
  @Input() responseTypeData!: ResponseTypeStruct;
  @Input() questionType!: QuestionTypes;
  @Input() form!: FormGroup;
  @Input() surveyMode = false;
  @Input() accessMode!: string;
  @Output() formPayloadEmitter = new EventEmitter<any>();

  readonly questionTypes = QuestionTypes;
  viewOnly = false;
  copyMode = false;
  readonly additionalInputSettings = Object.freeze({
    maxLength: {
      min: 100,
      max: 1000,
    },
    rows: {
      min: 1,
      max: 10,
    },
  });

  readonly questionTextFieldMaxLength = 200;
  readonly responseIdentifierTextMaxLength = 100;

  addAdditionalTextFormControls = false;
  isLoading = false;

  constructor(injector: Injector) {
    this.templateFieldValidationService = injector.get(
      TemplateFieldValidationService
    );
    this._responseAIService = injector.get(ResponseAIService);
    this._snackbarService = injector.get(SnackbarService);
  }

  ngOnInit(): void {
    this.viewOnly = this.accessMode === 'View';
    this.copyMode = this.accessMode === 'Copy';

    this.addAdditionalTextFormControls =
      this.questionType === QuestionTypes.ratingStar ||
      this.questionType === QuestionTypes.ratingEmoji ||
      this.questionType === QuestionTypes.singleChoiceRadioH ||
      this.questionType === QuestionTypes.multiChoiceCheckH ||
      this.questionType === QuestionTypes.matrixRadio ||
      this.questionType === QuestionTypes.matrixCheck ||
      this.questionType === QuestionTypes.dropDownSelection ||
      this.questionType === QuestionTypes.singleChoiceRadioBox;

    if (!this.form) this.form = new FormGroup({});

    this.form.addControl(
      'questionText',
      new FormControl(
        this.responseTypeData?.questionText ?? this.question?.questionText
      )
    );
    this.form.addControl(
      'questionNumberOrderToDisplay',
      new FormControl(
        this.responseTypeData?.questionNumberOrderToDisplay ??
          this.question?.questionNumberOrderToDisplay
      )
    );
    this.form.addControl(
      'subQuestionText',
      new FormControl(
        this.responseTypeData?.subQuestionText ?? this.question?.subQuestionText
      )
    );
    this.form.addControl(
      'questionRequired',
      new FormControl(
        (this.responseTypeData
          ? this.responseTypeData?.required
          : this.question?.required) ?? false,
        Validators.required
      )
    );

    if (this.question) {
      this.question.required = this.form.get('questionRequired')?.value;
    }

    this.form.addControl(
      'responseIdentifierText',
      new FormControl(
        (this.responseTypeData
          ? this.responseTypeData?.responseIdentifierText
          : this.question?.responseIdentifierText) ?? '',
        Validators.required
      )
    );

    if (this.addAdditionalTextFormControls) {
      this.form.addControl(
        'addAdditionalTextField',
        new FormControl(
          this.responseTypeData?.questionTypeStructure
            ?.addAdditionalTextField ??
            this.question?.questionTypeStructure?.addAdditionalTextField ??
            false,
          Validators.required
        )
      );

      if (this.question?.questionTypeStructure?.addAdditionalTextField) {
        this.question.questionTypeStructure.addAdditionalTextField = this.form.get(
          'addAdditionalTextField'
        )?.value;
      }

      this.form.addControl(
        'additionalTextName',
        new FormControl(
          this.responseTypeData?.questionTypeStructure?.additionalText?.name ??
            this.question?.questionTypeStructure?.additionalText?.name ??
            this.templateFieldValidationService.getRandomString(
              this.generateNameAttribIDLen
            ),
          Validators.required
        )
      );

      if (this.question?.questionTypeStructure?.additionalText?.name) {
        this.question.questionTypeStructure.additionalText.name = this.form.get(
          'additionalTextName'
        )?.value;
      }

      if (this.form.get('addAdditionalTextField')?.value) {
        this.form.addControl(
          'additionalTextMaxLength',
          new FormControl(
            this.responseTypeData?.questionTypeStructure?.additionalText
              ?.maxLength ??
              this.question?.questionTypeStructure?.additionalText?.maxLength,
            [
              Validators.required,
              Validators.min(this.additionalInputSettings.maxLength.min),
              Validators.max(this.additionalInputSettings.maxLength.max),
            ]
          )
        );

        this.form.addControl(
          'additionalTextRows',
          new FormControl(
            this.responseTypeData?.questionTypeStructure?.additionalText
              ?.rows ??
              this.question?.questionTypeStructure?.additionalText?.rows,
            [
              Validators.required,
              Validators.min(this.additionalInputSettings.rows.min),
              Validators.max(this.additionalInputSettings.rows.max),
            ]
          )
        );
      } else {
        this.form.addControl(
          'additionalTextMaxLength',
          new FormControl(
            this.responseTypeData?.questionTypeStructure?.additionalText
              ?.maxLength ??
              this.question?.questionTypeStructure?.additionalText?.maxLength
          )
        );

        this.form.addControl(
          'additionalTextRows',
          new FormControl(
            this.responseTypeData?.questionTypeStructure?.additionalText
              ?.rows ??
              this.question?.questionTypeStructure?.additionalText?.rows
          )
        );
      }

      this.form.get('additionalTextName')?.disable();
    }

    if (this.viewOnly) {
      this.form.disable();
    }

    if (this.copyMode) {
      if (
        this.responseTypeData?.questionText &&
        this.responseTypeData?.questionText?.length > 0
      ) {
        this.responseTypeData.questionText =
          this.responseTypeData.questionText.slice(0, 95) + '_copy';
        this.form.patchValue({
          questionText: this.responseTypeData.questionText,
        });
      }

      if (
        this.responseTypeData?.responseIdentifierText &&
        this.responseTypeData?.responseIdentifierText?.length > 0
      ) {
        this.responseTypeData.responseIdentifierText =
          this.responseTypeData.responseIdentifierText.slice(0, 95) + '_copy';
        this.form.patchValue({
          responseIdentifierText: this.responseTypeData.responseIdentifierText,
        });
      }
    }

    /** Set initial status for saved question-types load */
    this.surveyMode &&
      this.question &&
      this.question.setQuestionFormValidity(this.form.valid);

    /** Emit form payload to the parent on certain conditions */
    this._formStatusSub$ = this.form.statusChanges.subscribe((formStatus) => {
      // consoleLog({ valuesArr: ['this.surveyMod', this.surveyMode] });
      // consoleLog({ valuesArr: ['tformStatus', formStatus] });
      // consoleLog({ valuesArr: ['this.form()', this.form] });
      // consoleLog({ valuesArr: ['this._getFormData()', this._getFormData()] });
      if (!this.surveyMode && formStatus === 'VALID') {
        this.formPayloadEmitter.emit(this._getFormData());
      }

      /** Set the validity of this form in the class instance, when in survey-mode */
      this.surveyMode &&
        this.question &&
        this.question.setQuestionFormValidity(formStatus === 'VALID');
    });
  }

  ngOnDestroy(): void {
    this._formStatusSub$.unsubscribe();
  }

  public onAdditionalInputToggle(): void {
    if (this.form.get('addAdditionalTextField')?.value) {
      // consoleLog({ valuesArr: ['inside onAdditionalInputToggle'] });

      this.form.get('additionalTextName')?.setValidators(Validators.required);
      this.form.get('additionalTextName')?.updateValueAndValidity();

      this.form
        .get('additionalTextMaxLength')
        ?.setValidators([
          Validators.required,
          Validators.min(this.additionalInputSettings.maxLength.min),
          Validators.max(this.additionalInputSettings.maxLength.max),
        ]);
      this.form.get('additionalTextMaxLength')?.updateValueAndValidity();

      this.form
        .get('additionalTextRows')
        ?.setValidators([
          Validators.required,
          Validators.min(this.additionalInputSettings.rows.min),
          Validators.max(this.additionalInputSettings.rows.max),
        ]);
      this.form.get('additionalTextRows')?.updateValueAndValidity();

      if (this.question) {
        this.question.questionTypeStructure = {
          ...this.question.questionTypeStructure,
          additionalText: {
            name: this.form.get('additionalTextName')?.value,
            maxLength: undefined,
            rows: undefined,
          },
        };
      }
    } else {
      this.form.get('additionalTextName')?.clearValidators();
      this.form.get('additionalTextMaxLength')?.clearValidators();
      this.form.get('additionalTextRows')?.clearValidators();

      this.form.patchValue({
        additionalTextMaxLength: undefined,
        additionalTextRows: undefined,
      });

      if (this.question) {
        this.question.questionTypeStructure = {
          ...this.question.questionTypeStructure,
          additionalText: undefined,
        };
      }
    }
  }

  /** Reset name OR id attribute values if in copy or survey modes. */
  protected resetNameAttribValue(
    fieldName: string,
    formFieldName?: string
  ): void {
    let newNameAttribVal = this.templateFieldValidationService.getRandomString(
      this.generateNameAttribIDLen
    );

    if (this.copyMode) {
      if (fieldName === 'additionalTextName') {
        if (
          this.responseTypeData?.questionTypeStructure?.additionalText?.name
        ) {
          this.responseTypeData.questionTypeStructure.additionalText.name = newNameAttribVal;
          this.form.patchValue({
            additionalTextName: newNameAttribVal,
          });
        }
      } else {
        if (this.responseTypeData?.questionTypeStructure?.[fieldName]) {
          this.responseTypeData.questionTypeStructure[
            fieldName
          ] = newNameAttribVal;
          this.form.patchValue({
            [formFieldName ? formFieldName : fieldName]: newNameAttribVal,
          });
        }
      }
    }

    if (this.surveyMode) {
      if (fieldName === 'additionalTextName') {
        if (this.question?.questionTypeStructure?.additionalText?.name) {
          this.question.questionTypeStructure.additionalText.name = newNameAttribVal;
          this.form.patchValue({
            additionalTextName: newNameAttribVal,
          });
        }
      } else {
        if (this.question?.questionTypeStructure?.[fieldName]) {
          this.question.questionTypeStructure[fieldName] = newNameAttribVal;
          this.form.patchValue({
            [formFieldName ? formFieldName : fieldName]: newNameAttribVal,
          });
        }
      }
    }
  }

  protected disableForm(fieldArray: string[]): void {
    /** Disabled fields, or may be hide altogether and generate random values for them */
    fieldArray &&
      fieldArray.forEach((fieldName: string) => {
        this.form.get(fieldName)?.disable();
      });

    /** Disable in view only mode */
    if (this.viewOnly) {
      this.form.disable();
    }
  }

  protected _getFormData(): any {
    return {
      questionType: this.questionType,
      questionNumber:
        this.responseTypeData?.questionNumber ?? this.question?.questionNumber,
      dataDomain: this.form.get('dataDomain')?.value,
      holdingOrg: this.form.get('holdingOrg')?.value,
      memberOrg: this.form.get('memberOrg')?.value,
      code: this.form.get('code')?.value,
      name: this.form.get('name')?.value,
      componentCategory: this.form.get('componentCategory')?.value,
      status: this.form.get('status')?.value,
      questionNumberOrderToDisplay: this.form.get(
        'questionNumberOrderToDisplay'
      )?.value,
      questionText: this.form.get('questionText')?.value,
      subQuestionText: this.form.get('subQuestionText')?.value,
      required: this.form.get('questionRequired')?.value,
      responseIdentifierText: this.form.get('responseIdentifierText')?.value,
    };
  }
}
