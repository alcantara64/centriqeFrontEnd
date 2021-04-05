/** 16122020 - Gaurav - Survey instance (of pages) Interface and Class.
 * Important Note: The interface and enums MUST match those on the ng-survey server
 * Survey Data Model: survey* (we're here) => pages => sections => questions
 * 23122020 - Gaurav - Fixed issues related to duplicating and moving pages
 * 29122020 - Gaurav - Added SurveyStruct and new fields to ResponseTypeStruct
 * 30122020 - Gaurav - Pass some more fields for the holdingOrg in the survey as SurveyHoldingOrgData
 * 01012021 - Gaurav - Added mandatory field responseIdentifierText
 * 13012021 - Gaurav - Removed surveyAvailabilityStatus
 * 19012021 - Gaurav - Added code field to SurveyStruct and ResponseTypeStruct, and removed displayName
 * 20012021 - Gaurav - Added memberOrg to ResponseTypeStruct
 * 22012021 - Gaurav - Added title and showLogo fields to SurveyStruct
 * 12022021 - Gaurav - Added Campaign Survey Response related interfaces
 * 25022021 - Gaurav - JIRA-CA-152: Added TextHitsResponse
 * 02032021 - Gaurav - JIRA-CA-195: totalHitsByResponseId
 * 30032021 - Gaurav - JIRA-CA-277: Added interfaces for message templates into Survey struct interface */

import { OrgIdentifier } from 'src/app/dashboard/shared/components/org-dropdownlist/org-dropdownlist.component';
import { consoleLog, ConsoleTypes } from 'src/app/shared/util/common.util';
import { Page, SurveyPage } from './page.model';
import { Question, QuestionTypes, SurveyQuestion } from './question.model';
import { Section, SurveySection } from './section.model';

/** Campaign Survey Response related interfaces */
export interface SurveyVersion {
  code: string;
  createdAt: string;
  createdBy: string;
  dataDomain: string;
  displayName: string;
  holdingOrg: any;
  introText: string;
  memberOrg: any;
  modifiedBy: string;
  name: string;
  previewId: string;
  showLogo: boolean;
  status: number;
  surveyPages: SurveyPage[];
  surveyType: string;
  title: string;
  updatedAt: string;
  _id: string;
}

export interface SubmissionStatus {
  submissionStatus: SurveySubmissionStatus;
  hits: number;
  displayStatus?: string;
  displayPercent?: string;
  percent?: number;
}

export interface ConsolidatedQuestionResponse {
  responseId?: string;
  selectedValue?: string;
  hits?: number;
  displayValue?: string;
  displayValue2?: string;
  responseIdDisplayValue?: string;
  responseIdDisplayValue2?: string;
  responseIdData?: any;
  displayPercent?: string;
  percent?: number;
  totalHitsByResponseId?: number;
  totalTextHits?: number;
  totalTextHitsPercent?: number;
  totalTextHitsDisplayPercent?: string;
}

export interface SurveyQuestionResponses {
  providedOptions: string[] | number[];
  questionId: string;
  questionType: QuestionTypes;
  response: ConsolidatedQuestionResponse[];
  totalResponses: number;
  textHitsResponse?: TextHitsResponse[];
  pageNumber?: number;
  sectionNumber?: number;
  questionNumber?: number;
  questionText?: string;
  questionTypeStructure?: any;
  required?: boolean;
  responseIdentifierText?: string;
  questionNumberOrderToDisplay?: any;
  subQuestionText?: string;
}

export interface TextHitsResponse {
  responseId?: string;
  totalTextHits: number;
}

export interface CampaignSurveyResponse {
  responses: SurveyQuestionResponses[];
  submissionStatus: SubmissionStatus;
  surveyVersion: SurveyVersion;
}

export interface SurveySubmissionStatusData {
  submissionStatus: SurveySubmissionStatus;
  hits: number;
  percent?: number;
  displayPercent?: string;
  displayStatus?: string;
}
/** Campaign Survey Response related interfaces - ENDS */

export interface SurveyOrgData {
  currentOrgIdentifier: OrgIdentifier;
  holdingOrg: any;
  memberOrg: any;
}

export interface ResponseTypeStruct extends SurveyQuestion, SurveySection {
  _id?: string;
  dataDomain: string;
  holdingOrg: string;
  memberOrg: string;
  code: string;
  name: string;
  componentCategory: ComponentCategory; //question or section
  status: number;
}

export enum ComponentCategory {
  question = 'question',
  section = 'section',
}

export interface SurveyEmailTemplate {
  subject: string;
  body: string;
  templateData: string;
}

export interface SurveySmsTemplate {
  text: string;
}

export interface SurveyWhatsAppTemplate {
  text: string;
}

export interface SurveyStruct extends SurveyInstance {
  _id: string;
  dataDomain: string;
  holdingOrg: SurveyHoldingOrgData;
  memberOrg: SurveyHoldingOrgData;
  code: string;
  name: string;
  title?: string;
  showLogo?: boolean;
  status: number;
  userId?: string;
  introText?: string;
  channel: {
    email?: SurveyEmailTemplate;
    sms?: SurveySmsTemplate;
    whatsApp?: SurveyWhatsAppTemplate;
  };
}

export interface SurveyHoldingOrgData {
  _id: string;
  name: string;
  logoUrl: string;
}

export enum SurveyType {
  single = 'single',
  multi = 'multi',
}

export enum SurveySubmissionStatus {
  pending = 'pending',
  inProgress = 'inProgress',
  submitted = 'submitted',
  expired = 'expired',
}

export interface SurveyInstance {
  surveyType: SurveyType;
  surveyPages: Page[];
  surveyResponse?: any;
}

export class Survey implements SurveyInstance {
  constructor(
    public surveyType: SurveyType,
    public surveyPages: Page[],
    public surveyResponse?: any
  ) {}

  /** Page related methods - starts */
  onAddPage(): void {
    const pageNumber = this.surveyPages.length + 1;
    this.surveyPages.push(
      new Page(pageNumber, `Page Title ${pageNumber}`, <Section[]>[])
    );

    consoleLog({
      valuesArr: ['onAddPage this.surveyPages', this.surveyPages],
    });
  }

  onDuplicatePage(currentPageIndex: number): void {
    this.surveyPages.splice(
      currentPageIndex + 1,
      0,
      new Page(
        this.surveyPages[currentPageIndex].pageNumber,
        this.surveyPages[currentPageIndex].pageHeading,
        this.surveyPages[currentPageIndex].pageSections.map(
          (sectionData: any) =>
            new Section(
              sectionData.sectionNumber,
              sectionData.sectionHeading,
              sectionData.sectionQuestions.map(
                (questionData: any) =>
                  new Question(
                    questionData.questionNumber,
                    questionData.questionText,
                    questionData.questionType,
                    Section.regenerateNameAndIDValues(
                      questionData.questionType,
                      {
                        ...questionData.questionTypeStructure,
                      }
                    ),
                    questionData.required,
                    questionData.responseIdentifierText,
                    questionData.questionNumberOrderToDisplay,
                    questionData.subQuestionText
                  )
              )
            )
        )
      )
    );

    this._reorderPageNumberValue();
  }

  onDeletePage(currentPageIndex: number): void {
    this.surveyPages.splice(currentPageIndex, 1);
    this._reorderPageNumberValue();

    consoleLog({
      consoleType: ConsoleTypes.warn,
      valuesArr: ['onDeletePage this.surveyPages', this.surveyPages],
    });
  }

  onPageMoveDown(indexDown: number): void {
    const pageToMoveDownData: Page = this.surveyPages[indexDown];
    this.surveyPages[indexDown] = this.surveyPages[indexDown + 1];
    this.surveyPages[indexDown + 1] = pageToMoveDownData;
    this._reorderPageNumberValue();
  }

  onPageMoveUp(indexUp: number): void {
    const pageToMoveUpData: Page = this.surveyPages[indexUp];
    this.surveyPages[indexUp] = this.surveyPages[indexUp - 1];
    this.surveyPages[indexUp - 1] = pageToMoveUpData;
    this._reorderPageNumberValue();
  }

  private _reorderPageNumberValue(): void {
    this.surveyPages = this.surveyPages.map(
      (page: Page, i: number) =>
        new Page(i + 1, page.pageHeading, [...page.pageSections])
    );

    // consoleLog({
    //   valuesArr: ['_reorderPageNumberValue this.surveyPages', this.surveyPages],
    // });
  }
  /** Page related methods - ends */
}
