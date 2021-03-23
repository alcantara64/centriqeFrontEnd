/** 28122020 - Gaurav - Init: Rating response-type
 * 29122020 - Gaurav - Changed emoji rating text to match Dilip's sample emoji survey
 * 05012021 - Gaurav - Moved onAdditionalInputToggle() to base-type component
 * 12012021 - Gaurav - Some validation changes
 * 24022021 - Gaurav - JIRA CA-170: allow 11 (0-10) changes
 */
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import {
  Component,
  ElementRef,
  Injector,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { consoleLog } from 'src/app/shared/util/common.util';
import { BaseTypeComponent } from '../base-type/base-type.component';

@Component({
  selector: 'app-rating-input',
  templateUrl: './rating.component.html',
  styleUrls: ['./rating.component.css'],
})
export class RatingComponent extends BaseTypeComponent implements OnInit {
  defaultOrientation = 'x'; //x-axis
  defaultValidators = {
    iconSize: {
      min: 20,
      max: 50,
    },
    totalStars: {
      min: 1,
      max: 11,
    },
  };
  private _emojiList = [
    { rating: 'Very dissatisfied', emoji: '😠' },
    { rating: 'Dissatisfied', emoji: '😦' },
    { rating: 'Somewhat satisfied', emoji: '😑' },
    { rating: 'Very satisfied', emoji: '😊' },
    { rating: 'Extremely satisfied', emoji: '😍' },
  ];
  orientationList = [
    { value: 'x', viewValue: 'Horizontal (x-axis)' },
    { value: 'y', viewValue: 'Vertical (y-axis)' },
  ];

  availableEmojiList = <any>[];
  selectedEmojiList = <any>[];

  constructor(injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.form.addControl(
      'ratingName',
      new FormControl(
        this.responseTypeData?.questionTypeStructure?.ratingName ??
          this.question?.questionTypeStructure?.ratingName ??
          this.templateFieldValidationService.getRandomString(
            this.generateNameAttribIDLen
          ),
        Validators.required
      )
    );

    if (this.question) {
      this.question.questionTypeStructure.ratingName = this.form.get(
        'ratingName'
      )?.value;
    }

    if (this.questionType === this.questionTypes.ratingStar) {
      this.form.addControl(
        'starSizepx',
        new FormControl(
          this.responseTypeData?.questionTypeStructure?.starSizepx ??
            this.question?.questionTypeStructure?.starSizepx,
          [
            Validators.required,
            Validators.min(this.defaultValidators.iconSize.min),
            Validators.max(this.defaultValidators.iconSize.max),
          ]
        )
      );

      this.form.addControl(
        'totalStars',
        new FormControl(
          this.responseTypeData?.questionTypeStructure?.totalStars ??
            this.question?.questionTypeStructure?.totalStars,
          [
            Validators.required,
            Validators.min(this.defaultValidators.totalStars.min),
            Validators.max(this.defaultValidators.totalStars.max),
          ]
        )
      );
    }

    if (this.questionType === this.questionTypes.ratingEmoji) {
      this.form.addControl(
        'emojiSizepx',
        new FormControl(
          this.responseTypeData?.questionTypeStructure?.emojiSizepx ??
            this.question?.questionTypeStructure?.emojiSizepx,
          [
            Validators.required,
            Validators.min(this.defaultValidators.iconSize.min),
            Validators.max(this.defaultValidators.iconSize.max),
          ]
        )
      );

      this.form.addControl(
        'orientation',
        new FormControl(
          this.responseTypeData?.questionTypeStructure?.orientation ??
            this.question?.questionTypeStructure?.orientation ??
            this.defaultOrientation,
          Validators.required
        )
      );

      let loadEmojiList;
      if (
        this.responseTypeData?.questionTypeStructure?.emojiList &&
        this.responseTypeData?.questionTypeStructure?.emojiList?.length > 0
      ) {
        loadEmojiList = [
          ...this.responseTypeData.questionTypeStructure.emojiList,
        ];
      }

      if (
        this.question?.questionTypeStructure?.emojiList &&
        this.question?.questionTypeStructure?.emojiList?.length > 0
      ) {
        loadEmojiList = [...this.question?.questionTypeStructure?.emojiList];
      }

      this.form.addControl(
        'emojiList',
        new FormControl(loadEmojiList ?? <any>[], Validators.required)
      );
    }

    /** Reset name OR id attribute values if in copy or survey modes. */
    this.resetNameAttribValue('ratingName');
    this.resetNameAttribValue('additionalTextName');

    /** Disable field and form:
     * 1. send array of fieldNames to disable
     * 2. would disable complete form if view-only mode */
    this.disableForm(['ratingName']);

    this.selectedEmojiList = this.form.get('emojiList')?.value ?? <any>[];
    this._refreshAvailableEmojiList();
  }

  /** To be called by the event emitter only */
  _getFormData(): any {
    let questionTypeStruct = {};

    if (this.questionType === this.questionTypes.ratingStar) {
      questionTypeStruct = {
        starSizepx: this.form.get('starSizepx')?.value,
        totalStars: this.form.get('totalStars')?.value,
      };
    }

    if (this.questionType === this.questionTypes.ratingEmoji) {
      questionTypeStruct = {
        emojiSizepx: this.form.get('emojiSizepx')?.value,
        orientation: this.form.get('orientation')?.value,
        emojiList: this.form.get('emojiList')?.value,
      };
    }

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
        ratingName: this.form.get('ratingName')?.value,
        addAdditionalTextField: this.form.get('addAdditionalTextField')?.value,
        ...questionTypeStruct,
      },
    };
  }

  private _refreshAvailableEmojiList(): void {
    if (this.selectedEmojiList.length > 0) {
      this.availableEmojiList = this._emojiList.filter(
        (item: any) =>
          !this.selectedEmojiList.some(
            (selected: any) => selected.rating === item.rating
          )
      );
    } else {
      this.availableEmojiList = [...this._emojiList];
    }
  }

  drop(event: CdkDragDrop<any[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }

    /** Update form */
    this.form.patchValue({
      emojiList: [...this.selectedEmojiList] ?? <any>[],
    });
    this.question &&
      this.questionType === this.questionTypes.ratingEmoji &&
      (this.question.questionTypeStructure.emojiList = this.form.get(
        'emojiList'
      )?.value);
    this._refreshAvailableEmojiList();
  }
}
