/** 26022021 - Gaurav - JIRA-CA-187: move huge html to reusable components for this module */
import { Component, Input, OnInit } from '@angular/core';
import { QuestionTypes } from 'src/app/dashboard/features/response-ai/data-models/question.model';

@Component({
  selector: 'app-survey-response-stats-by-question',
  templateUrl: './stats-question.component.html',
  styleUrls: ['./stats-question.component.css'],
})
export class StatsQuestionComponent implements OnInit {
  @Input() data!: any;
  @Input() pdfMode?: boolean = false;
  readonly questionTypes = QuestionTypes;
  step = 0;

  constructor() {}

  ngOnInit(): void {}

  /** Accordion related methods for Likerts question response display */
  setStep(index: number) {
    this.step = index;
  }

  nextStep() {
    this.step++;
  }

  prevStep() {
    this.step--;
  }
}
