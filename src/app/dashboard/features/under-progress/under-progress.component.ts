/** 23112020 - Init version: Component as a placeholder for in-progress modules
 * or to hide app features which are unsubscribed to */
import { Component } from '@angular/core';

@Component({
  templateUrl: './under-progress.component.html',
  styles: [
    `
      .under-progress-container {
        height: 100%;
        width: auto;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    `,
  ],
})
export class UnderProgressComponent {}
