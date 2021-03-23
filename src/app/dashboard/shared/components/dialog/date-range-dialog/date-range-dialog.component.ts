/** 05032021 - Gaurav - JIRA-CA-154: Date range picker dialog, for campaign survey results or for any other window */
import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { consoleLog } from 'src/app/shared/util/common.util';
import { FormGroupValidators } from 'src/app/shared/util/form-group-validators';
import { DateRangeDialogPayload, SelectedDateRange } from '../dialog.model';

@Component({
  templateUrl: './date-range-dialog.component.html',
  styleUrls: ['./date-range-dialog.component.css'],
})
export class DateRangeDialogComponent implements OnInit {
  dateRangeForm!: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<DateRangeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DateRangeDialogPayload,
    public datePipe: DatePipe
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit(): void {
    let minusAWeekDate = new Date();
    minusAWeekDate.setDate(minusAWeekDate.getDate() - 7);

    this.dateRangeForm = new FormGroup({
      fromDate: new FormControl(minusAWeekDate, [
        Validators.required,
        FormGroupValidators.noFutureDatesValidator(),
      ]),
      toDate: new FormControl(new Date(), [
        Validators.required,
        FormGroupValidators.noFutureDatesValidator(),
      ]),
    });

    this.setDates();
  }

  setDates() {
    this.data.response = <SelectedDateRange>{
      startDate: '',
      endDate: '',
    };

    this.data.response.startDate = String(
      this.datePipe.transform(this.dateRangeForm.value.fromDate, 'yyyy-MM-dd')
    );
    this.data.response.endDate = String(
      this.datePipe.transform(this.dateRangeForm.value.toDate, 'yyyy-MM-dd')
    );

    consoleLog({
      valuesArr: [
        this.dateRangeForm.value.fromDate,
        this.dateRangeForm.value.toDate,
        this.data.response.startDate,
        this.data.response.endDate,
      ],
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
