/** 23122020 - Ramesh - Init version: Schedule dialog for Campaign master*/
/** 2021-01-18 - Frank - Updated time zone handling */
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SystemDialogInput, SystemDialogReturnType, SystemDialogType, DialogConditionType, ScheduleDialogReturnType } from '../dialog.model';
import { CommunicationAIService } from 'src/app/dashboard/features/communication-ai/communication-ai.service';


@Component({
  selector: 'app-schedule-dialog',
  templateUrl: './schedule-dialog.html',
  styles: ['.mat-dialog-container{padding: 24px !important;}']
})
export class ScheduleDialogComponent {
  /** Static data */
  returnType = SystemDialogReturnType;
  buttonDisplayTypes = SystemDialogType;

  /** Data as received */
  showButtons: SystemDialogType = SystemDialogType.info_alert_ok;
  dialogTitle: any = '';
  dialogBody = '';
  timeZone: string = '';


  constructor(
    public _communicationAIService: CommunicationAIService,
    public dialogRef: MatDialogRef<ScheduleDialogReturnType>,
    @Inject(MAT_DIALOG_DATA) public data: ScheduleDialogReturnType
  ) {
    //Getting user time zone
    this.timeZone = data?.body?.timeZone;
    dialogRef.disableClose = true;
    this.dialogTitle = data?.title;

    this.dialogBody = data?.body?.dateList.map((v: string) => {
      return this._communicationAIService.handleDateTimeZoneReceive(v, this.timeZone);
    })
  }
}
