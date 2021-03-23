/** 25112020 - Gaurav - Init version: Dialog service to show dialogs and get user responses
 * To avoid arbitrary calling of Dialog components from anywhere and making it difficult to trace/analyse
 * 11122020 - Gaurav - Open Info Dialog for Support or Privacy Terms
 * 15122020 - Gaurav - Added new dialog for Demo and fixed an issue for InfoDialog when it showed the scrollbars after opening dialog
 * 05032021 - Gaurav - JIRA-CA-154: Shared date range dialog for any module */

import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { take } from 'rxjs/operators';
import { DataDomainConfig } from '../menu/constants.routes';
import { DateRangeDialogComponent } from './date-range-dialog/date-range-dialog.component';
import { DemoDialogComponent } from './demo-dialog/demo-dialog.component';
import {MatBottomSheet, MatBottomSheetRef} from '@angular/material/bottom-sheet';
import { BottomSheetDialog } from 'src/app/dashboard/shared/components/dialog/bottom-sheet-dialog/bottom-sheet-dialog';
import {
  DialogConditionType,
  SystemDialogInput,
  SystemDialogReturnType,
  InfoDialogType,
  DateRangeDialogPayload,
  BottomSheetDialogInput,
  BottomSheetDialogReturnType,
  SelectedDateRange,
} from './dialog.model';
import { InfoDialogComponent } from './info-dialog/info-dialog.component';
import { ScheduleDialogComponent } from './schedule-dialog/schedule-dialog';
import { SystemDialogComponent } from './system-dialog/system-dialog.component';

@Injectable()
export class DialogService {
  constructor(
    private _dialog: MatDialog,
    private _bottomSheet: MatBottomSheet
    ) {}

  openSystemDialog(input: SystemDialogInput): Promise<SystemDialogReturnType> {
    return new Promise<SystemDialogReturnType>((resolve, reject) => {
      /** Return for invalid inputs, dev team should handle this with valid inputs */
      if (input.alertType === null || input.alertType === undefined) reject(-1);
      if (
        input.dialogConditionType === null ||
        input.dialogConditionType === undefined
      )
        reject(-1);
      if (
        input.dialogConditionType === DialogConditionType.prompt_custom_data &&
        (!input.title || !input.body)
      )
        reject(-1);

      const dialogRef = this._dialog.open(SystemDialogComponent, {
        data: input,
      });

      dialogRef
        .afterClosed()
        .pipe(take(1))
        .subscribe((result) => {
          /** Return the result for the caller to process */
          resolve(result);
        });
    });
  }

  openInfoDialog(
    infoDialogType: InfoDialogType,
    displayHeading?: string,
    displayText?: string
  ): Promise<SystemDialogReturnType> {
    return new Promise<SystemDialogReturnType>((resolve, reject) => {
      const dialogRef = this._dialog.open(InfoDialogComponent, {
        data: { infoDialogType, displayHeading, displayText },
      });

      dialogRef
        .afterClosed()
        .pipe(take(1))
        .subscribe((result) => {
          /** Return the result for the caller to process */
          resolve(result);
        });
    });
  }

  openDemoDialog(
    template: any,
    customer: any,
    dataDomain: DataDomainConfig
  ): Promise<SystemDialogReturnType> {
    return new Promise<SystemDialogReturnType>((resolve, reject) => {
      const dialogRef = this._dialog.open(DemoDialogComponent, {
        // width: '500px',
        autoFocus: false,
        panelClass: 'demo-dialog',
        width: '600px',
        data: { template, customer, dataDomain },
      });

      dialogRef
        .afterClosed()
        .pipe(take(1))
        .subscribe((result) => {
          /** Return the result for the caller to process */
          resolve(result);
        });
    });
  }

  //Open Schedule Dailog for Campaign master
  openScheduleDialog(body: any): Promise<SystemDialogReturnType> {
    return new Promise<SystemDialogReturnType>((resolve, reject) => {
      const dialogRef = this._dialog.open(ScheduleDialogComponent, {
        // width: '500px',
        autoFocus: false,
        panelClass: 'schedule-dialog',
        width: '600px',
        data: body,
      });

      dialogRef
        .afterClosed()
        .pipe(take(1))
        .subscribe((result) => {
          /** Return the result for the caller to process */
          resolve(result);
        });
    });
  }

  /** 05032021 - Gaurav - JIRA-CA-154: Date Range dialog for any module */
  openDateRangeDialog(
    payload: DateRangeDialogPayload
  ): Promise<SelectedDateRange> {
    return new Promise<SelectedDateRange>((resolve) => {
      const dialogRef = this._dialog.open(DateRangeDialogComponent, {
        autoFocus: false,
        panelClass: 'demo-dialog',
        width: '600px',
        data: payload,
      });

      dialogRef
        .afterClosed()
        .pipe(take(1))
        .subscribe((result) => {
          /** Return the result for the caller to process */
          resolve(result);
        });
    });
  }

  openBottomSheetDialog(payload: BottomSheetDialogInput): Promise<BottomSheetDialogReturnType> {
    return new Promise<BottomSheetDialogReturnType>((resolve, reject) => {
      const dialogRef = this._bottomSheet.open(BottomSheetDialog, {
        data: payload
      });
      dialogRef
        .afterDismissed()
        .pipe(take(1))
        .subscribe((result) => {
          /** Return the result for the caller to process */
          resolve(result);
        });
    });
  }

}
