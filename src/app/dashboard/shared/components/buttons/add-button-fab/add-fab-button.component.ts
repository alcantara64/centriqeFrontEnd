/** 26032021 - Gaurav - JIRA-CA-310: Componentize setup-list action buttons */

import { Component } from '@angular/core';
import { BaseButtonComponent } from '../base-button/base-button.component';

@Component({
  selector: 'app-add-fab-button',
  templateUrl: './add-fab-button.component.html',
})
export class AddFabButtonComponent extends BaseButtonComponent {
  constructor() {
    super();
  }
}
