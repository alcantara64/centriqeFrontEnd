/** 16122020 - Gaurav - Section (of questions) Interface and Class.
 * Important Note: The interface and enums MUST match those on the ng-survey server
 * Survey Data Model: survey => pages => sections* (we're here) => questions
 * 22122020 - Gaurav - Added getFormattedQuestionTypeStructure() to format structure for display
 * 23122020 - Gaurav - Fixed issues related to duplicating and moving questions
 * 01012021 - Gaurav - Added mandatory field responseIdentifierText
 * 08012021 - Gaurav - Fixed a bug related to new duplicated response type referring to copied object memory allocation
 * 11012021 - Gaurav - Regenerate Likert name field attribute values
 * 22012021 - Gaurav - Added subQuestionText field */
import { TemplateFieldValidationService } from 'src/app/dashboard/shared/services/template-field-validation.service';
import { consoleLog, ConsoleTypes } from 'src/app/shared/util/common.util';
import {
  DropDownStruct,
  LikertCheckBoxStruct,
  LikertRadioStruct,
  MatrixCheckStruct,
  MatrixRadioStruct,
  MatrixValuesStruct,
  MultiChoiceCheckHStruct,
  Question,
  QuestionTypes,
  RadioOrCheckBoxElement,
  RatingEmojiStruct,
  RatingStarStruct,
  SingleChoiceRadioBoxStruct,
  SingleChoiceRadioHStruct,
  SingleTextAreaStruct,
  SingleTextInputStruct,
  SurveyQuestion,
  TableDataRows,
} from './question.model';

export interface SurveySection {
  sectionNumber: number;
  sectionHeading: string;
  sectionQuestions: Question[];
}

export class Section implements SurveySection {
  constructor(
    public sectionNumber: number,
    public sectionHeading: string,
    public sectionQuestions: Question[]
  ) {}

  onAddQuestion(questionType: QuestionTypes): void {
    const questionNumber = this.sectionQuestions.length + 1;

    this.sectionQuestions.push(
      new Question(
        questionNumber,
        '',
        questionType,
        <
          | SingleTextInputStruct
          | SingleTextAreaStruct
          | SingleChoiceRadioHStruct
          | SingleChoiceRadioBoxStruct
          | MultiChoiceCheckHStruct
          | RatingStarStruct
          | RatingEmojiStruct
          | LikertRadioStruct
          | LikertCheckBoxStruct
          | MatrixRadioStruct
          | MatrixCheckStruct
          | DropDownStruct
          | any
        >{},
        false,
        ''
      )
    );

    consoleLog({
      valuesArr: ['onAddQuestion sectionQuestions', this.sectionQuestions],
    });
  }

  onAddSavedQuestion(questionData: any): void {
    /** Pass a copy to avoid reference to copied object's memory location */
    let copyOfQuestionTypeStructure = {
      ...questionData.questionTypeStructure,
    };

    if (questionData?.questionTypeStructure?.additionalText) {
      copyOfQuestionTypeStructure = {
        ...copyOfQuestionTypeStructure,
        additionalText: {
          ...questionData.questionTypeStructure.additionalText,
        },
      };
    }

    const questionNumber = this.sectionQuestions.length + 1;

    consoleLog({
      valuesArr: ['inside onAddSavedQuestion(): questionData', questionData],
    });

    this.sectionQuestions.push(
      new Question(
        questionNumber,
        questionData.questionText,
        questionData.questionType,
        Section.regenerateNameAndIDValues(
          questionData.questionType,
          copyOfQuestionTypeStructure
        ),
        questionData.required,
        questionData.responseIdentifierText,
        undefined, //questionNumberOrderToDisplay
        questionData?.subQuestionText //subQuestionText
      )
    );

    consoleLog({
      valuesArr: ['onAddSavedQuestion sectionQuestions', this.sectionQuestions],
    });
  }

  onDuplicateQuestion(currentQuestionIndex: number): void {
    /** Pass a copy to avoid reference to copied object's memory location */
    let copyOfQuestionTypeStructure = {
      ...this.sectionQuestions[currentQuestionIndex].questionTypeStructure,
    };

    if (
      this.sectionQuestions[currentQuestionIndex].questionTypeStructure
        ?.additionalText
    ) {
      copyOfQuestionTypeStructure = {
        ...copyOfQuestionTypeStructure,
        additionalText: {
          ...this.sectionQuestions[currentQuestionIndex].questionTypeStructure
            .additionalText,
        },
      };
    }

    this.sectionQuestions.splice(
      currentQuestionIndex + 1,
      0,
      new Question(
        this.sectionQuestions[currentQuestionIndex].questionNumber,
        this.sectionQuestions[currentQuestionIndex].questionText,
        this.sectionQuestions[currentQuestionIndex].questionType,
        Section.regenerateNameAndIDValues(
          this.sectionQuestions[currentQuestionIndex].questionType,
          copyOfQuestionTypeStructure
        ),
        this.sectionQuestions[currentQuestionIndex].required,
        this.sectionQuestions[currentQuestionIndex].responseIdentifierText,
        this.sectionQuestions[
          currentQuestionIndex
        ].questionNumberOrderToDisplay,
        this.sectionQuestions[currentQuestionIndex].subQuestionText
      )
    );

    this._reorderQuestionNumberValue();
  }

  onDeleteQuestion(currentQuestionIndex: number): void {
    this.sectionQuestions.splice(currentQuestionIndex, 1);
    this._reorderQuestionNumberValue();

    consoleLog({
      consoleType: ConsoleTypes.warn,
      valuesArr: ['onDeleteQuestion sectionQuestions', this.sectionQuestions],
    });
  }

  onQuestionMoveDown(indexDown: number): void {
    const questionToMoveDownData: Question = this.sectionQuestions[indexDown];
    this.sectionQuestions[indexDown] = this.sectionQuestions[indexDown + 1];
    this.sectionQuestions[indexDown + 1] = questionToMoveDownData;
    this._reorderQuestionNumberValue();
  }

  onQuestionMoveUp(indexUp: number): void {
    const questionToMoveUpData: Question = this.sectionQuestions[indexUp];
    this.sectionQuestions[indexUp] = this.sectionQuestions[indexUp - 1];
    this.sectionQuestions[indexUp - 1] = questionToMoveUpData;
    this._reorderQuestionNumberValue();
  }

  private _reorderQuestionNumberValue(): void {
    this.sectionQuestions = this.sectionQuestions.map(
      (question: Question, i: number) => {
        return new Question(
          i + 1,
          question.questionText,
          question.questionType,
          { ...question.questionTypeStructure },
          question.required,
          question.responseIdentifierText,
          question.questionNumberOrderToDisplay,
          question.subQuestionText
        );
      }
    );
  }

  /** Created this static method since it would be called in Page class as well when adding saved section response types.
   * The sole purpose of this method is to regenerate ID and Name attribute values when a saved response-type is added, copied or duplicated
   * on a survey, to avoid any common ID and unwanted behaviour from those different question fields
   */
  public static regenerateNameAndIDValues(
    questionType: QuestionTypes,
    currentStructure:
      | SingleTextInputStruct
      | SingleTextAreaStruct
      | SingleChoiceRadioHStruct
      | SingleChoiceRadioBoxStruct
      | MultiChoiceCheckHStruct
      | RatingStarStruct
      | RatingEmojiStruct
      | LikertRadioStruct
      | LikertCheckBoxStruct
      | MatrixRadioStruct
      | MatrixCheckStruct
      | DropDownStruct
      | any
  ):
    | SingleTextInputStruct
    | SingleTextAreaStruct
    | SingleChoiceRadioHStruct
    | SingleChoiceRadioBoxStruct
    | MultiChoiceCheckHStruct
    | RatingStarStruct
    | RatingEmojiStruct
    | LikertRadioStruct
    | LikertCheckBoxStruct
    | MatrixRadioStruct
    | MatrixCheckStruct
    | DropDownStruct
    | any {
    const randomString = TemplateFieldValidationService.instance.getRandomString(
      25
    );

    switch (questionType) {
      case QuestionTypes.singleTextInput:
      case QuestionTypes.singleTextArea:
        currentStructure.id = randomString;
        currentStructure.name = randomString;
        return currentStructure;

      case QuestionTypes.ratingEmoji:
      case QuestionTypes.ratingStar:
      case QuestionTypes.dropDownSelection:
        if (currentStructure?.additionalText?.name) {
          currentStructure.additionalText.name = randomString;
        }
        return currentStructure;

      case QuestionTypes.singleChoiceRadioH:
      case QuestionTypes.multiChoiceCheckH:
        currentStructure.name = randomString;
        currentStructure?.elements?.forEach((el: RadioOrCheckBoxElement) => {
          el.name = TemplateFieldValidationService.instance.getRandomString(25);
        });
        if (currentStructure?.additionalText?.name) {
          currentStructure.additionalText.name = randomString;
        }
        return currentStructure;

      case QuestionTypes.matrixRadio:
      case QuestionTypes.matrixCheck:
        currentStructure.matrixName = randomString;
        currentStructure?.elements?.forEach((el: MatrixValuesStruct) => {
          const newID = TemplateFieldValidationService.instance.getRandomString(
            25
          );
          el.name = newID;
          el.id = newID;
        });
        if (currentStructure?.additionalText?.name) {
          currentStructure.additionalText.name = randomString;
        }
        return currentStructure;

      case QuestionTypes.likertRadio:
      case QuestionTypes.likertCheck:
        currentStructure.tableName = randomString;
        currentStructure?.tableRows?.forEach((el: TableDataRows) => {
          el.tableDataElementName = TemplateFieldValidationService.instance.getRandomString(
            25
          );

          if (el?.additionalText?.name) {
            el.additionalText.name = TemplateFieldValidationService.instance.getRandomString(
              25
            );
          }
        });
        return currentStructure;

      default:
        return currentStructure;
    }
  }
}
