/** 10022021 - Gaurav: Init version
 * 03032021 - Gaurav - JIRA-CA-196: Show Likert tables in generated response PDF. Added reduceHeight to adjust large tables on single PDF page
 */
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { consoleLog } from 'src/app/shared/util/common.util';
import { ChartOptions } from './echarts.model';

@Component({
  selector: 'app-echarts',
  templateUrl: './echarts.component.html',
  styleUrls: ['./echarts.component.css'],
})
export class EchartsComponent implements OnInit {
  @ViewChild('echart') echart!: ElementRef<HTMLDivElement>;
  @Input() chartData!: ChartOptions;
  @Input() chartForType!: any;
  @Input() reduceHeight?: string;

  chartOption!: ChartOptions;
  echartsInstance!: any;
  constructor() {}

  ngOnInit(): void {
    // consoleLog({ valuesArr: ['this.chartData', this.chartData] });
    this.chartOption = { ...this.chartData };
    // this.echartsInstance = ec.getInstanceByDom(this.echart?.nativeElement);
  }
}
