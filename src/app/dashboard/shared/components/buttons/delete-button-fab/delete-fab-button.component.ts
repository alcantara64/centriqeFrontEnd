/** 26032021 - Gaurav - JIRA-CA-310: Componentize setup-list action buttons */

import { Component } from '@angular/core';
import { BaseButtonComponent } from '../base-button/base-button.component';

@Component({
  selector: 'app-delete-fab-button',
  templateUrl: './delete-fab-button.component.html',
})
export class DeleteFabButtonComponent extends BaseButtonComponent {
  constructor() {
    super();
    if (!this.matTooltipText) this.matTooltipText = 'Delete';
  }
}
