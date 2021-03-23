/** 23022021 - Gaurav - Moved survey submission status processing from component to this class */
import {
  ChartData,
  ChartIcon,
  ChartType,
  SubmissionStatusDataSource,
  ToolboxPosition,
} from 'src/app/dashboard/shared/components/echarts/echarts.model';
import {
  ChartParameters,
  EchartsService,
} from 'src/app/dashboard/shared/components/echarts/echarts.service';
import { consoleLog } from 'src/app/shared/util/common.util';
import {
  SubmissionStatus,
  SurveySubmissionStatus,
  SurveySubmissionStatusData,
} from '../../../response-ai/data-models/survey.model';

export class ProcessSurveySubmissionStatus {
  private _submissionStatus!: SurveySubmissionStatusData[];
  private _totalSurveys: number = 0;
  private _submissionStatusTableDisplayColumns!: string[];
  private _submissionStatusTableDataSource!: SubmissionStatusDataSource[];
  private _echartsServiceInstance = EchartsService.instance;
  private _submissionStatusChartsData: ChartData[] = <ChartData[]>[];

  constructor(submissionStatus: SurveySubmissionStatusData[]) {
    this._submissionStatus = submissionStatus;
    this._initSubmissionStatusData();
    this._generateSubmissionStatusDisplayTableSource();
    this._generateSubmissionStatusChartOptions();
  }

  get curatedSubmissionStatusData(): SurveySubmissionStatusData[] {
    return [...this._submissionStatus];
  }

  get totalSurveys(): number {
    return this._totalSurveys;
  }

  get submissionStatusTableDisplayColumns(): string[] {
    return [...this._submissionStatusTableDisplayColumns];
  }

  get submissionStatusTableDataSource(): SubmissionStatusDataSource[] {
    return [...this._submissionStatusTableDataSource];
  }

  get submissionStatusChartsData(): ChartData[] {
    return [...this._submissionStatusChartsData];
  }

  private _initSubmissionStatusData(): void {
    const surveySubmissionStatusValues = Object.values(SurveySubmissionStatus);
    const campaignSurveySubmissionStatus: SurveySubmissionStatus[] =
      this._submissionStatus.map(
        (status: SubmissionStatus) => status.submissionStatus
      ) ?? <any[]>[];
    const missingCampaignSurveySubmissionStatus = surveySubmissionStatusValues.filter(
      (status: SurveySubmissionStatus) =>
        !campaignSurveySubmissionStatus.includes(<SurveySubmissionStatus>status)
    );

    /** Add empty hits in submissionStatus */
    if (missingCampaignSurveySubmissionStatus.length > 0) {
      this._submissionStatus = [
        ...this._submissionStatus,
        ...missingCampaignSurveySubmissionStatus.map(
          (status: SurveySubmissionStatus) => {
            return {
              submissionStatus: status,
              hits: 0,
            };
          }
        ),
      ];
    }

    this._totalSurveys = this._submissionStatus.reduce(
      (total: number, el: any) => total + el.hits,
      0
    );

    /** Calculate percent for each status */
    this._submissionStatus = this._submissionStatus.map((el: any) => {
      const percent =
        this._totalSurveys > 0 ? (el.hits / this._totalSurveys) * 100 : 0;

      return {
        ...el,
        displayPercent: percent === 0 ? '0%' : `${percent.toFixed(2)}%`,
        percent,
      };
    });

    /** Set display status value for each status */
    this._submissionStatus = this._submissionStatus.map((el: any) => {
      let displayStatus;

      switch (el.submissionStatus) {
        case SurveySubmissionStatus.pending:
          displayStatus = 'Pending';
          break;
        case SurveySubmissionStatus.inProgress:
          displayStatus = 'In Progress';
          break;
        case SurveySubmissionStatus.submitted:
          displayStatus = 'Submitted';
          break;
        case SurveySubmissionStatus.expired:
          displayStatus = 'Expired';
          break;
        default:
          displayStatus = 'INVALID!';
      }

      return {
        ...el,
        displayStatus,
      };
    });

    /** Sort submission status */
    let sortedArray = <SubmissionStatus[]>[];

    [
      SurveySubmissionStatus.pending,
      SurveySubmissionStatus.inProgress,
      SurveySubmissionStatus.submitted,
      SurveySubmissionStatus.expired,
    ].forEach((value: SurveySubmissionStatus) => {
      const record: SurveySubmissionStatusData = this._submissionStatus.find(
        (r: SubmissionStatus) => r.submissionStatus === value
      )!;
      sortedArray.push(record);
    });

    this._submissionStatus = [...sortedArray];
  }

  /** Construct Submission status display table */
  private _generateSubmissionStatusDisplayTableSource(): void {
    this._submissionStatusTableDisplayColumns = ['status', 'percent', 'value'];

    this._submissionStatusTableDataSource = <SubmissionStatusDataSource[]>(
      this._submissionStatus.map((el: SubmissionStatus) => {
        return {
          status: el.displayStatus,
          submissionStatus: el.submissionStatus,
          value: el.hits,
          percent: el.displayPercent,
        };
      })
    );
  }

  /** Construct desired chart options for Survey Submission statuses */
  private _generateSubmissionStatusChartOptions(): void {
    const xAxisData = this._submissionStatus?.map(
      (status: SubmissionStatus) => status.displayStatus
    );
    const seriesName = 'Submission Status';
    const seriesData = this._submissionStatus?.map(
      (status: SubmissionStatus) => status.hits
    );
    const pieData = this._submissionStatus?.map((status: SubmissionStatus) => {
      return {
        value: status.hits,
        name: `${status.displayStatus} (${status.displayPercent})`,
      };
    });

    /** Construct desired chart options for Survey Submission statuses */
    this._submissionStatusChartsData.push(
      this._echartsServiceInstance.getStatusChart(<ChartParameters>{
        chartType: ChartType.pie,
        chartIcon: ChartIcon.pie_chart,
        seriesName,
        seriesData: pieData,
        toolboxPosition: ToolboxPosition.toolbox_top_right_center,
      })
    );

    this._submissionStatusChartsData.push(
      this._echartsServiceInstance.getStatusChart(<ChartParameters>{
        chartType: ChartType.bar,
        chartIcon: ChartIcon.bar_chart,
        xAxisData,
        seriesName,
        seriesData,
        toolboxPosition: ToolboxPosition.toolbox_top_right_center,
      })
    );
  }
}
