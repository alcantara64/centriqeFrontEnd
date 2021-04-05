/** 26032021 - Gaurav - JIRA-CA-310: Componentize setup-list action buttons */
import { Component, Input } from '@angular/core';
import { BaseButtonComponent } from '../base-button/base-button.component';

@Component({
  selector: 'app-status-fab-button',
  templateUrl: './status-fab-button.component.html',
})
export class StatusFabButtonComponent extends BaseButtonComponent {
  @Input() status!: number;

  constructor() {
    super();
  }
}
