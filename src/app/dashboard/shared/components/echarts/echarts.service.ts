/** 15022021 - Gaurav - Init version: Should act more as a class for chart generation methods
 * 23022021 - Gaurav - Created a static instance */
import { Injectable } from '@angular/core';
import * as echarts from 'echarts';
import { QuestionTypes } from 'src/app/dashboard/features/response-ai/data-models/question.model';
import {
  ChartData,
  ChartIcon,
  ChartOptions,
  ChartToolbox,
  ChartType,
  ToolboxPosition,
} from './echarts.model';

export interface ChartParameters {
  chartType?: ChartType;
  chartIcon?: ChartIcon;
  legendData?: any;
  xAxisData?: any;
  yAxisData?: any;
  visualMapData?: any;
  seriesName?: string;
  seriesData?: any;
  questionType?: QuestionTypes;
  datasetSource?: any;
  series?: any[];
  toolboxPosition: ToolboxPosition;
}

@Injectable()
export class EchartsService {
  /** 23022021 - Gaurav - Created a static instance to use this service inside a class object */
  static instance: EchartsService;
  constructor() {
    EchartsService.instance = this;
  }

  /** Submission Status Chart */
  getStatusChart(cP: ChartParameters): ChartData {
    /** Common for simple line and bar chart */
    let series = <any[]>[
      {
        name: cP.seriesName,
        type: cP.chartType,
        data: cP.seriesData,
      },
    ];

    let chartOptions: ChartOptions = <ChartOptions>{
      toolbox: this._getToolboxData(cP.toolboxPosition),
    };

    /** Pie chart */
    if (cP.chartType === ChartType.pie) {
      series = <any[]>[
        {
          name: cP.seriesName,
          type: ChartType.pie,
          data: cP.seriesData,
          radius: '65%',
          center: ['50%', '50%'],
          selectedMode: 'single',
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ];

      chartOptions = <ChartOptions>{
        ...chartOptions,
        legend: {
          orient: 'vertical',
          left: 0,
          data: cP.legendData,
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)',
        },
        series,
      };
    } else {
      /** Common for simple line and bar chart */
      chartOptions = <ChartOptions>{
        ...chartOptions,
        xAxis: {
          type: 'category',
          data: cP.xAxisData,
        },
        yAxis: {
          type: 'value',
        },
        series,
      };
    }

    return <ChartData>{
      chartType: cP.chartType,
      chartIcon: cP.chartIcon,
      chartOptions,
    };
  }

  getCategoryOneBarChart(cP: ChartParameters): ChartData {
    return <ChartData>{
      chartType: ChartType.bar,
      chartIcon: ChartIcon.bar_chart,
      chartOptions: <ChartOptions>{
        toolbox: this._getToolboxData(cP.toolboxPosition),
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
        },
        xAxis: {
          type: 'category',
          data: cP.xAxisData,
          axisLabel: {
            fontSize: cP.questionType === QuestionTypes.ratingEmoji ? 18 : 10,
          },
        },
        yAxis: {
          type: 'value',
        },
        series: [
          {
            name: cP.seriesName,
            type: ChartType.bar,
            data: cP.seriesData,
          },
        ],
      },
    };
  }

  getCategoryOnePieChart(cP: ChartParameters): ChartData {
    let series = <any[]>[
      {
        name: cP.seriesName,
        type: ChartType.pie,
        data: cP.seriesData,
        radius: '65%',
        center: ['50%', '50%'],
        selectedMode: 'single',
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ];

    return <ChartData>{
      chartType: ChartType.pie,
      chartIcon: ChartIcon.pie_chart,
      chartOptions: <ChartOptions>{
        toolbox: this._getToolboxData(cP.toolboxPosition),
        legend: {
          orient: 'vertical',
          left: 0,
          data: cP.legendData,
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)',
        },
        series,
      },
    };
  }

  getLikertDatasetBarChart(cP: ChartParameters): ChartData {
    return <ChartData>{
      chartType: ChartType.bar,
      chartIcon: ChartIcon.bar_chart,
      chartOptions: <ChartOptions>{
        toolbox: this._getToolboxData(cP.toolboxPosition),
        legend: {},
        tooltip: {
          trigger: 'axis',
        },
        dataset: {
          source: cP.datasetSource,
        },
        xAxis: { type: 'category' },
        yAxis: {},
        // Declare several bar series, each will be mapped
        // to a column of dataset.source by default.
        series: cP.series,
      },
    };
  }

  private _getToolboxData(toolboxPosition: ToolboxPosition): ChartToolbox {
    switch (toolboxPosition) {
      case ToolboxPosition.toolbox_top_right_center:
        return {
          show: true,
          orient: 'vertical',
          left: 'right',
          top: 'center',
          feature: {
            saveAsImage: { show: true },
          },
        };
    }

    return <ChartToolbox>{
      show: true,
      orient: 'vertical',
      feature: {
        saveAsImage: { show: true },
      },
    };
  }
}
