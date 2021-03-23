/** 05012021 - Gaurav - Init version
 * 25012021 - Gaurav - Added fields tableColSubHeading and tableDataRowSubHeading to likerts
 */
import { Component, Injector, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { consoleLog } from 'src/app/shared/util/common.util';
import {
  QuestionTypes,
  TableDataCols,
  TableDataElement,
  TableDataRows,
} from '../../../data-models/question.model';
import { BaseTypeComponent } from '../base-type/base-type.component';

@Component({
  selector: 'app-likert-radio-or-checkbox',
  templateUrl: './likert-radio-or-checkbox.component.html',
  styleUrls: ['./likert-radio-or-checkbox.component.css'],
})
export class LikertRadioOrCheckboxComponent
  extends BaseTypeComponent
  implements OnInit {
  likertDataLengthConfig = {
    tableDataRowHeading: 100,
    tableColHeading: 100,
  };

  constructor(injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.form.addControl(
      'tableName',
      new FormControl(
        this.responseTypeData?.questionTypeStructure?.tableName ??
          this.question?.questionTypeStructure?.tableName ??
          this.templateFieldValidationService.getRandomString(
            this.generateNameAttribIDLen
          ),
        Validators.required
      )
    );

    if (this.question) {
      this.question.questionTypeStructure.tableName = this.form.get(
        'tableName'
      )?.value;
    }

    this.form.addControl(
      'tableHeading',
      new FormControl(
        this.responseTypeData?.questionTypeStructure?.tableHeading ??
          this.question?.questionTypeStructure?.tableHeading
      )
    );

    this.form.addControl(
      'addAdditionalTextForEachRow',
      new FormControl(
        this.responseTypeData?.questionTypeStructure
          ?.addAdditionalTextForEachRow ??
          this.question?.questionTypeStructure?.addAdditionalTextForEachRow ??
          false
      )
    );

    if (this.question) {
      this.question.questionTypeStructure.addAdditionalTextForEachRow = this.form.get(
        'addAdditionalTextForEachRow'
      )?.value;
    }

    this.form.addControl('tableCols', new FormArray([], Validators.required));
    this._loadSavedCols(
      this.responseTypeData?.questionTypeStructure?.tableCols ??
        this.question?.questionTypeStructure?.tableCols
    );

    this.form.addControl('tableRows', new FormArray([], Validators.required));
    this._loadSavedRows(
      this.responseTypeData?.questionTypeStructure?.tableRows ??
        this.question?.questionTypeStructure?.tableRows
    );

    /** Reset name attribute values if in copy or survey modes.
     * Send TRUE to reset additionaltext struct name attrib value as well, if applicable */
    this.resetNameAttribValue('tableName');

    /** Disable field and form:
     * 1. send array of fieldNames to disable
     * 2. would disable complete form if view-only mode */
    this.disableForm(['tableName']);
  }

  /** Form array methods */
  get tableCols() {
    return (<FormArray>this.form?.get('tableCols'))?.controls;
  }

  private _loadSavedCols(arr: TableDataCols[]): void {
    arr &&
      arr.length > 0 &&
      arr.forEach((row: TableDataCols) => {
        this.onAddCol({
          tableColHeading: row.tableColHeading,
          tableColSubHeading: row.tableColSubHeading,
          tableColDataValue: row.tableColDataValue,
        });
      });
  }

  onAddCol(el?: TableDataCols): void {
    if (this.questionType === QuestionTypes.likertCheck) {
      let tableColDataValueName =
        (<TableDataElement>el?.tableColDataValue)?.name ??
        this.templateFieldValidationService.getRandomString(
          this.generateNameAttribIDLen
        );

      if (this.copyMode || this.surveyMode) {
        tableColDataValueName = this.templateFieldValidationService.getRandomString(
          this.generateNameAttribIDLen
        );
      }

      (<FormArray>this.form.get('tableCols')).push(
        new FormGroup({
          tableColHeading: new FormControl(
            el?.tableColHeading,
            Validators.required
          ),
          tableColSubHeading: new FormControl(el?.tableColSubHeading),
          tableColDataValue: new FormGroup({
            name: new FormControl(tableColDataValueName, Validators.required),
            value: new FormControl(
              (<TableDataElement>el?.tableColDataValue)?.value,
              Validators.required
            ),
          }),
        })
      );
    } else {
      (<FormArray>this.form.get('tableCols')).push(
        new FormGroup({
          tableColHeading: new FormControl(
            el?.tableColHeading,
            Validators.required
          ),
          tableColSubHeading: new FormControl(el?.tableColSubHeading),
          tableColDataValue: new FormControl(
            el?.tableColDataValue,
            Validators.required
          ),
        })
      );
    }

    /** This shall copy some empty values for undefind entries */
    this._populateQuesionObjectForColValues();
  }

  onChangeColValue(): void {
    /** This shall update the empty values or undefind entries */
    this._populateQuesionObjectForColValues();
  }

  onDeleteCol(index: number): void {
    (<FormArray>this.form.get('tableCols')).removeAt(index);

    /** This shall update the removed entries */
    this._populateQuesionObjectForColValues();
  }

  private _populateQuesionObjectForColValues(): void {
    this.question &&
      (this.question.questionTypeStructure.tableCols = this.form.get(
        'tableCols'
      )?.value);
  }

  get tableRows() {
    return (<FormArray>this.form?.get('tableRows'))?.controls;
  }

  private _loadSavedRows(arr: TableDataRows[]): void {
    if (arr && arr.length > 0) {
      const newIdentifierValue = this.templateFieldValidationService.getRandomString(
        this.generateNameAttribIDLen
      );

      arr.forEach((row: TableDataRows) => {
        this.onAddRow({
          tableDataRowHeading: row.tableDataRowHeading,
          tableDataRowSubHeading: row.tableDataRowSubHeading,
          tableDataElementName:
            this.copyMode || this.surveyMode
              ? newIdentifierValue
              : row.tableDataElementName,
          additionalText: row.additionalText,
        });
      });
    }
  }

  onAddRow(el?: TableDataRows): void {
    let additionalTextName =
      el?.additionalText?.name ??
      this.templateFieldValidationService.getRandomString(
        this.generateNameAttribIDLen
      );

    if (this.copyMode || this.surveyMode) {
      additionalTextName = this.templateFieldValidationService.getRandomString(
        this.generateNameAttribIDLen
      );
    }
    let tableDataElementNameStr =
      el?.tableDataElementName ??
      this.templateFieldValidationService.getRandomString(
        this.generateNameAttribIDLen
      );

    (<FormArray>this.form.get('tableRows')).push(
      new FormGroup({
        tableDataRowHeading: new FormControl(
          el?.tableDataRowHeading,
          Validators.required
        ),
        tableDataRowSubHeading: new FormControl(el?.tableDataRowSubHeading),
        /** User input not required for below cols/group */
        tableDataElementName: new FormControl(
          tableDataElementNameStr,
          Validators.required
        ),
        additionalText: new FormGroup({
          type: new FormControl('text', Validators.required),
          name: new FormControl(additionalTextName, Validators.required),
          maxLength: new FormControl(100, Validators.required),
        }),
      })
    );

    /** This shall copy some empty values for undefind entries */
    this._populateQuesionObjectForRowValues();
  }

  onChangeRowValue(): void {
    /** This shall update the empty values or undefind entries */
    this._populateQuesionObjectForRowValues();
  }

  onDeleteRow(index: number): void {
    (<FormArray>this.form.get('tableRows')).removeAt(index);

    /** This shall update the removed entries */
    this._populateQuesionObjectForRowValues();
  }

  private _populateQuesionObjectForRowValues(): void {
    if (this.question) {
      this.question.questionTypeStructure.addAdditionalTextForEachRow = this.form.get(
        'addAdditionalTextForEachRow'
      )?.value;
      this.question.questionTypeStructure.tableRows = this._getTableRowsData();
    }
  }

  private _getTableRowsData(): TableDataRows[] {
    const tableRows = this.form.get('tableRows')?.value ?? <TableDataRows[]>[];

    return tableRows.map((row: TableDataRows) => {
      if (this.form.get('addAdditionalTextForEachRow')?.value) {
        return {
          tableDataRowHeading: row.tableDataRowHeading,
          tableDataRowSubHeading: row.tableDataRowSubHeading,
          tableDataElementName: row.tableDataElementName,
          additionalText: { ...row.additionalText },
        };
      }

      return {
        tableDataRowHeading: row.tableDataRowHeading,
        tableDataRowSubHeading: row.tableDataRowSubHeading,
        tableDataElementName: row.tableDataElementName,
      };
    });
  }

  /** To be called by the event emitter only */
  _getFormData(): any {
    // consoleLog({ valuesArr: ['tableCols', this.form.get('tableCols')?.value] });
    // consoleLog({ valuesArr: ['tableRows', this.form.get('tableRows')?.value] });

    return {
      ...super._getFormData(),
      questionTypeStructure: {
        tableName: this.form.get('tableName')?.value,
        tableHeading: this.form.get('tableHeading')?.value,
        addAdditionalTextForEachRow: this.form.get(
          'addAdditionalTextForEachRow'
        )?.value,
        tableCols: this.form.get('tableCols')?.value,
        tableRows: this._getTableRowsData(),
      },
    };
  }
}
