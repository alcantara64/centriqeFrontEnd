/** 16122020 - Gaurav - Question Interface and Class.
 * Important Note: The interface and enums MUST match those on the ng-survey server
 * Survey Data Model: survey => pages => sections => questions* (we're here)
 * 22122020 - Gaurav - Set the validity of this form in the class instance (when in survey-mode and NOT when used with response-type component, since it has its own handling methods)
 * 31122020 - Gaurav - Added responseIdentifierText to be used for user response
 * 01012021 - Gaurav - Added mandatory field responseIdentifierText
 * 08012021 - Gaurav - Updated likert-structure interface
 * 22012021 - Gaurav - Added subQuestionText field to SurveyQuestion
 * 25012021 - Gaurav - Added fields tableColSubHeading and tableDataRowSubHeading to likerts */

export enum QuestionTypes {
  singleTextInput = 'single-text-input', // single-line input
  singleTextArea = 'single-text-area', // multi-line/textarea input
  singleChoiceRadioH = 'single-choice-radio-horizontal', //radios - should have labels on the top
  singleChoiceRadioBox = 'single-choice-radio-box', //radio-box/mat-toggle-button/nps
  multiChoiceCheckH = 'multi-choice-check-horizontal', //checkboxes - should have labels on the top
  ratingStar = 'rating-star', // ratings star
  ratingEmoji = 'rating-emoji', // ratings emoji
  likertRadio = 'likert-radio', //multiple rows and its radio-groups
  likertCheck = 'likert-check', //multiple rows and its checkbox-groups, kept em separate from radio for anyone to not mix radios and checkboxes :D
  matrixRadio = 'matrix-radio', //should have labels on the left or right
  matrixCheck = 'matrix-check', //should have labels on the left or right
  dropDownSelection = 'drop-down-selection', //drop-down list
}

export interface SurveyQuestion {
  questionNumber: number;
  questionText: string;
  questionType: QuestionTypes;
  questionTypeStructure:
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
    | any; //response type structure - remove 'any' once all are in place
  required: boolean;
  responseIdentifierText: string;
  questionNumberOrderToDisplay?: number;
  subQuestionText?: string;
  userAnswer?: any;
}

/** ******************** All code below related to stucts for questionTypeStructure ******************** */
interface GroupCommonStruct {
  groupName: string;
}

interface ElementCommonStruct {
  name: string;
  label?: string;
  id?: string;
  value?: string;
  maxLength?: number;
  type?: string;
  rows?: number;
}

// QuestionTypes.singleTextInput
export interface SingleTextInputStruct extends ElementCommonStruct {}

// QuestionTypes.singleTextArea
export interface SingleTextAreaStruct extends ElementCommonStruct {}

// Common for QuestionTypes.singleChoiceRadioH & QuestionTypes.multiChoiceCheckH
export interface RadioOrCheckBoxElement {
  label?: string;
  value?: string;
  name?: string;
}

// QuestionTypes.singleChoiceRadioH
export interface SingleChoiceRadioHStruct {
  name: string;
  elements: RadioOrCheckBoxElement[];
  addAdditionalTextField: boolean;
  additionalText?: SingleTextAreaStruct;
}

// QuestionTypes.singleChoiceRadioBox
export interface SingleChoiceRadioBoxStruct extends GroupCommonStruct {
  groupElementsCount: number;
  leftHintText: string;
  rightHintText: string;
}

// QuestionTypes.multiChoiceCheckH
export interface MultiChoiceCheckHStruct extends SingleChoiceRadioHStruct {}

// QuestionTypes.ratingStar
export interface RatingStarStruct {
  ratingName: string;
  starSizepx: number;
  totalStars: number;
  addAdditionalTextField: boolean;
  additionalText?: SingleTextAreaStruct;
}

// QuestionTypes.ratingEmoji - Starts
export interface RatingEmojiStruct {
  ratingName: string;
  emojiSizepx: number;
  orientation: string; // x or y
  emojiList: EmojiListStruct[];
  addAdditionalTextField: boolean;
  additionalText?: SingleTextAreaStruct;
}

export interface EmojiListStruct {
  rating: string;
  emoji: any;
}
// QuestionTypes.ratingEmoji - Ends

// QuestionTypes.likertRadio - Starts
export interface LikertRadioStruct {
  tableHeading?: string;
  tableName: string;
  tableCols: TableDataCols[];
  tableRows: TableDataRows[];
  addAdditionalTextForEachRow: boolean; //default = false
}

export interface TableDataCols {
  tableColHeading: string;
  tableColSubHeading?: string;
  tableColDataValue: string | TableDataElement;
}

export interface TableDataRows {
  tableDataRowHeading: string;
  tableDataRowSubHeading?: string;
  tableDataElementName: string;
  additionalText?: SingleTextInputStruct;
}

export interface TableDataElement {
  name: string;
  value: string;
}
// QuestionTypes.likertRadio - Ends

// QuestionTypes.likertCheck
export interface LikertCheckBoxStruct extends LikertRadioStruct {}

// QuestionTypes.matrixRadio - Starts
export interface MatrixRadioStruct {
  matrixHeading?: string;
  matrixName: string;
  matrixColumns: number; // send the columns properly, since template uses grid for matrix display and it would be 12/matrixColumns in template
  matrixValues: MatrixValuesStruct[];
  showLabelLeft?: boolean; //or right by default
  addAdditionalTextField: boolean;
  additionalText?: SingleTextInputStruct;
}

export interface MatrixValuesStruct {
  name?: string;
  label?: string;
  id?: string;
  value?: string;
}
// QuestionTypes.matrixRadio - Ends

// QuestionTypes.matrixCheck
export interface MatrixCheckStruct extends MatrixRadioStruct {}

// QuestionTypes.dropDownSelection - Starts
export interface DropDownStruct {
  dropDownName: string;
  dropDownApperance: DropDownApperance;
  dropDownLabel: string;
  dropDownValues: DropDownValuesStruct[];
  addAdditionalTextField: boolean;
  additionalText?: SingleTextAreaStruct;
}

export enum DropDownApperance {
  standard = 'standard',
  fill = 'fill',
  outline = 'outline',
}

export interface DropDownValuesStruct {
  value: string;
  viewValue: string;
}
// QuestionTypes.dropDownSelection - Ends

export class Question implements SurveyQuestion {
  private _questionFormInvalid: boolean = false;

  constructor(
    public questionNumber: number,
    public questionText: string,
    public questionType: QuestionTypes,
    public questionTypeStructure:
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
      | any,
    public required: boolean,
    public responseIdentifierText: string,
    public questionNumberOrderToDisplay?: number | undefined,
    public subQuestionText?: string
  ) {}

  /** 22122020 - Gaurav - Set the data validity at instance level */
  get isQuestionFormInvalid(): boolean {
    return this._questionFormInvalid;
  }

  public setQuestionFormValidity(value: boolean) {
    this._questionFormInvalid = value;
  }
}
