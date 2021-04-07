/** 09022021 - Gaurav - Init version: Component to show consolidated campaign survey responses
 * 17022021 - Gaurav - JIRA CA-148
 * 18072021 - Gaurav - JIRA CA-150
 * 22022021 - Gaurav - JIRA CA-156: Table & Graph: Likert Radio - switch data
 * 22022021 - Gaurav - JIRA CA-155: Corrected percentage calcualtion axis for Likerts
 * 23022021 - Gaurav - Refactored survey submission status processing from campaign-survey-response component to class ProcessSurveySubmissionStatus
 * 23022021 - Gaurav - Refactored survey response processing from campaign-survey-response component to class ProcessSurveyResponse
 * 26022021 - Gaurav - JIRA-CA-185: bug, use nps specific API for survey results. Pass currentFeature to survey results API call
 * 01032021 - Gaurav - JIRA-CA-153: Save survey results to PDF
 * 04032021 - Gaurav - JIRA-CA-199: reduce survey report PDF size
 * 06042021 - Gaurav - JIRA-CA-339: Update frontend with feature to show comments
 */
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { MatAccordion } from '@angular/material/expansion';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of, Subscription } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// import * as wkhtmltopdf from 'wkhtmltopdf';

import { ChartType } from 'src/app/dashboard/shared/components/echarts/echarts.model';
import {
  dashboardRouteLinks,
  DataDomainConfig,
} from 'src/app/dashboard/shared/components/menu/constants.routes';
import { LoadingService } from 'src/app/shared/services/loading.service';
import {
  consoleLog,
  generateNameAndCodeString,
} from 'src/app/shared/util/common.util';
import { QuestionTypes } from '../../response-ai/data-models/question.model';
import { CampaignSurveyResponse } from '../../response-ai/data-models/survey.model';
import {
  CampaignSurveyResponseMode,
  CommunicationAIService,
  PayloadCampaignSurveyResponse,
  PayloadCampaignSurveyTextResponse,
} from '../communication-ai.service';
import { EchartsService } from 'src/app/dashboard/shared/components/echarts/echarts.service';
import { ProcessSurveySubmissionStatus } from './process-survey-submission/process-survey-submission-status';
import { ProcessSurveyResponse } from './process-survey-response/process-survey-response';
import { ProcessSurveyResponseBaseTypes } from './process-survey-response/process-survey-response-base-types';
import { ProcessSurveyResponseLikertTypes } from './process-survey-response/process-survey-response-likert-types';
import { ProcessSurveyResponseTextTypes } from './process-survey-response/process-survey-response-text-types';
import {
  DashboardService,
  HoldingOrg,
} from 'src/app/dashboard/dashboard.service';
import { DatePipe } from '@angular/common';
import { SnackbarService } from 'src/app/shared/components/snackbar.service';
import { MatTabChangeEvent } from '@angular/material/tabs';

@Component({
  templateUrl: './campaign-survey-response.component.html',
  styleUrls: ['./campaign-survey-response.component.css'],
})
export class CampaignSurveyResponseComponent implements OnInit, OnDestroy {
  @ViewChild(MatAccordion) accordion!: MatAccordion; // Used in template
  @ViewChildren('pdfContent') pdfContent!: QueryList<ElementRef>;
  @ViewChildren('pdfHtmlPageLikertTable')
  pdfHtmlPageLikertTable!: QueryList<ElementRef<HTMLDivElement>>; //ElementRef or StatsTableComponent;

  private _pdfMode = false;
  private _globalHoldingOrgListenerSub$!: Subscription;

  readonly questionTypes = QuestionTypes;
  readonly chartType = ChartType;
  private _loading = false;
  private _globalHoldingOrg!: HoldingOrg;
  private _currentFeature!: DataDomainConfig;
  private _id!: string;
  private _queryParams!: any;
  private _currentCampaignData!: any;
  private _campaignSurveyResponse!: any;
  private _processSurveySubmissionStatus!: ProcessSurveySubmissionStatus;
  private _processSurveyResponse: ProcessSurveyResponse[] = <
    ProcessSurveyResponse[]
  >[];

  selectedTabIndex: number = 1;
  pdfHTMLStep = 0;

  totalPdfHtmlPageCount = 1;
  pdfHtmlPages = [0];
  showAllPdfHtmlPages = false;
  pdfGenerateProgress = 0;
  pdfGenerateStatus = '';
  serverError = false;
  isTextLoading = false;

  constructor(
    private _route: ActivatedRoute,
    private _commAIService: CommunicationAIService,
    private _loadingService: LoadingService,
    private _router: Router,
    private _echartsService: EchartsService /** Do not remove this, even unused */,
    private _dashboardService: DashboardService,
    public datePipe: DatePipe,
    private _snackbarService: SnackbarService
  ) {
    /** Set current feature: nps OR response */
    switch (this._route.snapshot.routeConfig?.path) {
      case dashboardRouteLinks.NPS_MANAGE_NPS_CAMPAIGN_VIEW_SURVEY_RESPONSES
        .routerLink:
      case dashboardRouteLinks.NPS_NPS_CAMPAIGN_VIEW_SURVEY_RESPONSES_VIEW
        .routerLink:
      case dashboardRouteLinks.NPS_PAST_CAMPAIGNS_VIEW_SURVEY_RESPONSES_VIEW
        .routerLink:
        this._currentFeature = DataDomainConfig.nps;
        break;

      case dashboardRouteLinks
        .RESPONSE_MANAGE_FEEDBACK_CAMPAIGN_VIEW_SURVEY_RESPONSES.routerLink:
      case dashboardRouteLinks
        .RESPONSE_FEEDBACK_CAMPAIGN_VIEW_SURVEY_RESPONSES_VIEW.routerLink:
      case dashboardRouteLinks
        .RESPONSE_PAST_CAMPAIGNS_VIEW_SURVEY_RESPONSES_VIEW.routerLink:
        this._currentFeature = DataDomainConfig.response;
        break;

      default:
    }

    this._id = this._route.snapshot.params['id'];
    this._queryParams = this._route.snapshot.queryParams;

    consoleLog({
      valuesArr: [
        'this._currentFeature',
        this._currentFeature,
        'this._id',
        this._id,
        'this._queryParams',
        this._queryParams,
      ],
    });
  }

  get isPDFMode(): boolean {
    return this._pdfMode;
  }

  get isLoading(): boolean {
    return this._loading;
  }

  get currentFeature(): DataDomainConfig {
    return this._currentFeature;
  }

  get currentCampaignData(): any {
    return this._currentCampaignData;
  }

  get campaignSurveyResponse(): any {
    return this._campaignSurveyResponse;
  }

  get globalHoldingOrg(): HoldingOrg {
    return this._globalHoldingOrg;
  }

  get roundedPdfGenerateProgress(): number {
    return Math.round(this.pdfGenerateProgress);
  }

  get commAiServiceHandle(): CommunicationAIService {
    return this._commAIService;
  }

  ngOnInit(): void {
    if (!this._currentFeature) {
      this._snackbarService.showError(
        'Invalid URI to view Survey Response results! Please contact the administrator.'
      );
      this.onCancel();
      return;
    }

    if (!this._id) {
      this._snackbarService.showError(
        'Invalid parameters to view Survey Response results! Please contact the administrator.'
      );
      this.onCancel();
      return;
    }

    if (
      !this._queryParams?.mode ||
      ![
        CampaignSurveyResponseMode.campaign,
        CampaignSurveyResponseMode.messageEvent,
      ].some((mode) => mode === this._queryParams?.mode)
    ) {
      this._snackbarService.showError(
        'Invalid mode requested to view Survey Response results! Please contact the administrator.'
      );
      this.onCancel();
      return;
    }

    this._setLoading(true);

    this._globalHoldingOrgListenerSub$ = this._dashboardService
      .getCurrentHoldingOrgListenerObs()
      .subscribe((orgData: HoldingOrg) => (this._globalHoldingOrg = orgData));

    /** Get campaign survey response */
    this._loadingService
      .showProgressBarUntilCompleted(
        this._getCampaignSurveyResponse().pipe(
          tap(async (campaignSurveyResponse: CampaignSurveyResponse) => {
            await this._processCampaignSurveyResponse(campaignSurveyResponse);
          })
        ),
        'query'
      )
      .subscribe(
        () => {
          this._setLoading(false);

          const length =
            this._campaignSurveyResponse?.responses &&
            Array.isArray(this._campaignSurveyResponse?.responses)
              ? this._campaignSurveyResponse?.responses?.length
              : 0;

          const responseArray = Array.from({ length }, (x, i) => ++i);

          this.pdfHtmlPages = [0, ...responseArray];
          this.totalPdfHtmlPageCount = this.pdfHtmlPages.length;
        },
        (error) => {
          consoleLog({ valuesArr: [{ error }] });
          this.serverError = true;
          // if (error?.message) {
          //   this._snackbarService.showError(error?.message);
          // }

          this._setLoading(false);
        }
      );
  }

  ngOnDestroy(): void {
    this._globalHoldingOrgListenerSub$?.unsubscribe();
  }

  /** 05032021 - Gaurav - JIRA-CA-154 - Modified to use new API */
  private _getCampaignSurveyResponse(): Observable<CampaignSurveyResponse> {
    const payload: PayloadCampaignSurveyResponse =
      this._queryParams.mode === CampaignSurveyResponseMode.campaign
        ? <PayloadCampaignSurveyResponse>{
            campaignId: this._id,
            startDate: this._queryParams.startDate, //'YYYY-MM'DD'
            endDate: this._queryParams.endDate,
          }
        : <PayloadCampaignSurveyResponse>{
            messageEventId: this._id,
          };

    return this._commAIService.getCampaignSurveyResponse(
      this._currentFeature,
      payload
    );
  }

  private async _processCampaignSurveyResponse(
    campaignSurveyResponse: CampaignSurveyResponse
  ): Promise<void> {
    consoleLog({
      valuesArr: [{ campaignSurveyResponse }],
    });

    this._campaignSurveyResponse = campaignSurveyResponse;
    await this._processCampaignSurveySubmissionStatus();
    await this._processCampaignSurveyResponses();

    consoleLog({
      valuesArr: [
        'curated campaignSurveyResponse',
        this._processSurveyResponse,
      ],
    });
  }
  /** ************************************************************** */
  /** ********** Survey Submission Status related methods ********** */
  /** ************************************************************** */
  get processSurveySubmissionStatus(): ProcessSurveySubmissionStatus {
    return this._processSurveySubmissionStatus;
  }

  private _processCampaignSurveySubmissionStatus(): void {
    this._processSurveySubmissionStatus = new ProcessSurveySubmissionStatus([
      ...this._campaignSurveyResponse.submissionStatus,
    ]);
  }
  /** ********** Survey Submission Status related methods - ENDS ********** */

  /** ********************************************************************************************* */
  /** ****************************** Survey Response related methods ****************************** */
  /** ********************************************************************************************* */

  get processedSurveyResponse(): ProcessSurveyResponse[] {
    return this._processSurveyResponse;
  }

  private _processCampaignSurveyResponses(): void {
    if (
      this._campaignSurveyResponse?.responses &&
      this._campaignSurveyResponse?.surveyVersion
    ) {
      let partPayload: PayloadCampaignSurveyTextResponse | undefined;

      if (this._queryParams?.mode === CampaignSurveyResponseMode.campaign) {
        partPayload = {
          campaignId: this._id,
          startDate: this._queryParams.startDate, //'YYYY-MM'DD'
          endDate: this._queryParams.endDate,
        };
      } else if (
        this._queryParams?.mode === CampaignSurveyResponseMode.messageEvent
      ) {
        partPayload = {
          messageEventId: this._id,
        };
      }

      /** Sort the responses received per the question sequence in surveyVersion */
      this._campaignSurveyResponse.responses = ProcessSurveyResponse.sortResponsesPerSurveyQuestions(
        {
          ...this._campaignSurveyResponse?.surveyVersion,
        },
        [...this._campaignSurveyResponse?.responses]
      );

      /** Construct table data and chart options for responses */
      for (
        let i = 0;
        i < this._campaignSurveyResponse?.responses?.length;
        i++
      ) {
        /** 26022021 - Gaurav - Added check to only create classes for valid response object */
        if (
          this._campaignSurveyResponse?.responses[i]?.response &&
          Array.isArray(this._campaignSurveyResponse?.responses[i]?.response) &&
          this._campaignSurveyResponse?.responses[i]?.response?.length > 0
        ) {
          switch (this._campaignSurveyResponse?.responses[i]?.questionType) {
            case QuestionTypes.singleChoiceRadioBox:
            case QuestionTypes.ratingStar:
            case QuestionTypes.ratingEmoji:
            case QuestionTypes.singleChoiceRadioH:
            case QuestionTypes.matrixRadio:
            case QuestionTypes.dropDownSelection:
            case QuestionTypes.matrixCheck:
            case QuestionTypes.multiChoiceCheckH:
              this._processSurveyResponse.push(
                new ProcessSurveyResponseBaseTypes(
                  {
                    ...this._campaignSurveyResponse?.responses[i],
                  },
                  partPayload
                )
              );

              break;

            case QuestionTypes.likertCheck:
            case QuestionTypes.likertRadio:
              this._processSurveyResponse.push(
                new ProcessSurveyResponseLikertTypes(
                  {
                    ...this._campaignSurveyResponse?.responses[i],
                  },
                  partPayload
                )
              );

              break;

            case QuestionTypes.singleTextInput:
            case QuestionTypes.singleTextArea:
              this._processSurveyResponse.push(
                new ProcessSurveyResponseTextTypes(
                  {
                    ...this._campaignSurveyResponse?.responses[i],
                  },
                  partPayload
                )
              );

              break;
          }
        }
      }
    }
  }
  /** ********** Survey Response related methods - ENDS ********** */

  /** ************************* */
  /** General component methods */
  /** ************************* */
  getTitle(): string {
    return `View Consolidated ${
      this._currentFeature === DataDomainConfig.nps ? 'NPS' : 'Response AI'
    } Campaign Survey Responses`;
  }

  getSubTitle(): string {
    return (
      generateNameAndCodeString(
        this._queryParams?.code,
        this._queryParams?.name
      ) ?? '&nbsp;'
    );
  }

  onProcessToPDF(scrollToTop: boolean = false) {
    this._pdfMode = true;

    // if (scrollToTop) {
    //   window.scroll({
    //     top: 0,
    //     left: 0,
    //     behavior: 'smooth',
    //   });
    // }
  }

  async onGeneratePDF(): Promise<void> {
    this.pdfGenerateProgress = 0;
    this.showAllPdfHtmlPages = true;

    this.pdfGenerateStatus = 'Initiating PDF Engine...';
    const pdf = new jsPDF('p', 'mm', 'a4');
    // if (this._globalHoldingOrg?.logoUrl) {
    //   pdf.addImage(this._globalHoldingOrg?.logoUrl, 'PNG', 20, 10, 50, 50);
    // }

    this.pdfGenerateStatus = 'Generating Page 1...';
    /** Construct and add first page of PDF */
    pdf.setFontSize(22);
    pdf.setTextColor(100);
    pdf.text(
      `${
        this._currentFeature === DataDomainConfig.nps ? 'NPS' : 'Response AI'
      }`,
      20,
      90
    );
    pdf.text(`Consolidated Campaign Survey Responses`, 20, 100);
    pdf.setFontSize(16);
    pdf.setTextColor(150);
    pdf.text(`Campaign: ${this.getSubTitle()}`, 20, 110);
    pdf.setTextColor(150);
    pdf.text(
      `Survey: ${this.campaignSurveyResponse?.surveyVersion?.name} (${this.campaignSurveyResponse?.surveyVersion?.code})`,
      20,
      120
    );

    const dateStamp = `${String(
      this.datePipe.transform(Date.now(), 'medium')
    )} ${String(this.datePipe.transform(Date.now(), 'zzzz'))}`;
    pdf.setFontSize(12);
    pdf.setTextColor(150);
    pdf.text(dateStamp, 20, 130);

    const arrayLength = this.pdfContent.toArray().length + 1;
    const divValue = 100 / arrayLength;
    this.pdfGenerateProgress = divValue;
    this.pdfGenerateStatus = `Generated Page 1 of ${arrayLength}`;
    const pageSeqTillNow = 2;

    /** Construct and add subsequent pages of PDF */
    for (let [index, el] of this.pdfContent.toArray().entries()) {
      this.pdfGenerateStatus = `Generating Page ${
        pageSeqTillNow + index
      } of ${arrayLength}...`;

      const parentId = el.nativeElement.id;

      await this._addImageToPdf(pdf, el);
      this.pdfGenerateProgress += divValue;

      this.pdfGenerateStatus = `Generated Page ${
        pageSeqTillNow + index
      } of ${arrayLength}`;

      /** TODO: Add likert table as a separte page in the report
      if (this.pdfHtmlPageLikertTable) {
        for (let likertTable of this.pdfContent.toArray()) {
          const id = likertTable.nativeElement.id;
          if (id === parentId) {
            await this._addImageToPdf(pdf, likertTable);
          }
        }
      }
       */
    }

    this.pdfGenerateStatus = `Downloading PDF...`;

    /** Save as PDF */
    setTimeout(() => {
      const yyyyMmDdHhMmSsA = this.datePipe.transform(
        Date.now(),
        'YYYYMMdd  hhmmss a'
      );
      const surveyName =
        this.campaignSurveyResponse?.surveyVersion?.name ?? 'name undefined';
      const surveyCode =
        this.campaignSurveyResponse?.surveyVersion?.code ?? 'code undefined';

      const pdfName = `${surveyName} ${surveyCode} ${yyyyMmDdHhMmSsA}`
        .toLowerCase()
        .replace(/\s/g, '_');

      /** Save by survey_YYYYMMDD_HHMM name */
      pdf.save(`${pdfName}.pdf`, {
        returnPromise: true,
      });

      this.pdfGenerateStatus = `Download complete.`;

      this.pdfGenerateProgress = 100;
      this.pdfGenerateStatus = '';
      this.showAllPdfHtmlPages = false;
    }, 2000);
  }

  private async _addImageToPdf(
    pdf: any,
    el: ElementRef<any>
  ): Promise<boolean> {
    return new Promise(async (resolve) => {
      let fileWidth: number = 208;

      await pdf.addPage('a4', 'p');

      const pdfContent = await el.nativeElement;
      const canvas = await html2canvas(pdfContent);
      let fileHeight = (canvas.height * fileWidth) / canvas.width;
      const FILEURI = await canvas.toDataURL('image/png');
      /** 04032021 - Gaurav - JIRA-CA-199: reduce survey report PDF size by compressing the image  */
      await pdf.addImage(
        FILEURI,
        'PNG',
        1,
        1,
        fileWidth,
        fileHeight,
        '',
        'MEDIUM'
      );

      return resolve(true);
    });
  }

  onBackToResults(): void {
    this._pdfMode = false;
  }

  onCancel(): void {
    this._router.navigate(['../../'], { relativeTo: this._route });
  }

  onSetPdfHtmlStep(index: number) {
    this.pdfHTMLStep = index;
  }

  onNextPdfHtmlStep() {
    this.pdfHTMLStep < this.totalPdfHtmlPageCount && this.pdfHTMLStep++;
  }

  onPrevPdfHtmlStep() {
    this.pdfHTMLStep >= 0 && this.pdfHTMLStep--;
  }

  isLikertQuestionType(questionType: QuestionTypes): boolean {
    if (
      questionType === QuestionTypes.likertRadio ||
      questionType === QuestionTypes.likertCheck
    ) {
      return true;
    }

    return false;
  }

  private _setLoading(value: boolean): void {
    this._loading = value;
    if (!value) this._loadingService.loadingOff();
  }
}
