/** 19112020 - Gaurav - Added SnackBar service to show a snackbar on the top (web) or bottom (mobile screens <=500px).
 * Two methods can be called from here - showSucess or showError, passing the message to show and the duration to display.
 * Default duration set here is 3 seconds for a success message and 5 seconds for an error message, offcourse with a x (dismiss) button
 */
import { Injectable } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import {
  MatSnackBar,
  MatSnackBarConfig,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';

import { SnackBarComponent } from './snackbar.component';

@Injectable({ providedIn: 'root' })
export class SnackbarService {
  private _horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  private _verticalPosition: MatSnackBarVerticalPosition = 'top';

  constructor(
    private _snackBar: MatSnackBar,
    private _breakpointObserver: BreakpointObserver
  ) {
    /** Show the snack bar at the bottom if the user screen is that of mobile */
    const isSmallScreen = _breakpointObserver.isMatched('(max-width: 500px)');

    if (isSmallScreen) {
      this._verticalPosition = 'bottom';
    }
  }

  // Duration in seconds
  showSuccess(message: string, duration?: number) {
    const configSuccess: MatSnackBarConfig = {
      panelClass: 'style-success',
      duration: duration ?? 3000,
      horizontalPosition: this._horizontalPosition,
      verticalPosition: this._verticalPosition,
    };

    this._snackBar.openFromComponent(SnackBarComponent, {
      data: message,
      ...configSuccess,
    });
  }

  showError(message: string, duration?: number) {
    const configFailure: MatSnackBarConfig = {
      panelClass: 'style-error',
      duration: duration ?? 5000,
      horizontalPosition: this._horizontalPosition,
      verticalPosition: this._verticalPosition,
    };

    this._snackBar.openFromComponent(SnackBarComponent, {
      data: message,
      ...configFailure,
    });
  }
}
