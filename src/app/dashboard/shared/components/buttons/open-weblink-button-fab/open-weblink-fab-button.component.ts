/** 26032021 - Gaurav - JIRA-CA-310: Componentize setup-list action buttons */

import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-open-weblink-fab-button',
  templateUrl: './open-weblink-fab-button.component.html',
})
export class OpenWeblinkFabButtonComponent {
  @Input() hrefURI!: string;
  @Input() isDisabled?: boolean = false;
  @Input() matTooltipText?: string = 'Live Web View';

  constructor() {}
}
