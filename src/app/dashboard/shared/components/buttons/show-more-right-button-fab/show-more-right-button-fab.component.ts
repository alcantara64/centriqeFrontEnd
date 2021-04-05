/** 01042021 - Gaurav - JIRA-CA-310: Componentize setup-list action buttons */
import { Component } from '@angular/core';
import { BaseButtonComponent } from '../base-button/base-button.component';

@Component({
  selector: 'app-show-more-right-fab-button',
  templateUrl: './show-more-right-button-fab.component.html',
})
export class ShowMoreRightButtonFabComponent extends BaseButtonComponent {
  constructor() {
    super();
    if (!this.matTooltipText) this.matTooltipText = 'Show More';
  }
}
