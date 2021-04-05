/** 01042021 - Gaurav - JIRA-CA-310: Componentize setup-list action buttons */
import { Component } from '@angular/core';
import { BaseButtonComponent } from '../base-button/base-button.component';

@Component({
  selector: 'app-reset-fab-button',
  templateUrl: './reset-button-fab.component.html',
})
export class ResetButtonFabComponent extends BaseButtonComponent {
  constructor() {
    super();
    if (!this.matTooltipText) this.matTooltipText = 'Reset';
  }
}
