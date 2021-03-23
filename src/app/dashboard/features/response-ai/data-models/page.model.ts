/** 16122020 - Gaurav - Page (of sections) Interface and Class.
 * Important Note: The interface and enums MUST match those on the ng-survey server
 * Survey Data Model: survey => pages* (we're here) => sections => questions
 * 23122020 - Gaurav - Fixed issues related to duplicating and moving sections
 * 01012021 - Gaurav - Added mandatory field responseIdentifierText
 * 08012021 - Gaurav - Fixed a bug related to new duplicated response type referring to copied object memory allocation
 * 22012021 - Gaurav - Added subQuestionText field */
import { consoleLog, ConsoleTypes } from 'src/app/shared/util/common.util';
import { Question } from './question.model';
import { Section, SurveySection } from './section.model';

export interface SurveyPage {
  pageNumber: number;
  pageHeading: string;
  pageSections: Section[];
}

export class Page implements SurveyPage {
  constructor(
    public pageNumber: number,
    public pageHeading: string,
    public pageSections: Section[]
  ) {}

  onAddSection(): void {
    const sectionNumber = this.pageSections.length + 1;
    this.pageSections.push(
      new Section(
        sectionNumber,
        `Section Title ${sectionNumber}`,
        <Question[]>[]
      )
    );

    consoleLog({
      valuesArr: ['onAddSection pageSections', this.pageSections],
    });
  }

  onAddSavedSection(sectionData: any): void {
    const sectionNumber = this.pageSections.length + 1;

    this.pageSections.push(
      new Section(
        sectionNumber,
        sectionData.sectionHeading,
        sectionData.sectionQuestions.map((questionData: any, i: number) => {
          /** Pass a copy to avoid reference to copied object's memory location */
          let copyOfQuestionTypeStructure = {
            ...questionData.questionTypeStructure,
          };

          if (questionData?.questionTypeStructure?.additionalText) {
            copyOfQuestionTypeStructure = {
              ...copyOfQuestionTypeStructure,
              additionalText: {
                ...questionData.questionTypeStructure.additionalText,
              },
            };
          }

          return new Question(
            i + 1,
            questionData.questionText,
            questionData.questionType,
            Section.regenerateNameAndIDValues(
              questionData.questionType,
              copyOfQuestionTypeStructure
            ),
            questionData.required,
            questionData.responseIdentifierText,
            questionData.questionNumberOrderToDisplay,
            questionData.subQuestionText
          );
        })
      )
    );

    consoleLog({
      valuesArr: ['onAddSavedSection pageSections', this.pageSections],
    });
  }

  onDuplicateSection(currentSectionIndex: number): void {
    this.pageSections.splice(
      currentSectionIndex + 1,
      0,
      new Section(
        this.pageSections[currentSectionIndex].sectionNumber,
        this.pageSections[currentSectionIndex].sectionHeading,
        this.pageSections[currentSectionIndex].sectionQuestions.map(
          (questionData: any, i: number) => {
            /** Pass a copy to avoid reference to copied object's memory location */
            let copyOfQuestionTypeStructure = {
              ...questionData.questionTypeStructure,
            };

            if (questionData?.questionTypeStructure?.additionalText) {
              copyOfQuestionTypeStructure = {
                ...copyOfQuestionTypeStructure,
                additionalText: {
                  ...questionData.questionTypeStructure.additionalText,
                },
              };
            }

            return new Question(
              questionData.questionNumber,
              questionData.questionText,
              questionData.questionType,
              Section.regenerateNameAndIDValues(
                questionData.questionType,
                copyOfQuestionTypeStructure
              ),
              questionData.required,
              questionData.responseIdentifierText,
              questionData.questionNumberOrderToDisplay,
              questionData.subQuestionText
            );
          }
        )
      )
    );

    this._reorderSectionNumberValue();
  }

  onDeleteSection(currentSectionIndex: number): void {
    this.pageSections.splice(currentSectionIndex, 1);
    this._reorderSectionNumberValue();

    consoleLog({
      consoleType: ConsoleTypes.warn,
      valuesArr: ['onDeleteSection pageSections', this.pageSections],
    });
  }

  onSectionMoveDown(indexDown: number): void {
    const sectionToMoveDownData: Section = this.pageSections[indexDown];
    this.pageSections[indexDown] = this.pageSections[indexDown + 1];
    this.pageSections[indexDown + 1] = sectionToMoveDownData;
    this._reorderSectionNumberValue();
  }

  onSectionMoveUp(indexUp: number): void {
    const sectionToMoveUpData: Section = this.pageSections[indexUp];
    this.pageSections[indexUp] = this.pageSections[indexUp - 1];
    this.pageSections[indexUp - 1] = sectionToMoveUpData;
    this._reorderSectionNumberValue();
  }

  private _reorderSectionNumberValue(): void {
    this.pageSections = this.pageSections.map(
      (section: Section, i: number) =>
        new Section(i + 1, section.sectionHeading, [
          ...section.sectionQuestions,
        ])
    );
  }
}
