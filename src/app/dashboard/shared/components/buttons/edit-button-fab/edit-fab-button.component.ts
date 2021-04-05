/** 26032021 - Gaurav - JIRA-CA-310: Componentize setup-list action buttons */
import { Component } from '@angular/core';
import { BaseButtonComponent } from '../base-button/base-button.component';

@Component({
  selector: 'app-edit-fab-button',
  templateUrl: './edit-fab-button.component.html',
})
export class EditFabButtonComponent extends BaseButtonComponent {
  constructor() {
    super();
    if (!this.matTooltipText) this.matTooltipText = 'Edit';
  }
}
