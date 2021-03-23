/** 23022021 - Gaurav - Refactored survey response processing from campaign-survey-response component to classes */
import {
  ChartQuestionText,
  DisplayResponseData,
} from 'src/app/dashboard/shared/components/echarts/echarts.model';
import { EchartsService } from 'src/app/dashboard/shared/components/echarts/echarts.service';
import { SurveyPage } from '../../../response-ai/data-models/page.model';
import {
  DropDownValuesStruct,
  EmojiListStruct,
  MatrixValuesStruct,
  QuestionTypes,
  RadioOrCheckBoxElement,
  SurveyQuestion,
  TableDataCols,
  TableDataElement,
  TableDataRows,
} from '../../../response-ai/data-models/question.model';
import { SurveySection } from '../../../response-ai/data-models/section.model';
import {
  ConsolidatedQuestionResponse,
  SurveyQuestionResponses,
  SurveyVersion,
} from '../../../response-ai/data-models/survey.model';

export abstract class ProcessSurveyResponse {
  protected _questionText!: ChartQuestionText;
  protected _providedOptions!: any[];
  protected _data!: DisplayResponseData;
  protected _echartsServiceInstance = EchartsService.instance;

  constructor(protected _surveyQuestionResponse: SurveyQuestionResponses) {
    /** 1. Get the provided options */
    this._providedOptions =
      this._surveyQuestionResponse?.providedOptions ?? <any[]>[];

    /** 2. Get question and sub-question text */
    this._questionText = <ChartQuestionText>{
      questionId: this._surveyQuestionResponse?.questionId,
      questionText: this._surveyQuestionResponse?.questionText,
      subQuestionText: this._surveyQuestionResponse?.subQuestionText,
    };

    /** 3. Process response */
    this._processQuestionResponse();
  }

  /** This class would be instantiated for each survey question response. Hence to sort all the survey question responses,
   * create a static method and call it before instantiating this class. Return the sorted responses */
  /** Sort the responses received per the question sequence in surveyVersion */
  static sortResponsesPerSurveyQuestions(
    surveyVersion: SurveyVersion,
    surveyResponses: SurveyQuestionResponses[]
  ): SurveyQuestionResponses[] {
    /** 1. Get the questionId sequence from surveyVersion */
    let questionSequence: any[] = <any[]>[];

    for (let p = 0; p < surveyVersion?.surveyPages?.length; p++) {
      const page: SurveyPage = <SurveyPage>surveyVersion?.surveyPages[p];

      for (let s = 0; s < page?.pageSections?.length; s++) {
        const section: SurveySection = <SurveySection>(
          surveyVersion?.surveyPages[p]?.pageSections[s]
        );

        for (let q = 0; q < section?.sectionQuestions?.length; q++) {
          const question: SurveyQuestion = <SurveyQuestion>(
            surveyVersion?.surveyPages[p]?.pageSections[s]?.sectionQuestions[q]
          );

          questionSequence.push({
            pageNumber: page?.pageNumber,
            sectionNumber: section?.sectionNumber,
            questionNumber: question?.questionNumber,
            questionText: question?.questionText,
            questionType: question?.questionType,
            questionTypeStructure: question?.questionTypeStructure,
            required: question?.required,
            responseIdentifierText: question?.responseIdentifierText,
            questionNumberOrderToDisplay:
              question?.questionNumberOrderToDisplay,
            subQuestionText: question?.subQuestionText,
          });
        }
      }
    }

    // consoleLog({ valuesArr: [{ questionSequence }] });

    /** 2. Sort responses according to survey questions */
    let sortedArray = <SurveyQuestionResponses[]>[];

    questionSequence.forEach((el: any) => {
      const record = surveyResponses?.find(
        (r: SurveyQuestionResponses) =>
          r.questionId === el.responseIdentifierText
      );

      // consoleLog({ valuesArr: [{ record }, { el }] });

      sortedArray.push({
        ...el,
        ...record,
      });
    });

    // consoleLog({ valuesArr: [{ sortedArray }] });

    return [...sortedArray];
  }

  protected abstract _processQuestionResponse(): void;

  get questionType(): QuestionTypes {
    return this._surveyQuestionResponse?.questionType;
  }

  get data(): DisplayResponseData {
    return this._data;
  }

  public isLikertGroup(index: number, item: any): boolean {
    return item?.isGroupBy;
  }

  /** Sort response values per provided options order */
  protected _sortResponseValues(arrayToSort: ConsolidatedQuestionResponse[]) {
    if (this._providedOptions.length > 0) {
      let sortedArray = <any[]>[];

      this._providedOptions.forEach((value: any) => {
        const record = arrayToSort?.find(
          (r: ConsolidatedQuestionResponse) => r?.selectedValue === value
        );
        sortedArray.push(record);
      });

      return [...sortedArray];
    }

    return arrayToSort;
  }

  private _getProcessedResponseId(responseId: string): string {
    /** Return the responseId as constructed in (ng-survey => Survey Question component) */
    const splitID = responseId.split(' ');
    const curatedID = splitID.map((value) =>
      typeof value === 'string'
        ? value.replace(/[^\w ]/g, '').toLowerCase()
        : value
    );

    return curatedID.join('_');
  }

  /** Find user selection display values from survey version and populate them alongside respective survey response data */
  protected _populateDisplayValues(): void {
    if (this._surveyQuestionResponse) {
      switch (this.questionType) {
        case QuestionTypes.multiChoiceCheckH:
        case QuestionTypes.singleChoiceRadioH:
          this._surveyQuestionResponse.response = this._surveyQuestionResponse?.response.map(
            (userSelection: ConsolidatedQuestionResponse) => {
              const element: RadioOrCheckBoxElement = this._surveyQuestionResponse?.questionTypeStructure.elements.find(
                (el: RadioOrCheckBoxElement) =>
                  el.value === userSelection.selectedValue
              );

              return {
                ...userSelection,
                displayValue: element.label ?? userSelection.selectedValue,
              };
            }
          );

          break;

        case QuestionTypes.ratingEmoji:
          this._surveyQuestionResponse.response = this._surveyQuestionResponse?.response.map(
            (userSelection: ConsolidatedQuestionResponse) => {
              const element: EmojiListStruct = this._surveyQuestionResponse?.questionTypeStructure.emojiList.find(
                (el: EmojiListStruct) =>
                  el.rating === userSelection.selectedValue
              );

              return {
                ...userSelection,
                displayValue: element.emoji ?? userSelection.selectedValue,
              };
            }
          );
          break;

        case QuestionTypes.dropDownSelection:
          this._surveyQuestionResponse.response = this._surveyQuestionResponse?.response.map(
            (userSelection: ConsolidatedQuestionResponse) => {
              const dropDownValue: DropDownValuesStruct = this._surveyQuestionResponse?.questionTypeStructure.dropDownValues.find(
                (ddv: DropDownValuesStruct) =>
                  ddv.value === userSelection.selectedValue
              );

              return {
                ...userSelection,
                displayValue:
                  dropDownValue.viewValue ?? userSelection.selectedValue,
              };
            }
          );
          break;

        case QuestionTypes.matrixCheck:
        case QuestionTypes.matrixRadio:
          this._surveyQuestionResponse.response = this._surveyQuestionResponse?.response.map(
            (userSelection: ConsolidatedQuestionResponse) => {
              const element: MatrixValuesStruct = this._surveyQuestionResponse?.questionTypeStructure.matrixValues.find(
                (el: MatrixValuesStruct) =>
                  el.value === userSelection.selectedValue
              );

              return {
                ...userSelection,
                displayValue: element.label ?? userSelection.selectedValue,
              };
            }
          );

          break;

        case QuestionTypes.likertCheck:
          this._surveyQuestionResponse.response = this._surveyQuestionResponse?.response.map(
            (r: ConsolidatedQuestionResponse) => {
              return {
                ...r,
                responseIdData: r.responseIdData.map((userSelection: any) => {
                  const element: TableDataCols = this._surveyQuestionResponse?.questionTypeStructure.tableCols.find(
                    (el: TableDataCols) => {
                      return (
                        (<TableDataElement>el.tableColDataValue).value ===
                        userSelection.selectedValue
                      );
                    }
                  );

                  return {
                    ...userSelection,
                    displayValue:
                      element?.tableColHeading ?? userSelection.selectedValue,
                    displayValue2: element?.tableColSubHeading,
                  };
                }),
              };
            }
          );

          this._surveyQuestionResponse.response = this._surveyQuestionResponse?.response.map(
            (userSelection: ConsolidatedQuestionResponse) => {
              const element: TableDataRows = this._surveyQuestionResponse?.questionTypeStructure.tableRows.find(
                (el: TableDataRows) => {
                  const processedCompareValue = this._getProcessedResponseId(
                    el.tableDataRowHeading
                  );
                  return processedCompareValue === userSelection.responseId;
                }
              );

              return {
                ...userSelection,
                responseIdDisplayValue:
                  element?.tableDataRowHeading ?? userSelection.responseId,
                responseIdDisplayValue2: element?.tableDataRowSubHeading,
              };
            }
          );

          break;

        case QuestionTypes.likertRadio:
          this._surveyQuestionResponse.response = this._surveyQuestionResponse?.response.map(
            (r: ConsolidatedQuestionResponse) => {
              return {
                ...r,
                responseIdData: r.responseIdData.map((userSelection: any) => {
                  const element: TableDataCols = this._surveyQuestionResponse?.questionTypeStructure.tableCols.find(
                    (el: TableDataCols) => {
                      return (
                        el.tableColDataValue === userSelection.selectedValue
                      );
                    }
                  );

                  return {
                    ...userSelection,
                    displayValue:
                      element?.tableColHeading ?? userSelection.selectedValue,
                    displayValue2: element?.tableColSubHeading,
                  };
                }),
              };
            }
          );

          this._surveyQuestionResponse.response = this._surveyQuestionResponse?.response.map(
            (userSelection: ConsolidatedQuestionResponse) => {
              const element: TableDataRows = this._surveyQuestionResponse?.questionTypeStructure.tableRows.find(
                (el: TableDataRows) => {
                  const processedCompareValue = this._getProcessedResponseId(
                    el.tableDataRowHeading
                  );
                  return processedCompareValue === userSelection.responseId;
                }
              );

              return {
                ...userSelection,
                responseIdDisplayValue:
                  element?.tableDataRowHeading ?? userSelection.responseId,
                responseIdDisplayValue2: element?.tableDataRowSubHeading,
              };
            }
          );

          break;

        default:
          // populate insight values as display values
          this._surveyQuestionResponse.response = this._surveyQuestionResponse?.response.map(
            (userSelection: ConsolidatedQuestionResponse) => {
              return {
                ...userSelection,
                displayValue: userSelection.selectedValue,
              };
            }
          );
      }
    }
  }
}
