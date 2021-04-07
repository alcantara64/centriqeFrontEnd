/** 23022021 - Gaurav - Refactored survey likerts type question response processing from campaign-survey-response component to classes
 * 24022021 - Gaurav - JIRA-CA-175
 * 25022021 - Gaurav - JIRA-CA-152: Show counter for additional text
 * 01032021 - Gaurav - JIRA-CA-189: Revert CA-175 changes.
 * 02032021 - Gaurav - JIRA-CA-195: Show totalHitsByResponseId per Likert row
 * 03032021 - Gaurav - JIRA-CA-196: Added rowspan property to likertTableData
 * 07042021 - Gaurav - JIRA-CA-339: Update frontend with feature to show comments; added _surveyQuestionTextResponsesPayload and textResponsePayload
 */
import {
  ChartData,
  ChartType,
  ToolboxPosition,
} from 'src/app/dashboard/shared/components/echarts/echarts.model';
import { consoleLog } from 'src/app/shared/util/common.util';
import {
  QuestionTypes,
  TableDataRows,
} from '../../../response-ai/data-models/question.model';
import {
  ConsolidatedQuestionResponse,
  SurveyQuestionResponses,
  TextHitsResponse,
} from '../../../response-ai/data-models/survey.model';
import { PayloadCampaignSurveyTextResponse } from '../../communication-ai.service';
import { ProcessSurveyResponse } from './process-survey-response';

export class ProcessSurveyResponseLikertTypes extends ProcessSurveyResponse {
  constructor(
    protected _surveyQuestionResponse: SurveyQuestionResponses,
    protected _surveyQuestionTextResponsesPayload?: PayloadCampaignSurveyTextResponse
  ) {
    super(_surveyQuestionResponse, _surveyQuestionTextResponsesPayload);
  }

  protected _processQuestionResponse(): void {
    const responseCharts: ChartData[] = <ChartData[]>[];

    /** Get unique responseId from response array */
    const uniqueResponseIds = [
      ...new Set(
        this._surveyQuestionResponse?.response.map(
          (r: ConsolidatedQuestionResponse) => r.responseId
        )
      ),
    ];

    /** Combine responseId into its own object and selectedValue along with missing provided options */
    let responseIdsConsolidated: any[] = <any[]>[];
    uniqueResponseIds.forEach((responseId) => {
      let selectedOptions =
        this._surveyQuestionResponse?.response
          .filter(
            (r: ConsolidatedQuestionResponse) => r.responseId === responseId
          )
          .map((r: ConsolidatedQuestionResponse) => {
            return {
              responseId: r.responseId,
              selectedValue: r.selectedValue,
              hits: r.hits,
            };
          }) ?? <any[]>[];

      /** Get the missing options/selectedValue w.r.t. provided options */
      const missingOptions = this._providedOptions.filter(
        (value: any) =>
          !selectedOptions.some(
            (r: ConsolidatedQuestionResponse) => r.selectedValue === value
          )
      );

      /** Add empty hits for non-selected options from the available/provided select values */
      if (missingOptions.length > 0) {
        selectedOptions = [
          ...selectedOptions,
          ...missingOptions.map((value: any) => {
            return {
              responseId: selectedOptions[0]?.responseId,
              selectedValue: value,
              hits: 0,
            };
          }),
        ];
      }

      /** Sort the responses per the provided options */
      selectedOptions = this._sortResponseValues(selectedOptions);

      /** Combine responseId into its own object and selectedValue */
      responseIdsConsolidated.push({
        responseId,
        responseIdData: [...selectedOptions],
      });
    });

    /** Update the response array */
    this._surveyQuestionResponse.response = [...responseIdsConsolidated];

    /** Find and add display value  */
    this._populateDisplayValues();

    /** Sort the responses per the provided tableDataRowHeading */
    let sortedArray = <ConsolidatedQuestionResponse[]>[];

    this._surveyQuestionResponse?.questionTypeStructure?.tableRows?.forEach(
      (tr: TableDataRows) => {
        const record: ConsolidatedQuestionResponse = this._surveyQuestionResponse.response.find(
          (r: ConsolidatedQuestionResponse) =>
            r.responseIdDisplayValue === tr.tableDataRowHeading
        )!;
        sortedArray.push(record);
      }
    );
    this._surveyQuestionResponse.response = [...sortedArray];

    // consoleLog({
    //   valuesArr: [
    //     'likert response data',
    //     this._surveyQuestionResponse.response,
    //     { sortedArray },
    //   ],
    // });

    /** Add percent values to response array */
    this._surveyQuestionResponse.response = <any[]>(
      this._surveyQuestionResponse?.response.map((el: any) => {
        /** 25022021 - Gaurav - JIRA-CA-152: Get totalTextHits and totalTextHitsDisplayPercent */
        let totalTextHits = 0;

        /** 01032021 - Gaurav - JIRA-CA-189: Revert CA-175 changes to NOT show percentage by totalResponses for question BUT by row/line as before.
         * Calculated only hits for additional_text since received no confirmation on percentage for it. */
        const totalHitsByResponseId = el.responseIdData.reduce(
          (total: number, r: ConsolidatedQuestionResponse) => total + r.hits!,
          0
        );

        if (
          this._surveyQuestionResponse?.textHitsResponse &&
          Array.isArray(this._surveyQuestionResponse?.textHitsResponse) &&
          this._surveyQuestionResponse?.textHitsResponse.length > 0
        ) {
          const textHitsData: TextHitsResponse = this._surveyQuestionResponse?.textHitsResponse?.find(
            (thr: TextHitsResponse) => thr.responseId === el.responseId
          ) ?? { responseId: el.responseId, totalTextHits: 0 };

          totalTextHits = textHitsData?.totalTextHits ?? 0;
        }

        return {
          ...el,
          totalHitsByResponseId,
          /** 25022021 - Gaurav - JIRA-CA-152: Add totalTextHits and totalTextHitsDisplayPercent to array */
          totalTextHits,
          responseIdData: [
            ...el.responseIdData.map((r: ConsolidatedQuestionResponse) => {
              const percent =
                totalHitsByResponseId > 0
                  ? (r?.hits! / totalHitsByResponseId) * 100
                  : 0;

              return {
                ...r,
                displayPercent: percent === 0 ? '0%' : `${percent.toFixed(2)}%`,
                percent,
              };
            }),
          ],
        };
      })
    );

    /** Structure all accumulated data to be survey friendly */
    let allLikertResponsesConcatenated: any[] = <any[]>[].concat.apply(
      <any[]>[],
      <any[]>this._surveyQuestionResponse.response.map(
        (el: ConsolidatedQuestionResponse) => {
          return [
            ...el.responseIdData.map((rid: ConsolidatedQuestionResponse) => {
              return {
                ...rid,
                responseIdDisplayValue: el.responseIdDisplayValue,
                responseIdDisplayValue2: el.responseIdDisplayValue2,
              };
            }),
          ];
        }
      )
    );

    // consoleLog({
    //   consoleType: ConsoleTypes.table,
    //   valuesArr: [allLikertResponsesConcatenated],
    // });

    let groupedLikertResponseData: any[] = <any[]>[].concat.apply(
      <any[]>[],
      <any[]>this._providedOptions.map((providedValue: any) => {
        return [
          allLikertResponsesConcatenated.filter(
            (r: ConsolidatedQuestionResponse) =>
              r.selectedValue === providedValue
          ),
        ];
      })
    );

    const allResponseIdDisplayValue: string[] = this._surveyQuestionResponse?.response?.map(
      (el: ConsolidatedQuestionResponse) => String(el.responseIdDisplayValue)
    );

    const allDisplayValues: string[] = this._surveyQuestionResponse?.response[0]?.responseIdData?.map(
      (el: ConsolidatedQuestionResponse) => String(el.displayValue)
    );

    // consoleLog({
    //   valuesArr: [{ allResponseIdDisplayValue }, { allDisplayValues }],
    // });

    // consoleLog({
    //   valuesArr: [
    //     { allLikertResponsesConcatenated },
    //     { groupedLikertResponseData },
    //     { allResponseIdDisplayValue },
    //     { allDisplayValues },
    //   ],
    // });

    let series: any[] = <any[]>[];
    let source: any[] = <any[]>[];
    let likertTableData: any[] = <any[]>[];

    /** 03032021 - Gaurav - JIRA-CA-196: Added rowspan property to likertTableData, by 'provided options' for Likert Radio */
    /** 22022021 - Gaurav - JIRA task CA-156: Change Likert table data for likert-radio  */
    if (
      this._surveyQuestionResponse?.questionType === QuestionTypes.likertRadio
    ) {
      /** Construct Likert table data for Likert Radio */
      likertTableData = [].concat.apply(
        [],
        <any[]>this._surveyQuestionResponse?.response?.map((el: any) => {
          return [
            ...[
              {
                isGroupBy: true,
                groupVal: el?.responseIdDisplayValue,
                groupVal2: el?.responseIdDisplayValue2,
                totalHitsByResponseId: el?.totalHitsByResponseId,
                rowspan: allDisplayValues.length ?? 1,
              },
            ],
            ...el?.responseIdData?.map((r: ConsolidatedQuestionResponse) => r),
          ];
        })
      );

      series = allDisplayValues.map(() => {
        return {
          type: ChartType.bar,
        };
      });

      source = [
        ...[['product', ...allDisplayValues]],
        ...allResponseIdDisplayValue.map((val: string, index) => {
          return [
            val,
            ...this._surveyQuestionResponse?.response[
              index
            ]?.responseIdData?.map((r: ConsolidatedQuestionResponse) => r.hits),
          ];
        }),
      ];
    } else {
      /** 03032021 - Gaurav - JIRA-CA-196: Added rowspan property to likertTableData, by responseId for Likert Check */
      /** Construct Likert table data for Likert Check */
      likertTableData = [].concat.apply(
        [],
        <any[]>groupedLikertResponseData.map(
          (el: ConsolidatedQuestionResponse[]) => {
            return [
              ...[
                {
                  isGroupBy: true,
                  groupVal: el[0].displayValue,
                  groupVal2: el[0].displayValue2,
                  rowspan: allResponseIdDisplayValue.length ?? 1,
                },
              ],
              ...el.map((r: ConsolidatedQuestionResponse) => r),
            ];
          }
        )
      );

      /** Create a dataset bar chart */
      series = allResponseIdDisplayValue.map(() => {
        return {
          type: ChartType.bar,
        };
      });

      source = [
        ...[['product', ...allResponseIdDisplayValue]],
        ...allDisplayValues.map((val: string, index) => {
          return [
            val,
            ...groupedLikertResponseData[index].map(
              (r: ConsolidatedQuestionResponse) => r.hits
            ),
          ];
        }),
      ];
    }

    responseCharts.push(
      this._echartsServiceInstance.getLikertDatasetBarChart({
        questionType: this._surveyQuestionResponse?.questionType,
        toolboxPosition: ToolboxPosition.toolbox_top_right_center,
        datasetSource: source,
        series,
      })
    );

    this._surveyQuestionResponse.questionTypeStructure = {
      ...this._surveyQuestionResponse?.questionTypeStructure!,
      response: this._surveyQuestionResponse.response ?? <any[]>[],
    };

    /** Prepare Response Charts data array */
    this._data = {
      ...this._questionText,
      responseCharts,
      questionType: this._surveyQuestionResponse?.questionType,
      totalHits: this._surveyQuestionResponse?.totalResponses,
      tableDataSource: likertTableData,
      tableDisplayColumns: ['responseIdDisplayValue', 'percent_hits', 'hits'],
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
