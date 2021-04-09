/** 17122020 - Gaurav - Init version
 * 21122020 - Gaurav - temporarily use json file to get data instead of from API
 * 29122020 - Gaurav - Added methods for Survey
 * 04212021 - Gaurav - Added NPS related code
 * 12012021 - Gaurav - Modified to use new Survey APIs
 * 2021-01-18 - Frank - new post API to search survey list with special conditions (payload)
 * 22012021 - Gaurav - Added new methods for response/nps questions and survey fetch based on selected org in Org DrDw. Removed now obsolete getQuestions() and getSurveys() which fetched
 * records based on the globally selected holding Org
 * 09042021 - Gaurav - JIRA-CA-256: Adjust survey type names
 */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { QuestionTypes } from './data-models/question.model';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';
import { consoleLog } from 'src/app/shared/util/common.util';
import {
  ComponentCategory,
  ResponseTypeStruct,
  SurveyOrgData,
  SurveyStruct,
} from './data-models/survey.model';
import { DataDomainConfig } from '../../shared/components/menu/constants.routes';
import {
  CanFilterByOrg,
  OrgDrDwEmitStruct,
} from '../../shared/components/org-dropdownlist/org-dropdownlist.component';

const BACKEND_URL = `${environment.apiUrlV1}`;

enum SurveyAPIIdentifier {
  nps = 'npsSurveys',
  response = 'respSurveys',
}

enum QuestionAPIIdentifier {
  nps = 'npsSurveyComponents',
  response = 'respSurveyComponents',
}

@Injectable()
export class ResponseAIService {
  private _questionsListener = new BehaviorSubject<ResponseTypeStruct[]>([]);
  private _surveysListener = new BehaviorSubject<SurveyStruct[]>([]);
  private _orgDrDwSelectionListener = new BehaviorSubject<any>({});

  constructor(private _http: HttpClient) {}

  /** Set/Get Org DrDw data for current selection on the Response/NPS Survey setup page */
  setOrgDrDwData(orgDrDwData: OrgDrDwEmitStruct): void {
    this._orgDrDwSelectionListener.next(orgDrDwData);
  }

  getOrgDrDwData(): Observable<any> {
    return this._orgDrDwSelectionListener.asObservable();
  }

  /** Response/NPS Question methods */
  getQuestionsFromSearchString(
    currentFeature: DataDomainConfig,
    searchString: string
  ): Observable<any> {
    return this._http
      .get(
        `${BACKEND_URL}/${
          currentFeature === DataDomainConfig.nps
            ? QuestionAPIIdentifier.nps
            : QuestionAPIIdentifier.response
        }${searchString}`
      )
      .pipe(
        map((data: any) => {
          const questionData: ResponseTypeStruct[] = data.results ?? <any[]>[];
          this._questionsListener.next(questionData);
          return questionData;
        })
      );
  }

  getQuestionsFromSearchQuery(
    currentFeature: DataDomainConfig,
    payload: any
  ): Observable<any> {
    return this._http
      .post(
        `${BACKEND_URL}/${
          currentFeature === DataDomainConfig.nps
            ? QuestionAPIIdentifier.nps
            : QuestionAPIIdentifier.response
        }/search`,
        payload
      )
      .pipe(
        map((data: any) => {
          const questionData: ResponseTypeStruct[] = data.results ?? <any[]>[];
          this._questionsListener.next(questionData);
          return questionData;
        })
      );
  }

  createQuestion(currentFeature: string, payload: any): Observable<any> {
    return this._http.post(
      `${BACKEND_URL}/${
        currentFeature === DataDomainConfig.nps
          ? QuestionAPIIdentifier.nps
          : QuestionAPIIdentifier.response
      }`,
      payload
    );
  }

  updateQuestion(
    currentFeature: string,
    id: string,
    payload: any
  ): Observable<any> {
    return this._http.put(
      `${BACKEND_URL}/${
        currentFeature === DataDomainConfig.nps
          ? QuestionAPIIdentifier.nps
          : QuestionAPIIdentifier.response
      }/${id}`,
      payload
    );
  }

  deleteQuestion(currentFeature: string, id: string): Observable<any> {
    return this._http.delete(
      `${BACKEND_URL}/${
        currentFeature === DataDomainConfig.nps
          ? QuestionAPIIdentifier.nps
          : QuestionAPIIdentifier.response
      }/${id}`
    );
  }

  /** Survey methods */
  getSurveysFromSearchString(
    currentFeature: DataDomainConfig,
    searchString: string
  ): Observable<any> {
    return this._http
      .get(
        `${BACKEND_URL}/${
          currentFeature === DataDomainConfig.nps
            ? SurveyAPIIdentifier.nps
            : SurveyAPIIdentifier.response
        }${searchString}`
      )
      .pipe(
        map((data: any) => {
          consoleLog({
            valuesArr: ['response AI: getSurveysFromSearchString data:', data],
          });

          const surveyData: SurveyStruct[] = data.results ?? <any[]>[];
          this._surveysListener.next(surveyData);
          return surveyData;
        })
      );
  }

  getSurveysFromSearchQuery(
    currentFeature: DataDomainConfig,
    payload: any
  ): Observable<any> {
    return this._http
      .post(
        `${BACKEND_URL}/${
          currentFeature === DataDomainConfig.nps
            ? SurveyAPIIdentifier.nps
            : SurveyAPIIdentifier.response
        }/search`,
        payload
      )
      .pipe(
        map((data: any) => {
          consoleLog({
            valuesArr: ['response AI: getSurveysFromSearchQuery data:', data],
          });

          const surveyData: SurveyStruct[] = data.results ?? <any[]>[];
          this._surveysListener.next(surveyData);
          return surveyData;
        })
      );
  }

  getSurveyList(
    currentFeature: DataDomainConfig,
    searchString: string
  ): Observable<any> {
    return this._http.get(
      `${BACKEND_URL}/${
        currentFeature === DataDomainConfig.nps
          ? SurveyAPIIdentifier.nps
          : SurveyAPIIdentifier.response
      }${searchString}`
    );
  }

  /** 2021-01-18 - Frank - new post API to search survey list with special conditions (payload) */
  getSurveysFromSearch(
    currentFeature: DataDomainConfig,
    payload: any
  ): Observable<any> {
    return this._http.post(
      `${BACKEND_URL}/${
        currentFeature === DataDomainConfig.nps
          ? SurveyAPIIdentifier.nps
          : SurveyAPIIdentifier.response
      }/search`,
      payload
    );
  }

  createSurvey(currentFeature: string, payload: any): Observable<any> {
    return this._http.post(
      `${BACKEND_URL}/${
        currentFeature === DataDomainConfig.nps
          ? SurveyAPIIdentifier.nps
          : SurveyAPIIdentifier.response
      }`,
      payload
    );
  }

  updateSurvey(
    currentFeature: string,
    id: string,
    payload: any
  ): Observable<any> {
    return this._http.put(
      `${BACKEND_URL}/${
        currentFeature === DataDomainConfig.nps
          ? SurveyAPIIdentifier.nps
          : SurveyAPIIdentifier.response
      }/${id}`,
      payload
    );
  }

  deleteSurvey(currentFeature: string, id: string): Observable<any> {
    return this._http.delete(
      `${BACKEND_URL}/${
        currentFeature === DataDomainConfig.nps
          ? SurveyAPIIdentifier.nps
          : SurveyAPIIdentifier.response
      }/${id}`
    );
  }

  /** Listeners to record fetch subscription */
  getQuestionsListenerObs(): Observable<ResponseTypeStruct[]> {
    return this._questionsListener.asObservable();
  }

  getSurveysListenerObs(): Observable<SurveyStruct[]> {
    return this._surveysListener.asObservable();
  }

  /** Get saved section or questions */
  /** This functionality is not available currently */
  getSavedSectionStructs(
    currentFeature: DataDomainConfig,
    orgDrDwData: OrgDrDwEmitStruct
  ): Observable<any[]> {
    return of([]);
  }

  /** 22012021 - Gaurav - Return 'saved questions' based on the
   * member or holding org selection on the Survey Setup component */
  getSavedQuestionStructs(
    currentFeature: DataDomainConfig,
    orgDrDwData: OrgDrDwEmitStruct
  ): Observable<any[]> {
    if (orgDrDwData?.filterByOrg === CanFilterByOrg.BOTH_ORGS) {
      return this.getQuestionsFromSearchQuery(
        currentFeature,
        orgDrDwData?.searchPayload
      ).pipe(
        map((questionsList) => {
          const typeQuestionsList = questionsList.filter(
            (q: ResponseTypeStruct) =>
              q.componentCategory === ComponentCategory.question
          );
          return typeQuestionsList.length > 0 ? typeQuestionsList : <any[]>[];
        })
      );
    }

    /** orgDrDwData?.searchString should always have a value for either a holdingOrgId or a search string of memberOrgs */
    return this.getQuestionsFromSearchString(
      currentFeature,
      orgDrDwData?.searchString
    ).pipe(
      map((questionsList) => {
        const typeQuestionsList = questionsList.filter(
          (q: ResponseTypeStruct) =>
            q.componentCategory === ComponentCategory.question
        );
        return typeQuestionsList.length > 0 ? typeQuestionsList : <any[]>[];
      })
    );
  }

  /** Static data types */
  getInputTypes(): any[] {
    return [
      { value: 'text', viewValue: 'Text' },
      { value: 'password', viewValue: 'Password' },
      { value: 'email', viewValue: 'Email' },
      { value: 'number', viewValue: 'Number' },
    ];
  }

  getDisplayQuestionTypes(currentFeature: DataDomainConfig): any[] {
    if (currentFeature === DataDomainConfig.nps) {
      return [
        { displayName: 'Emoji Rating', name: QuestionTypes.ratingEmoji },
        {
          displayName: 'NPS Box Row',
          name: QuestionTypes.singleChoiceRadioBox,
        },
        { displayName: 'Star Rating', name: QuestionTypes.ratingStar },
        {
          displayName: 'Text Box - 100 Characters',
          name: QuestionTypes.singleTextInput,
        },
        {
          displayName: 'Text Box - Max 1000 Characters',
          name: QuestionTypes.singleTextArea,
        },
      ];
    }

    return [
      {
        displayName: 'DropDown Selection',
        name: QuestionTypes.dropDownSelection,
      },
      { displayName: 'Emoji Rating', name: QuestionTypes.ratingEmoji },
      {
        displayName: 'Likert - Check Boxes (Multiple Choice)',
        name: QuestionTypes.likertCheck,
      },
      {
        displayName: 'Likert - Radio Buttons (Single Choice)',
        name: QuestionTypes.likertRadio,
      },
      {
        displayName:
          'Matrix - Check Boxes (Multi Row and Columns Multiple Choice)',
        name: QuestionTypes.matrixCheck,
      },
      {
        displayName:
          'Matrix - Radio Buttons (Multi Row and Columns Single Choice)',
        name: QuestionTypes.matrixRadio,
      },
      {
        displayName: 'Single Row - Boxes (Single Choice with 0 to 11 Values)',
        name: QuestionTypes.singleChoiceRadioBox,
      },
      {
        displayName: 'Single Row - Check Boxes (Multiple Choice)',
        name: QuestionTypes.multiChoiceCheckH,
      },
      {
        displayName: 'Single Row - Radio Button (Single Choice)',
        name: QuestionTypes.singleChoiceRadioH,
      },
      { displayName: 'Star Rating', name: QuestionTypes.ratingStar },
      {
        displayName: 'Text Box - 100 Characters',
        name: QuestionTypes.singleTextInput,
      },
      {
        displayName: 'Text Box - Max 1000 Characters',
        name: QuestionTypes.singleTextArea,
      },
    ];
  }

  //Get response Survey list
  getRespSurveyList(id: string) {
    return this._http.get(`${BACKEND_URL}/respSurveys/${id}`);
  }
  //Get nps Survey list
  getNpsSurveyList(id: string) {
    return this._http.get(`${BACKEND_URL}/npsSurveys/${id}`);
  }
}
