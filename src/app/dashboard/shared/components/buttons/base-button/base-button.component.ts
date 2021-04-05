/** 26032021 - Gaurav - JIRA-CA-310: Componentize setup-list action buttons */
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatBadgePosition, MatBadgeSize } from '@angular/material/badge';

@Component({
  template: '',
})
export class BaseButtonComponent implements OnInit {
  @Output() clicked = new EventEmitter<any>();
  @Input() matTooltipText?: string;
  @Input() isDisabled?: boolean = false;
  @Input() isEnableSpecialClass?: boolean = false;

  constructor() {}

  ngOnInit(): void {}

  onClick(): void {
    // console.log('onClick');
    this.clicked.emit();
  }
}
