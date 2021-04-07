/** 10022021 - Gaurav - Created an interface based on the expected input values for echarts
 * 25022021 - Gaurav - JIRA-CA-152: Added totalTextHits, totalTextHitsPercent & totalTextHitsDisplayPercent
 * 02032021 - Gaurav - JIRA-CA-195: totalHitsByResponseId
 */

import { PayloadCampaignSurveyTextResponse } from 'src/app/dashboard/features/communication-ai/communication-ai.service';
import { QuestionTypes } from 'src/app/dashboard/features/response-ai/data-models/question.model';
import {
  ConsolidatedQuestionResponse,
  SurveySubmissionStatus,
} from 'src/app/dashboard/features/response-ai/data-models/survey.model';

export enum ChartType {
  bar = 'bar',
  line = 'line',
  pie = 'pie',
  scatter = 'scatter',
  candlestick = 'candlestick',
  heatmap = 'heatmap',
  tree = 'tree',
  sunburst = 'sunburst',
  gauge = 'gauge',
  pictorialBar = 'pictorialBar',
}

export enum ChartIcon {
  pie_chart = 'pie_chart',
  bar_chart = 'bar_chart',
  stacked_line_chart = 'stacked_line_chart',
  stacked_bar_chart = 'stacked_bar_chart',
  line_chart = 'show_chart',
  scatter_plot = 'scatter_plot',
}

export enum ToolboxPosition {
  default_toolbox_top_right = 'default_toolbox_top_right',
  toolbox_top_right_center = 'toolbox_top_right_center',
}

export interface ChartQuestionText {
  questionId: string;
  questionText?: string;
  subQuestionText?: string;
}

export interface DisplayResponseData extends ChartQuestionText {
  questionType: QuestionTypes;
  questionTypeStructure?: any;
  totalHits: number;
  totalHitsByResponseId?: number;
  totalTextHits?: number;
  totalTextHitsPercent?: number;
  totalTextHitsDisplayPercent?: string;
  responseCharts?: ChartData[];
  tableDataSource?: ConsolidatedQuestionResponse[];
  tableDisplayColumns?: string[];
  textResponsePayload?: PayloadCampaignSurveyTextResponse | null;
  textResponses?: any;
}

export interface SubmissionStatusDataSource {
  status: string;
  submissionStatus: SurveySubmissionStatus;
  value: number;
  percent: string;
}

export interface ChartData {
  chartType: ChartType;
  chartIcon: ChartIcon;
  chartOptions: ChartOptions;
}

export interface ChartOptions {
  backgroundColor?: string;
  title?: ChartTitle;
  tooltip?: any;
  dataset?: any;
  legend?: ChartLegend;
  toolbox?: ChartToolbox;
  xAxis?: any;
  yAxis?: any;
  dataZoom?: any;
  visualMap?: any;
  series?: any;
}

interface ChartTitle {
  text?: string;
  subtext?: string;
}

interface ChartTooltip {}

interface ChartLegend {
  orient?: string;
  left?: number;
  bottom?: number;
  data?: string[];
  padding?: any;
}

export interface ChartToolbox {
  show?: boolean;
  orient?: string;
  left?: string;
  top?: string;
  feature?: any;
}

interface ChartXAxis {
  type?: string;
  data?: any[];
  axisLabel?: any;
  axisTick?: any;
  axisLine?: any;
  z?: number;
}

interface ChartYAxis {
  type?: string;
  axisLine?: any;
  axisTick?: any;
  axisLabel?: any;
}

interface ChartVisualMap {
  show?: boolean;
  min?: number;
  max?: number;
  inRange?: ChartVisualMapRange;
}

interface ChartVisualMapRange {
  colorLightness: number[];
}

interface ChartSeries {
  name?: string;
  type: ChartType;
  stack?: string;
  radius?: any;
  avoidLabelOverlap?: boolean;
  center?: string[];
  barGap?: any;
  barCategoryGap?: any;
  data: any[];
  roseType?: string;
  label?: ChartSeriesLabel;
  emphasis?: any;
  labelLine?: ChartSeriesLabelLine;
  itemStyle?: any;
  animation?: boolean;
  animationType?: string;
  animationEasing?: string;
  animationDelay?: any;
  symbolSize?: number;
  seriesLayoutBy?: any;
  xAxisIndex?: number;
  yAxisIndex?: number;
}

interface ChartSeriesLabel {
  color?: string;
  show?: boolean;
  position?: string;
  fontSize?: string;
  fontWeight?: string;
}

interface ChartEmphasis {
  label?: ChartSeriesLabel;
}

interface ChartSeriesLabelLine {
  lineStyle?: ChartSeriesLabelLineStyle;
  smooth?: number;
  length?: number;
  length2?: number;
  show?: boolean;
}

interface ChartSeriesLabelLineStyle {
  color: string;
}

interface ChartSeriesItemStyle {
  color?: string;
  shadowBlur?: number;
  shadowColor?: string;
}
