/** 28122020 - Gaurav - Init: Preview Response Types */
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { delay } from 'rxjs/operators';
import { consoleLog } from 'src/app/shared/util/common.util';
import { QuestionTypes } from '../../data-models/question.model';

@Component({
  selector: 'app-preview-response-type',
  templateUrl: './preview-response-type.component.html',
  styleUrls: ['./preview-response-type.component.css'],
})
export class PreviewResponseTypeComponent implements OnInit {
  readonly questionTypesEnum = QuestionTypes;
  @Input() selectedQuestionType!: QuestionTypes;
  @Input() form!: FormGroup;
  @Input() accessMode!: string;
  @ViewChild('addTextMatrix') addTextMatrix!: ElementRef<HTMLTextAreaElement>;

  viewOnly = false;
  userStarRating = <any>[];
  totalStars = 0;
  userSelectedRating = '';
  displayMatrixValues = <any[]>[];
  selectedValue = <string[]>[];

  constructor() {}

  ngOnInit(): void {
    this.viewOnly = this.accessMode === 'View';

    if (this.selectedQuestionType === this.questionTypesEnum.ratingStar) {
      this.totalStars = this.form.get('totalStars')?.value;
      this._resetStarList();

      this.form.valueChanges.pipe(delay(0)).subscribe((question) => {
        this.totalStars = question?.totalStars;
        this._resetStarList();
      });
    }

    if (
      this.selectedQuestionType === this.questionTypesEnum.matrixRadio ||
      this.selectedQuestionType === this.questionTypesEnum.matrixCheck
    ) {
      this._populateDisplayMatrixValues();

      this.form.valueChanges.pipe(delay(0)).subscribe((question) => {
        this._populateDisplayMatrixValues();
      });
    }
  }

  private _populateDisplayMatrixValues(): void {
    let matrixValues = [];

    if (this.form.get('matrixValues')?.value) {
      matrixValues = this.form.get('matrixValues')?.value;
    }

    if (this.form.get('addAdditionalTextField')?.value) {
      this.displayMatrixValues = [
        ...matrixValues,
        {
          label: 'Other, please specify:',
          id: 'matrixPreview',
          value: 'other',
          name: 'matrixPreview',
        },
      ];
    } else {
      this.displayMatrixValues = matrixValues;
    }
  }

  onUserSelection(value: string, isRemove = false) {
    if (this.selectedQuestionType === this.questionTypesEnum.matrixRadio) {
      this.selectedValue = [value];
    }

    if (this.selectedQuestionType === this.questionTypesEnum.matrixCheck) {
      if (isRemove) {
        this.selectedValue = this.selectedValue.filter(
          (selection) => selection !== value
        );
      } else {
        this.selectedValue.push(value);
      }
    }

    if (this.addTextMatrix && !this.selectedValue.includes('other'))
      this.addTextMatrix.nativeElement.value = '';
  }

  onChangeRating(rating: number) {
    this._resetRatingDisplay(rating, true);
  }

  private _resetStarList(): void {
    this.userStarRating = <any>[];
    for (let i = 1; i <= this.totalStars; i++) {
      this.userStarRating.push({ rating: i, icon: 'star_outline' });
    }
  }

  private _resetRatingDisplay(rating: number, reset: boolean) {
    if (reset)
      this.userStarRating.forEach((r: any) => (r.icon = 'star_outline'));

    // increment 1
    for (let i = 1; i <= rating; i++) {
      if (i > this.totalStars) break; //expect rating between 1 - this.totalStars

      // if current iteration is whole integer, set full star
      if (Number.isInteger(i)) {
        this.userStarRating[i - 1].icon = 'star';
      }
    }
  }
}
