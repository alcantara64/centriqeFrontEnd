import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  template: `
    <mat-progress-bar
      mode="indeterminate"
      color="warn"
      [ngStyle]="{ height: '3px' }"
      *ngIf="isLoading"
    ></mat-progress-bar>
  `,
})
export class ProgressBarComponent {
  @Input() isLoading = false;
}
