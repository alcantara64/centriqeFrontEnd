/** 26032021 - Gaurav - JIRA-CA-310: Componentize setup-list action buttons */

import { Component } from '@angular/core';
import { BaseButtonComponent } from '../base-button/base-button.component';

@Component({
  selector: 'app-copy-fab-button',
  templateUrl: './copy-button-fab.component.html',
})
export class CopyFabButtonComponent extends BaseButtonComponent {
  constructor() {
    super();
    if (!this.matTooltipText) this.matTooltipText = 'Copy';
  }
}
