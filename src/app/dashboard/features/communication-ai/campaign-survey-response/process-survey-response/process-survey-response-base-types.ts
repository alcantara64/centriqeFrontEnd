/** 23022021 - Gaurav - Refactored survey base type question response processing from campaign-survey-response component to classes
 * 25022021 - Gaurav - JIRA-CA-152: Show counter for additional text
 * 07042021 - Gaurav - JIRA-CA-339: Update frontend with feature to show comments; added _surveyQuestionTextResponsesPayload and textResponsePayload
 */
import {
  ChartData,
  ToolboxPosition,
} from 'src/app/dashboard/shared/components/echarts/echarts.model';
import { ChartParameters } from 'src/app/dashboard/shared/components/echarts/echarts.service';
import { consoleLog } from 'src/app/shared/util/common.util';
import { QuestionTypes } from '../../../response-ai/data-models/question.model';
import {
  ConsolidatedQuestionResponse,
  SurveyQuestionResponses,
} from '../../../response-ai/data-models/survey.model';
import { PayloadCampaignSurveyTextResponse } from '../../communication-ai.service';
import { ProcessSurveyResponse } from './process-survey-response';

export class ProcessSurveyResponseBaseTypes extends ProcessSurveyResponse {
  constructor(
    protected _surveyQuestionResponse: SurveyQuestionResponses,
    protected _surveyQuestionTextResponsesPayload?: PayloadCampaignSurveyTextResponse
  ) {
    super(_surveyQuestionResponse, _surveyQuestionTextResponsesPayload);
  }

  protected _processQuestionResponse(): void {
    const responseCharts: ChartData[] = <ChartData[]>[];
    const selectedOptions =
      this._surveyQuestionResponse?.response?.map(
        (selection: ConsolidatedQuestionResponse) => selection?.selectedValue
      ) ?? <ConsolidatedQuestionResponse[]>[];

    const missingOptions = this._providedOptions.filter(
      (value: any) => !selectedOptions.includes(<any>value)
    );

    /** Add empty hits for non-selected options from the available/provided select values */
    if (missingOptions.length > 0) {
      this._surveyQuestionResponse.response = [
        ...this._surveyQuestionResponse?.response,
        ...missingOptions.map((value: any) => {
          return {
            selectedValue: value,
            hits: 0,
          };
        }),
      ];
    }

    /** Find and add display value  */
    this._populateDisplayValues();

    /** Calculate percent for each status */
    this._surveyQuestionResponse.response = this._surveyQuestionResponse?.response?.map(
      (el: ConsolidatedQuestionResponse) => {
        const percent =
          this._surveyQuestionResponse.totalResponses > 0
            ? (el?.hits! / this._surveyQuestionResponse.totalResponses) * 100
            : 0;

        return {
          ...el,
          displayPercent: percent === 0 ? '0%' : `${percent.toFixed(2)}%`,
          percent,
        };
      }
    );

    /** Sort the responses per the provided options */
    this._surveyQuestionResponse.response = this._sortResponseValues(
      this._surveyQuestionResponse.response
    );

    /** Create a pie chart */
    responseCharts.push(
      this._echartsServiceInstance.getCategoryOnePieChart(<ChartParameters>{
        questionType: this._surveyQuestionResponse?.questionType,
        toolboxPosition: ToolboxPosition.toolbox_top_right_center,
        seriesName: this._surveyQuestionResponse?.questionId,
        legendData: this._surveyQuestionResponse?.response?.map(
          (status: ConsolidatedQuestionResponse) =>
            `${String(status.displayValue)} (${status?.displayPercent})`
        ),
        seriesData: this._surveyQuestionResponse?.response?.map(
          (status: ConsolidatedQuestionResponse) => {
            return {
              value: status?.hits,
              name: `${String(status.displayValue)} (${
                status?.displayPercent
              })`,
            };
          }
        ),
      })
    );

    /** Create a bar chart */
    responseCharts.push(
      this._echartsServiceInstance.getCategoryOneBarChart(<ChartParameters>{
        questionType: this._surveyQuestionResponse?.questionType,
        toolboxPosition: ToolboxPosition.toolbox_top_right_center,
        xAxisData: this._surveyQuestionResponse?.response?.map(
          (status: ConsolidatedQuestionResponse) => String(status?.displayValue)
        ),
        seriesName: this._surveyQuestionResponse?.questionId,
        seriesData: this._surveyQuestionResponse?.response?.map(
          (status: ConsolidatedQuestionResponse) => status?.hits
        ),
      })
    );

    let tableDisplayColumns = ['displayValue', 'percent_hits', 'hits'];

    this._surveyQuestionResponse?.questionType === QuestionTypes.ratingEmoji &&
      (tableDisplayColumns = [
        'displayValue',
        'selectedValue',
        'percent_hits',
        'hits',
      ]);

    let displayResponse: any[] =
      this._surveyQuestionResponse?.response ?? <any[]>[];

    if (
      [
        QuestionTypes.dropDownSelection,
        QuestionTypes.matrixCheck,
        QuestionTypes.matrixRadio,
      ].includes(this._surveyQuestionResponse?.questionType)
    ) {
      displayResponse.sort((a: any, b: any) =>
        a?.percent < b?.percent ? 1 : a?.percent > b?.percent ? -1 : 0
      );
    }

    this._surveyQuestionResponse.questionTypeStructure = {
      ...this._surveyQuestionResponse?.questionTypeStructure!,
      response: displayResponse,
    };

    const totalHits = this._surveyQuestionResponse?.totalResponses ?? 0;
    let totalTextHits = 0;
    let totalTextHitsPercent = 0;
    let totalTextHitsDisplayPercent = '0%';

    if (
      this._surveyQuestionResponse?.textHitsResponse &&
      Array.isArray(this._surveyQuestionResponse?.textHitsResponse) &&
      this._surveyQuestionResponse?.textHitsResponse.length > 0
    ) {
      totalTextHits =
        this._surveyQuestionResponse?.textHitsResponse[0]?.totalTextHits ?? 0;

      if (totalTextHits > 0 && totalHits > 0) {
        totalTextHitsPercent = (totalTextHits / totalHits) * 100;
        totalTextHitsDisplayPercent =
          totalTextHitsPercent === 0
            ? '0%'
            : `${totalTextHitsPercent.toFixed(2)}%`;
      }
    }

    /** Prepare Response Charts data */
    this._data = {
      ...this._questionText,
      responseCharts,
      questionType: this._surveyQuestionResponse?.questionType,
      totalHits,
      totalTextHits,
      totalTextHitsPercent,
      totalTextHitsDisplayPercent,
      tableDataSource: displayResponse,
      tableDisplayColumns,
      questionTypeStructure: this._surveyQuestionResponse
        ?.questionTypeStructure,
      textResponsePayload: !!this._surveyQuestionTextResponsesPayload
        ? {
            ...this._surveyQuestionTextResponsesPayload,
            questionId: this._surveyQuestionResponse?.questionId,
            questionType: this._surveyQuestionResponse?.questionType,
          }
        : null,
    };
  }
}
