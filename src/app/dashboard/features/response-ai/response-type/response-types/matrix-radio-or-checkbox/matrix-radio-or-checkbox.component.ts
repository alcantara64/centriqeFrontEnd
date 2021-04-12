/** 05012021 - Gaurav - Init version
 * 12042021 - Gaurav - JIRA-CA-364: Validate matrix column field to be not equal to the user option entries
 */
import { Component, Injector, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatrixValuesStruct } from '../../../data-models/question.model';
import { BaseTypeComponent } from '../base-type/base-type.component';

@Component({
  selector: 'app-matrix-radio-or-checkbox',
  templateUrl: './matrix-radio-or-checkbox.component.html',
  styleUrls: ['./matrix-radio-or-checkbox.component.css'],
})
export class MatrixRadioOrCheckboxComponent
  extends BaseTypeComponent
  implements OnInit {
  constructor(injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    this.isLoading = true;
    super.ngOnInit();

    this.form.addControl(
      'matrixName',
      new FormControl(
        this.responseTypeData?.questionTypeStructure?.matrixName ??
          this.question?.questionTypeStructure?.matrixName ??
          this.templateFieldValidationService.getRandomString(
            this.generateNameAttribIDLen
          ),
        Validators.required
      )
    );

    if (this.question) {
      this.question.questionTypeStructure.matrixName = this.form.get(
        'matrixName'
      )?.value;
    }

    this.form.addControl(
      'matrixColumns',
      new FormControl(
        this.responseTypeData?.questionTypeStructure?.matrixColumns ??
          this.question?.questionTypeStructure?.matrixColumns ??
          1,
        [
          Validators.required,
          Validators.min(1),
          Validators.max(12),
          this.columnsMoreThanOptions(this.form),
        ]
      )
    );

    if (this.question) {
      this.question.questionTypeStructure.matrixColumns = this.form.get(
        'matrixColumns'
      )?.value;
    }

    this.form.addControl(
      'showLabelLeft',
      new FormControl(
        this.responseTypeData?.questionTypeStructure?.showLabelLeft ??
          this.question?.questionTypeStructure?.showLabelLeft ??
          false,
        Validators.required
      )
    );

    if (this.question) {
      this.question.questionTypeStructure.showLabelLeft = this.form.get(
        'showLabelLeft'
      )?.value;
    }

    this.form.addControl(
      'matrixValues',
      new FormArray([], [Validators.required])
    );
    this._loadSavedElements(
      this.responseTypeData?.questionTypeStructure?.matrixValues ??
        this.question?.questionTypeStructure?.matrixValues
    );

    /** Reset name attribute values if in copy or survey modes.
     * Send TRUE to reset additionaltext struct name attrib value as well, if applicable */
    this.resetNameAttribValue('matrixName');
    this.resetNameAttribValue('additionalTextName');

    /** Disable field and form:
     * 1. send array of fieldNames to disable
     * 2. would disable complete form if view-only mode */
    this.disableForm(['matrixName', 'additionalTextName']);
  }

  /** Custom form control validators */
  columnsMoreThanOptions(form: FormGroup): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const matrixOptionsLength = form
        ? form?.get('matrixValues')?.value?.length
        : 0;

      if (!control.value || matrixOptionsLength === 0) {
        return null;
      }

      if (control.value >= matrixOptionsLength) {
        return { columnMoreThanOrEqualsOptions: true };
      }

      return null;
    };
  }

  checkMatrixColumnsValueValidity() {
    const matrixColumns = this.form?.get('matrixColumns')?.value;
    const matrixOptionsLength = this.form?.get('matrixValues')?.value
      ? this.form?.get('matrixValues')?.value?.length
      : 0;

    if (!matrixColumns || matrixOptionsLength === 0) {
      return;
    }

    if (matrixColumns >= matrixOptionsLength) {
      this.form
        ?.get('matrixColumns')
        ?.setErrors({ columnMoreThanOrEqualsOptions: true });
    } else {
      if (
        !(
          this.form?.controls?.matrixColumns?.errors?.required ||
          this.form?.controls?.matrixColumns?.errors?.max ||
          this.form?.controls?.matrixColumns?.errors?.min
        )
      ) {
        this.form?.get('matrixColumns')?.setErrors(null);
      }
    }
  }

  /** Form array methods */
  get elements() {
    return (<FormArray>this.form?.get('matrixValues'))?.controls;
  }

  private _loadSavedElements(arr: MatrixValuesStruct[]): void {
    arr &&
      arr.length > 0 &&
      arr.forEach((row: MatrixValuesStruct) => {
        if (row.value !== 'other') {
          const newIdentifierValue = this.templateFieldValidationService.getRandomString(
            this.generateNameAttribIDLen
          );

          this.onAddElement({
            label: row.label,
            id: this.copyMode || this.surveyMode ? newIdentifierValue : row.id,
            value: row.value,
            name:
              this.copyMode || this.surveyMode ? newIdentifierValue : row.name,
          });
        }
      });
  }

  onAddElement(el?: MatrixValuesStruct): void {
    let newNameAttribVal = this.templateFieldValidationService.getRandomString(
      this.generateNameAttribIDLen
    );

    let id = el?.id ?? newNameAttribVal;
    let name = el?.name ?? newNameAttribVal;

    (<FormArray>this.form.get('matrixValues')).push(
      new FormGroup({
        label: new FormControl(el?.label, Validators.required),
        id: new FormControl(id, Validators.required),
        value: new FormControl(el?.value, Validators.required),
        name: new FormControl(name, Validators.required),
      })
    );

    this.checkMatrixColumnsValueValidity();

    /** This shall copy some empty values for undefind entries */
    this._populateQuesionObjectForMatrixValues();
  }

  onChangeElementValue(): void {
    /** This shall update the empty values or undefind entries */
    this._populateQuesionObjectForMatrixValues();
  }

  onDeleteElement(index: number): void {
    (<FormArray>this.form.get('matrixValues')).removeAt(index);
    this.checkMatrixColumnsValueValidity();

    /** This shall update the removed entries */
    this._populateQuesionObjectForMatrixValues();
  }

  private _populateQuesionObjectForMatrixValues(): void {
    if (this.question) {
      let matrixValues = [];

      if (this.form.get('matrixValues')?.value) {
        matrixValues = this.form.get('matrixValues')?.value;
      }

      if (this.form.get('addAdditionalTextField')?.value) {
        let newIdentifierValue = this.templateFieldValidationService.getRandomString(
          this.generateNameAttribIDLen
        );

        this.question.questionTypeStructure.matrixValues = [
          ...matrixValues,
          {
            label: 'Other, please specify:',
            id: newIdentifierValue,
            value: 'other',
            name: newIdentifierValue,
          },
        ];
      } else {
        this.question.questionTypeStructure.matrixValues = matrixValues;
      }
    }
  }

  /** To be called by the event emitter only */
  _getFormData(): any {
    let returnData = {
      ...super._getFormData(),
      questionTypeStructure: {
        matrixName: this.form.get('matrixName')?.value,
        matrixColumns: this.form.get('matrixColumns')?.value,
        showLabelLeft: this.form.get('showLabelLeft')?.value,
        addAdditionalTextField: this.form.get('addAdditionalTextField')?.value,
      },
    };

    let otherFields = {};
    if (this.form.get('addAdditionalTextField')?.value) {
      const newIdentifierValue = this.templateFieldValidationService.getRandomString(
        this.generateNameAttribIDLen
      );

      let matrixValues = [];

      if (this.form.get('matrixValues')?.value) {
        matrixValues = this.form.get('matrixValues')?.value;
      }

      otherFields = {
        questionTypeStructure: {
          ...returnData.questionTypeStructure,
          matrixValues: [
            ...matrixValues,
            {
              label: 'Other, please specify:',
              id: newIdentifierValue,
              value: 'other',
              name: newIdentifierValue,
            },
          ],
          additionalText: {
            name: this.form.get('additionalTextName')?.value,
            maxLength: this.form.get('additionalTextMaxLength')?.value,
            rows: this.form.get('additionalTextRows')?.value,
          },
        },
      };
    } else {
      otherFields = {
        questionTypeStructure: {
          ...returnData.questionTypeStructure,
          matrixValues: this.form.get('matrixValues')?.value,
          additionalText: undefined,
        },
      };
    }

    returnData = {
      ...returnData,
      ...otherFields,
    };

    return {
      ...returnData,
    };
  }
}
