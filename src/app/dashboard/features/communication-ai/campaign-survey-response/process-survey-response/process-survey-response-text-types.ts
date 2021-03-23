/** 23022021 - Gaurav - Refactored survey text type question response processing from campaign-survey-response component to classes */
import { SurveyQuestionResponses } from '../../../response-ai/data-models/survey.model';
import { ProcessSurveyResponse } from './process-survey-response';

export class ProcessSurveyResponseTextTypes extends ProcessSurveyResponse {
  constructor(protected _surveyQuestionResponse: SurveyQuestionResponses) {
    super(_surveyQuestionResponse);
  }

  protected _processQuestionResponse(): void {
    /** Find and add display value  */
    this._populateDisplayValues();

    this._surveyQuestionResponse.questionTypeStructure = {
      ...this._surveyQuestionResponse?.questionTypeStructure!,
      response: <any[]>[],
    };

    /** Prepare Response Charts data array */
    this._data = {
      ...this._questionText,
      questionType: this._surveyQuestionResponse?.questionType,
      totalHits: this._surveyQuestionResponse?.totalResponses,
      questionTypeStructure: this._surveyQuestionResponse
        ?.questionTypeStructure,
    };
  }
}
