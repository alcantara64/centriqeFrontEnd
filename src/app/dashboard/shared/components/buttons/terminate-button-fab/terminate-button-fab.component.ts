/** 01042021 - Gaurav - JIRA-CA-310: Componentize setup-list action buttons */
import { Component } from '@angular/core';
import { BaseButtonComponent } from '../base-button/base-button.component';

@Component({
  selector: 'app-terminate-fab-button',
  templateUrl: './terminate-button-fab.component.html',
})
export class TerminateButtonFabComponent extends BaseButtonComponent {
  constructor() {
    super();
    if (!this.matTooltipText) this.matTooltipText = 'Terminate';
  }
}
