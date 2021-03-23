/** 26022021 - Gaurav - JIRA-CA-187: move huge html to reusable components for this module  */
import { Component, Input, OnInit } from '@angular/core';
import { QuestionTypes } from 'src/app/dashboard/features/response-ai/data-models/question.model';

@Component({
  selector: 'app-survey-response-stats-by-table',
  templateUrl: './stats-table.component.html',
  styleUrls: ['./stats-table.component.css'],
})
export class StatsTableComponent implements OnInit {
  @Input() surveyResponseTableFor!: string;
  @Input() data!: any;
  @Input() isLikertGroup!: any;
  @Input() materialStyle?: boolean = true;

  readonly questionTypes = QuestionTypes;

  constructor() {}

  ngOnInit(): void {}
}
