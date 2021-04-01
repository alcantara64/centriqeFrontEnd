/** 17122020 - Gaurav - Init version
 * 24122020 - Gaurav - added logic to disable 'add saved section' and move page buttons
 * 29122020 - Gaurav - added viewOnly
 * 04212021 - Gaurav - Added NPS related code, to reuse this object and get saved response-types feature wise ONLY
 * 22012021 - Gaurav - Get filtered savedSectionStructs and savedQuestionsStructs based on selected Org DrDw on Setup page, and static questionTypes
 * 25032021 - Gaurav - JIRA-CA-275: Tabbed page setup - Added new event emitter to inform tab change
 * 25032021 - Gaurav - JIRA-CA-276: Tabbed section setup  */
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DataDomainConfig } from 'src/app/dashboard/shared/components/menu/constants.routes';
import { Page } from '../../data-models/page.model';
import { Survey } from '../../data-models/survey.model';

@Component({
  selector: 'app-survey-page',
  templateUrl: './survey-page.component.html',
  styleUrls: ['./survey-page.component.css'],
})
export class SurveyPageComponent implements OnInit {
  @Input() currentPageIndex!: number;
  @Input() survey!: Survey;
  @Input() page!: Page;
  @Input() viewOnly = false;
  @Input() currentFeature!: DataDomainConfig;
  @Input() savedSectionStructs!: any[];
  @Input() savedQuestionsStructs!: any[];
  @Input() questionTypes!: any[];
  @Output() pageMoveEmitter = new EventEmitter<number>();

  constructor() {}

  ngOnInit(): void {}

  get isDisabledAddSavedSection(): boolean {
    return (
      this.viewOnly ||
      !this.savedSectionStructs ||
      this.savedSectionStructs?.length === 0
    );
  }

  get isDisabledMovePageUp(): boolean {
    return this.viewOnly || this.currentPageIndex === 0;
  }

  get isDisabledMovePageDown(): boolean {
    return (
      this.viewOnly ||
      this.currentPageIndex === this.survey.surveyPages.length - 1
    );
  }

  get totalQuestions(): number {
    const totalLength = this.page?.pageSections?.map(
      (section) => section?.sectionQuestions?.length ?? 0
    );

    /** 22012021 - Gaurav - Fixed TypeError: Reduce of empty array with no initial value */
    return totalLength?.length > 0
      ? totalLength.reduce((total, num) => total + num)
      : 0;
  }

  onEmitPageMoveDown(currentPageIndex: number): void {
    if (currentPageIndex < this.survey.surveyPages.length)
      this.pageMoveEmitter.emit(++currentPageIndex);
  }

  onEmitPageMoveUp(currentPageIndex: number): void {
    if (currentPageIndex > 0) this.pageMoveEmitter.emit(--currentPageIndex);
  }

  onEmitPageDuplicate(currentPageIndex: number): void {
    if (currentPageIndex < this.survey.surveyPages.length)
      this.pageMoveEmitter.emit(++currentPageIndex);
  }

  onEmitPageDelete(currentPageIndex: number): void {
    if (currentPageIndex > 0) this.pageMoveEmitter.emit(--currentPageIndex);
  }
}
