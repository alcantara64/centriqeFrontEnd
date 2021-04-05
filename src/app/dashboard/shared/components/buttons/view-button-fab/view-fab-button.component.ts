/** 26032021 - Gaurav - JIRA-CA-310: Componentize setup-list action buttons */
import { Component } from '@angular/core';
import { BaseButtonComponent } from '../base-button/base-button.component';

@Component({
  selector: 'app-view-fab-button',
  templateUrl: './view-fab-button.component.html',
})
export class ViewFabButtonComponent extends BaseButtonComponent {
  constructor() {
    super();
    if (!this.matTooltipText) this.matTooltipText = 'View';
  }
}
