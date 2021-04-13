import { Subscription } from 'rxjs';
/**
 * 01042021 - Abhishek - Init version
 * 01042021 - Abhishek - CA-334: Implement Frontend "load file".
 */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { LoadingService } from 'src/app/shared/services/loading.service';
import { consoleLog, ConsoleTypes } from 'src/app/shared/util/common.util';
import { ClientSetupService } from '../client-setup.service';
import { BaseComponent } from 'src/app/shared/base/base.component';
import { HoldingOrg } from 'src/app/dashboard/dashboard.service';
import { SnackbarService } from 'src/app/shared/components/snackbar.service';
import { HttpEventType } from '@angular/common/http';

@Component({
  selector: 'app-load-customer-data',
  templateUrl: './load-customer-data.component.html',
  styleUrls: ['./load-customer-data.component.css'],
})
export class LoadCustomerDataComponent
  extends BaseComponent
  implements OnInit, OnDestroy {
  selectedIndex = 0;
  dataSource!: MatTableDataSource<any>;
  private _customerUploadsSub$!: Subscription;
  globalHoldingOrg!: HoldingOrg;
  private _globalHoldingOrgListenerSub$!: Subscription;

  /** Cols chosen to be displayed on the table */
  displayedColumns: string[] = ['name', 'size', 'action_buttons'];
  uploadedProgress: number = 0;
  isUploadComplete: boolean = false;

  constructor(
    private _clientSetupService: ClientSetupService,
    _loadingService: LoadingService,
    private _snackbarService: SnackbarService
  ) {
    super(_loadingService);
  }

  ngOnInit(): void {
    this.getHoldingOrgFromLocalStorage();
    this.getCustomerUploads();
  }

  getCustomerUploads() {
    const initialLoad$ = this._clientSetupService.getCustomerUploads(
      this.globalHoldingOrg._id
    );
    this._customerUploadsSub$ = this._loadingService
      .showProgressBarUntilCompleted(initialLoad$, 'query')
      .subscribe(
        (uploads) => {
          this._setLoading(false);
          this.dataSource = new MatTableDataSource(uploads);
        },
        (error) => {
          consoleLog({ consoleType: ConsoleTypes.error, valuesArr: [error] });
          this._setLoading(false);
        }
      );
  }
  onUpload(event: FileList) {
    const file: File = event[0];
    this.isUploadComplete = false;
    this.uploadedProgress = 0;

    if (file) {
      const formData = new FormData();
      formData.append('holdingOrg', this.globalHoldingOrg._id);
      formData.append('code', this.globalHoldingOrg?.code);
      formData.append('file', file);
      this._clientSetupService.uploadCustomerData(formData).subscribe(res => {
        console.log('response ==>', res)
        switch (res.type) {
          case HttpEventType.UploadProgress:
            if (res.total && res['loaded'] !== res['total']) {
              this.uploadedProgress = Math.round(res['loaded'] / res['total'] * 100);
            }
            break;
          case HttpEventType.Response:
           this._snackbarService.showSuccess('File Uploaded successfully');
            this.getCustomerUploads();
            this.isUploadComplete = true;
            break;
        }

      }, error => {
        console.log('eeror ==>', error);
        this.isUploadComplete = true;
        this._snackbarService.showError('fileUpload error');

      });

    }
  }

  ngOnDestroy() {
    this._customerUploadsSub$.unsubscribe();
    this._globalHoldingOrgListenerSub$?.unsubscribe();
  }
  getHoldingOrgFromLocalStorage() {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const parsedData = JSON.parse(userInfo);
      if (parsedData?.holdingOrg) {
        this.globalHoldingOrg = parsedData?.holdingOrg;
      }
    }
  }
}
