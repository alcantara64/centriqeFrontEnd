import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AppButtonTypes, ButtonRowProps } from '../buttons.model';

@Component({
  selector: 'app-fab-button-row',
  templateUrl: './fab-button-row.component.html',
})
export class FabButtonRowComponent implements OnInit {
  readonly appButtonTypes = AppButtonTypes;
  @Input() buttonRowProps!: ButtonRowProps;
  @Output() clicked = new EventEmitter<AppButtonTypes>();

  constructor() {}

  ngOnInit(): void {}

  onClick(appButtonType: AppButtonTypes): void {
    this.clicked.emit(appButtonType);
  }
}
