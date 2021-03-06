/** 03122020 - Ramesh - Init version: Service for User Management Feature
 * 14122020 - Gaurav - New method to get email templates passing special post payload
 * 13012021 - Ramesh - Implemented Response AI and NPS endpoints for Campain Master
 * 10022021 - Gaurav - Call to the new Campaign Survey Response API
 * 12022021 - Gaurav - Added expected response format CampaignSurveyResponse for getCampaignSurveyResponse()
 * 26022021 - Gaurav - JIRA-CA-185: bug, use nps specific API for survey results
 * 05032021 - Gaurav - JIRA-CA-154 - Replaced Campaign Survey Response API with new post & payload
 * 06042021 - Gaurav - JIRA-CA-339: Update frontend with feature to show comments; added PayloadCampaignSurveyTextResponse
 * 08042021 - Gaurav - JIRA-CA-350: Fix for 'Empty campaign and message template lists generates error' bug
 */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { DateTime } from 'luxon';

import { environment } from '../../../../environments/environment';
import { CampaignSurveyResponse } from '../response-ai/data-models/survey.model';
import { DataDomainConfig } from '../../shared/components/menu/constants.routes';
import { delay, tap } from 'rxjs/operators';
import { consoleLog } from 'src/app/shared/util/common.util';
import { QuestionTypes } from '../response-ai/data-models/question.model';

const BACKEND_URL = `${environment.apiUrlV1}`;

/** 05032021 - Gaurav - JIRA-CA-154 */
export interface PayloadCampaignSurveyResponse {
  campaignId?: string;
  startDate?: string;
  endDate?: string;
  messageEventId?: string;
  currentUserTimeZone?: string;
}

export interface PayloadCampaignSurveyTextResponse
  extends PayloadCampaignSurveyResponse {
  questionId?: string;
  questionType?: QuestionTypes;
}

export interface CampaignSurveyTextResponse {
  comments: string[];
  questionId: string;
  questionType: QuestionTypes;
}

export enum CampaignSurveyResponseMode {
  campaign = 'campaign',
  messageEvent = 'message-event',
}

export type CampaignType = 'comm' | 'resp' | 'nps';
export type MessageType = 'email' | 'sms' | 'whatsApp';

export const kSmsTextMaxLength = 160;
export const kWhatsAppTextMaxLength = 2000;
export const kEmailSubjectMaxLength = 200;

@Injectable()
export class CommunicationAIService {
  /** Store fetched lists so that CRUD objects don't have to fetch individual record again */
  private _selectedOrgData = new Subject<any>();
  private _getTimeZone = new Subject<any>();
  private _getCampStatusDialog = new Subject<any>();
  private _selOrgData = new Subject<any>();
  private _lunchedCampViewMode = new Subject<any>();
  private _loadingSub = new BehaviorSubject<boolean>(false);

  commAiApiLoading$: Observable<boolean> = this._loadingSub
    .asObservable()
    .pipe(delay(0));

  constructor(private _http: HttpClient) {}

  /** 05032021 - Gaurav - JIRA-CA-154 - New Campaign Survey Response API  */
  getCampaignSurveyResponse(
    currentFeature: DataDomainConfig,
    payload: PayloadCampaignSurveyResponse
  ): Observable<CampaignSurveyResponse> {
    return this._http
      .post<CampaignSurveyResponse>(
        `${BACKEND_URL}/${
          currentFeature === DataDomainConfig.nps
            ? 'npsCampaigns'
            : 'respCampaigns'
        }/surveyResults`,
        payload
      )
      .pipe(
        tap((response: CampaignSurveyResponse) => {
          consoleLog({
            valuesArr: [
              'comm service getCampaignSurveyResponse()',
              { currentFeature },
              { payload },
              { response },
            ],
          });

          if (
            !response ||
            !response?.submissionStatus ||
            !response?.surveyVersion ||
            !Array.isArray(response.submissionStatus)
          ) {
            throw new Error('No Survey Response data found on server.');
          }
        })
      );
  }

  /** 06042021 - Gaurav - JIRA-CA-339: Update frontend with feature to show comments */
  setLoading(value: boolean): void {
    this._loadingSub.next(value);
  }

  getCampaignSurveyTextResponse(
    currentFeature: DataDomainConfig,
    payload: PayloadCampaignSurveyTextResponse
  ): Observable<CampaignSurveyTextResponse> {
    return this._http.post<CampaignSurveyTextResponse>(
      `${BACKEND_URL}/${
        currentFeature === DataDomainConfig.nps
          ? 'npsCampaigns'
          : 'respCampaigns'
      }/surveyResults/comments`,
      payload
    );
  }

  /** Templates APIs */
  getTemplates() {
    return this._http.get<any>(`${BACKEND_URL}/emailTemplates`);
  }
  getTemplateList(searchString: string): Observable<any> {
    return this._http.get<any>(`${BACKEND_URL}/emailTemplates${searchString}`);
  }
  /** 14122020 - Gaurav - new post API to search template list with special conditions (payload) */
  getTemplateListFromSearch(payload: any): Observable<any> {
    return this._http.post<any>(
      `${BACKEND_URL}/emailTemplates/search`,
      payload
    );
  }
  createTemplate(payload: any): Observable<any> {
    return this._http.post(`${BACKEND_URL}/emailTemplates`, payload);
  }
  updateTemplate(payload: any, tempId: string): Observable<any> {
    return this._http.put(`${BACKEND_URL}/emailTemplates/${tempId}`, payload);
  }
  deleteTemplate(tempId: string): Observable<any> {
    return this._http.delete(`${BACKEND_URL}/emailTemplates/${tempId}`);
  }
  //Get campaign master list
  getCampaignListFromPayload(dataDomain: string, search: object) {
    return this._http.post<any>(`${BACKEND_URL}/${dataDomain}/search`, search);
  }
  getCampaignListFromSearch(dataDomain: string, searchString: string) {
    return this._http.get<any>(`${BACKEND_URL}/${dataDomain}${searchString}`);
  }
  //Get campaign master item by id
  getCampaignById(campId: string) {
    return this._http.get<any>(`${BACKEND_URL}/commCampaigns/${campId}`);
  }
  //Create campaign master
  createCampaign(payload: any): Observable<any> {
    return this._http.post(`${BACKEND_URL}/commCampaigns`, payload);
  }
  //Update campaign master
  updateCampaign(payload: any, tempId: string): Observable<any> {
    return this._http.put(`${BACKEND_URL}/commCampaigns/${tempId}`, payload);
  }

  //Delete campaign mster item
  deleteCampaign(campaignId: string): Observable<any> {
    return this._http.delete(`${BACKEND_URL}/commCampaigns/${campaignId}`);
  }
  //Delete campaign mster item
  deleteCampaignWithCampaignType(
    campaignId: string,
    campaignType: CampaignType
  ): Observable<any> {
    return this._http.delete(
      `${BACKEND_URL}/${campaignType}Campaigns/${campaignId}`
    );
  }
  //Check criteria
  checkCriteria(payload: any) {
    return this._http.post(`${BACKEND_URL}/customers/search`, payload);
  }
  //Campaign Preview Schedule
  previewSchedule(payload: any) {
    return this._http.post(
      `${BACKEND_URL}/commCampaigns/previewSchedule`,
      payload
    );
  }

  //Get feedback campaign master list
  getRespCampaignList() {
    return this._http.get<any>(`${BACKEND_URL}/respCampaigns`);
  }
  //Get feedback campaign master item by id
  getRespCampaignById(campId: string) {
    return this._http.get<any>(`${BACKEND_URL}/respCampaigns/${campId}`);
  }
  //Create feedback campaign master
  createRespCampaign(payload: any): Observable<any> {
    return this._http.post(`${BACKEND_URL}/respCampaigns`, payload);
  }
  //Update feedback campaign master
  updateRespCampaign(payload: any, tempId: string): Observable<any> {
    return this._http.put(`${BACKEND_URL}/respCampaigns/${tempId}`, payload);
  }
  //Delete feedback campaign mster item
  deleteRespCampaign(campaignId: string): Observable<any> {
    return this._http.delete(`${BACKEND_URL}/respCampaigns/${campaignId}`);
  }

  //Get nps campaign master list
  getNPSCampaignList() {
    return this._http.get<any>(`${BACKEND_URL}/npsCampaigns`);
  }
  //Update nps campaign master
  updateNpspCampaign(payload: any, tempId: string): Observable<any> {
    return this._http.put(`${BACKEND_URL}/npsCampaigns/${tempId}`, payload);
  }
  //Get nps campaign master item by id
  getNpsCampaignById(campId: string) {
    return this._http.get<any>(`${BACKEND_URL}/npsCampaigns/${campId}`);
  }
  //Create nps campaign master
  createNpsCampaign(payload: any): Observable<any> {
    return this._http.post(`${BACKEND_URL}/npsCampaigns`, payload);
  }
  //Update nps campaign master
  updateNpsCampaign(payload: any, tempId: string): Observable<any> {
    return this._http.put(`${BACKEND_URL}/npsCampaigns/${tempId}`, payload);
  }
  setSelOrgData(data: any) {
    this._selectedOrgData = data;
  }
  getSelOrgData() {
    return this._selectedOrgData;
  }
  setSelOrgDataObservable(data: any) {
    this._selOrgData.next(data);
  }
  getSelOrgDataObservable() {
    return this._selOrgData.asObservable();
  }
  //set view launched campagins view mode
  setLauchedCampMode(data: any) {
    this._lunchedCampViewMode.next(data);
  }
  //get view launched campagins view mode
  getLauchedCampMode() {
    return this._lunchedCampViewMode.asObservable();
  }
  //get communication message events endpoint
  getCampaignMessageEvents(campId: string) {
    return this._http.get(
      `${BACKEND_URL}/commCampaigns/${campId}/messageEvents`
    );
  }
  //get communication message events endpoint search
  getCampaignMessageEventsBySearch(payload: string) {
    return this._http.post(
      `${BACKEND_URL}/commCampaigns/messageEvents/search`,
      payload
    );
  }
  //get responsive message events endpoint
  getRespCampMessageEvents(campId: string) {
    return this._http.get(
      `${BACKEND_URL}/respCampaigns/${campId}/messageEvents`
    );
  }
  //get nps message events endpoint
  getNpsCampMessageEvents(campId: string) {
    return this._http.get(
      `${BACKEND_URL}/npsCampaigns/${campId}/messageEvents`
    );
  }
  //get communication message events endpoint
  getMessageEventsDetails(type: string, campId: string, messageId: string) {
    return this._http.get(
      `${BACKEND_URL}/${type}/${campId}/messageEvents/${messageId}/messages`
    );
  }
  //get message events info endpoint
  getMessageEventsInfo(
    type: string,
    campId: string,
    messageId: string,
    eventId: string
  ) {
    return this._http.get(
      `${BACKEND_URL}/${type}/${campId}/messageEvents/${messageId}/messages/${eventId}`
    );
  }
  //set received time zone
  setReceivedTimeZone(time: any) {
    this._getTimeZone.next(time);
  }
  //get received time zone
  getReceivedTimeZone() {
    return this._getTimeZone.asObservable();
  }

  //Change timezone with recived date
  handleDateTimeZoneReceive(dateString: string, timeZone: string): Date {
    let date = DateTime.fromISO(dateString);
    date = date.setZone(timeZone).setZone('local', { keepLocalTime: true });
    return date.toJSDate();
  }

  //Set timezone with recived date
  handleDateTimeZoneSend(dateObj: Date, timeZone: string): Date {
    let date = DateTime.fromJSDate(dateObj);
    date = date.setZone(timeZone, { keepLocalTime: true });
    return date.toJSDate();
  }

  //get holding orgs attributes list
  getCustomersAttrbutes(id: any) {
    return this._http.get(`${BACKEND_URL}/customers/search/${id}`);
  }

  //set Campaign status dialog object
  setCampStatusDialog(camp: any) {
    this._getCampStatusDialog.next(camp);
  }
  //get received time zone
  getCampStatusDialog() {
    return this._getCampStatusDialog.asObservable();
  }
}
