/** 15122020 - Gaurav - Init version */
/** 2021-01-18 - Frank - Moved to EmailService */
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SnackbarService } from 'src/app/shared/components/snackbar.service';
import { EmailService } from 'src/app/shared/services/email.service';
import { DataDomainConfig } from '../../menu/constants.routes';

@Component({
  selector: 'app-demo-dialog',
  templateUrl: './demo-dialog.component.html',
  styleUrls: ['./demo-dialog.component.css'],
})
export class DemoDialogComponent implements OnInit {
  isLoading = false;
  payload = {
    templateId: '',
    surveyId: '',
    customerIds: <string[]>[],
    channelSelection: {
      email: false,
      sms: false,
      whatsApp: false,
      basedOnCustomer: false,
    },
    manualOverride: {
      emailTo: '',
      smsTo: '',
      whatsAppTo: '',
    },
  };

  constructor(
    public dialogRef: MatDialogRef<DemoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { template: any; customer: any, dataDomain: DataDomainConfig },
    private _snackbarService: SnackbarService,
    private _emailService: EmailService
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit(): void {
    if(this.data.dataDomain === DataDomainConfig.communication) {
      this.payload.templateId = this.data.template._id;
    } else {
      this.payload.surveyId = this.data.template._id;
    }
    this.payload.customerIds.push(this.data.customer._id);
    this.payload.manualOverride.emailTo = this.data.customer.email;
    this.payload.manualOverride.whatsAppTo = this.data.customer.cellPhone;
    this.payload.manualOverride.smsTo = this.data.customer.cellPhone;
  }

  onSend(): void {
    this.isLoading = true;

    this._emailService.sendDemoMessage(this.data.dataDomain, this.payload).subscribe(
      (response) => {
        this._snackbarService.showSuccess('Message sent!', 2000);
        this.isLoading = false;
        this.dialogRef.close();
      },
      (error) => {
        this.isLoading = false;
      }
    );
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  validateNumber(event: KeyboardEvent): boolean {
    let regex = new RegExp('^[0-9-+]');
    let key = String.fromCharCode(
      event.charCode ? event.which : event.charCode
    );
    if (!regex.test(key)) {
      event.preventDefault();
      return false;
    }

    return true;
  }
}
