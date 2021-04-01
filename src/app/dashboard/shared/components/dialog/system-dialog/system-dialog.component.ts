/** 25112020 - Gaurav - Init version: System Dialog for user alerts
 * Use DialogConditionType.prompt_custom_data to send custome title and body
 * Use SystemDialogType to request the buttons to show on this dialog (check dialog.model.ts)
 * 27112020 - Gaurav - Added prompt_discard_data_changes predefined dialog condition type
 * 24032021 - Gaurav - Added optional dialogBody2
 */
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  SystemDialogInput,
  SystemDialogReturnType,
  SystemDialogType,
  DialogConditionType,
} from '../dialog.model';

@Component({
  selector: 'app-system-dialog',
  templateUrl: './system-dialog.component.html',
  styleUrls: ['./system-dialog.component.css'],
})
export class SystemDialogComponent {
  /** Static data */
  returnType = SystemDialogReturnType;
  buttonDisplayTypes = SystemDialogType;

  /** Data as received */
  showButtons: SystemDialogType = SystemDialogType.info_alert_ok;
  dialogTitle = '';
  dialogBody = '';
  dialogBody2!: string | undefined;

  constructor(
    public dialogRef: MatDialogRef<SystemDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SystemDialogInput
  ) {
    dialogRef.disableClose = true;
    this.showButtons = data.alertType;

    switch (data.dialogConditionType) {
      case DialogConditionType.prompt_custom_data:
        this.dialogTitle = data.title!;
        this.dialogBody = data.body!;
        this.dialogBody2 = data?.body2;
        break;

      case DialogConditionType.prompt_save_data_changes:
        this.dialogTitle = 'Save changes?';
        this.dialogBody = 'Do you want to save the changes to the server?';
        break;

      case DialogConditionType.prompt_discard_data_changes:
        this.dialogTitle = 'Discard changes?';
        this.dialogBody = 'Do you want to discard any data changes made here?';
        break;

      default:
        /** Probably DialogConditionType.prompt_general, but I don't see it being much used,
         * just for the sake of this default switch to avoid showing blank dialog */
        this.dialogTitle = 'System Info';
        this.dialogBody = 'Success!';
    }
  }
}
