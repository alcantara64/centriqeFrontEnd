/** 17122020 - Gaurav - Init version
 * 24122020 - Gaurav - added logic to disable move question buttons
 * 29122020 - Gaurav - added viewOnly
 * 04212021 - Gaurav - Added NPS related code, to reuse this object and get saved response-types feature wise ONLY
 */
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { DataDomainConfig } from 'src/app/dashboard/shared/components/menu/constants.routes';
import { consoleLog } from 'src/app/shared/util/common.util';
import { Question, QuestionTypes } from '../../data-models/question.model';
import { Section } from '../../data-models/section.model';
import { SurveyOrgData } from '../../data-models/survey.model';
import { ResponseAIService } from '../../response-ai.service';

@Component({
  selector: 'app-survey-question',
  templateUrl: './survey-question.component.html',
  styleUrls: ['./survey-question.component.css'],
})
export class SurveyQuestionComponent implements OnInit, OnDestroy {
  @Input() section!: Section;
  @Input() question!: Question;
  @Input() currentQuestionIndex!: number;
  @Input() viewOnly = false;
  @Input() currentFeature!: DataDomainConfig;

  questionTypesEnum = QuestionTypes;
  inputTypes!: any[];

  constructor(private _responseAIService: ResponseAIService) {}

  ngOnInit(): void {
    this.inputTypes = this._responseAIService.getInputTypes();
  }

  ngOnDestroy(): void {}

  get isDisabledMoveQuestionUp(): boolean {
    return this.viewOnly || this.currentQuestionIndex === 0;
  }

  get isDisabledMoveQuestionDown(): boolean {
    return (
      this.viewOnly ||
      this.currentQuestionIndex === this.section.sectionQuestions.length - 1
    );
  }
}
