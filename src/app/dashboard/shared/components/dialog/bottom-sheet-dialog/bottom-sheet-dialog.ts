import { Component, OnDestroy, OnInit, ViewChild,Inject } from '@angular/core';
import {MatBottomSheet, MatBottomSheetRef} from '@angular/material/bottom-sheet';
import {MAT_BOTTOM_SHEET_DATA} from '@angular/material/bottom-sheet';
import { MatDialogRef } from '@angular/material/dialog';
import { Observable, Subscription } from 'rxjs';
import {
  AccessModes
} from '../../menu/constants.routes';
import {
  BottomSheetDialogInput,
  BottomSheetDialogReturnType,
} from '../dialog.model';

@Component({
  selector: 'bottom-sheet-dialog',
  templateUrl: 'bottom-sheet-dialog.html',
})

export class BottomSheetDialog implements OnInit, OnDestroy {
  private _observableSub$!: Subscription;
  campName: any = BottomSheetDialogReturnType;
  campStatus: any = BottomSheetDialogReturnType;
  campType: any = BottomSheetDialogReturnType;
  returnType = BottomSheetDialogReturnType;
  constructor(
    public dialogRef: MatBottomSheetRef<BottomSheetDialogInput>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: BottomSheetDialogInput
    ) {
      this.campName = data?.title;
      this.campStatus = data?.status;
      this.campType = data?.accessMode;
      // if(mode == AccessModes.Add){
      //   this.campType = 'add';
      // }else if (mode == AccessModes.Edit){
      //   this.campType = 'edit';
      // }else {
      //   this.campType = 'list';
      // }
    }

  ngOnInit(){
  }
  ngOnDestroy(){

  }
  openLink(event: MouseEvent, statusType: any) {
    this.dialogRef.dismiss(statusType);
    event.preventDefault();
  }
}
