/** 17122020 - Gaurav - Init version
 * 24122020 - Gaurav - added logic to disable 'add saved question' and move section buttons
 * 29122020 - Gaurav - added viewOnly
 * 04212021 - Gaurav - Added NPS related code, to reuse this object and get saved response-types feature wise ONLY
 * 22012021 - Gaurav - Get filtered savedQuestionsStructs based on selected Org DrDw on Setup page, and static questionTypes
 */
import { Component, Input, OnInit } from '@angular/core';
import { DataDomainConfig } from 'src/app/dashboard/shared/components/menu/constants.routes';
import { Page } from '../../data-models/page.model';
import { Section } from '../../data-models/section.model';

@Component({
  selector: 'app-survey-section',
  templateUrl: './survey-section.component.html',
  styleUrls: ['./survey-section.component.css'],
})
export class SurveySectionComponent implements OnInit {
  @Input() page!: Page;
  @Input() section!: Section;
  @Input() currentSectionIndex!: number;
  @Input() viewOnly = false;
  @Input() currentFeature!: DataDomainConfig;
  @Input() savedQuestionsStructs!: any[];
  @Input() questionTypes!: any[];

  constructor() {}

  ngOnInit(): void {}

  get isDisabledAddSavedQuestion(): boolean {
    return (
      this.viewOnly ||
      !this.savedQuestionsStructs ||
      this.savedQuestionsStructs?.length === 0
    );
  }

  get isDisabledMoveSectionUp(): boolean {
    return this.viewOnly || this.currentSectionIndex === 0;
  }

  get isDisabledMoveSectionDown(): boolean {
    return (
      this.viewOnly ||
      this.currentSectionIndex === this.page.pageSections.length - 1
    );
  }
}
