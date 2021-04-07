/** 23022021 - Gaurav - Refactored survey text type question response processing from campaign-survey-response component to classes
 * 06042021 - Gaurav - JIRA-CA-339: Update frontend with feature to show comments; added _surveyQuestionTextResponsesPayload and textResponsePayload
 */
import { DisplayResponseData } from 'src/app/dashboard/shared/components/echarts/echarts.model';
import { SurveyQuestionResponses } from '../../../response-ai/data-models/survey.model';
import { PayloadCampaignSurveyTextResponse } from '../../communication-ai.service';
import { ProcessSurveyResponse } from './process-survey-response';

export class ProcessSurveyResponseTextTypes extends ProcessSurveyResponse {
  constructor(
    protected _surveyQuestionResponse: SurveyQuestionResponses,
    protected _surveyQuestionTextResponsesPayload?: PayloadCampaignSurveyTextResponse
  ) {
    super(_surveyQuestionResponse, _surveyQuestionTextResponsesPayload);
  }

  protected _processQuestionResponse(): void {
    /** Find and add display value  */
    this._populateDisplayValues();

    this._surveyQuestionResponse.questionTypeStructure = {
      ...this._surveyQuestionResponse?.questionTypeStructure!,
      response: <any[]>[],
    };

    /** Prepare Response Charts data array */
    this._data = <DisplayResponseData>{
      ...this._questionText,
      questionType: this._surveyQuestionResponse?.questionType,
      totalHits: this._surveyQuestionResponse?.totalResponses,
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
