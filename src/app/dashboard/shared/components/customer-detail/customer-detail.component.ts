/**
 * 29012021 - Abhishek - Init version
 * 01022021 - Abhishek - Data group and data attributes for selected customer
 * 05022021 - Abhishek - Import DatePipe to transform into 'yyy-MM-dd' format
 * 08022021 - Abhishek - Added getSubtitle() to set subtitle and import generateNameAndCodeString for sub title.
 * 10022021 - Abhishek - Set loading when data is loading(Waiting for API response).
*/
import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingService } from '../../../../shared/services/loading.service';
import { generateNameAndCodeString } from 'src/app/shared/util/common.util';
import { DashboardService, HoldingOrg } from '../../../dashboard.service';

@Component({
  selector: 'app-customer-detail',
  templateUrl: './customer-detail.component.html',
  styleUrls: ['./customer-detail.component.css']
})
export class CustomerDetailComponent implements OnInit {
  isLoading = false;
  tableColumn: string[] = [];
  customerData: any[] = [];
  groups: any[] = [];
  selectedHoldingOrgData!: HoldingOrg;
  customerDetail!:any;
  holdingOrgId!: string;
  customerId!: string;
  customerDetailForm: FormGroup;
  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _dashboardService: DashboardService,
    private _fromBuilder:FormBuilder,
    private datePipe: DatePipe,
    private _loadingService: LoadingService
  ) {
    this.customerId = this._route.snapshot.params['id'];
    this.customerDetailForm = this._fromBuilder.group({});
  }

  ngOnInit(): void {
    /** 05022021 - Abhishek - Set service call to gte selected customer detail */
    this._setLoading(true);
    this._loadingService
      .showProgressBarUntilCompleted(
        this._dashboardService
        .getSelectedCustomerDetail(this.customerId)
        ).subscribe(
      (customerDetail: any) => {
        let patchDeatilData = {...customerDetail,
          holdingOrg:customerDetail._id}
          this.customerDetail = customerDetail;
          this._setLoading(false);
        this.customerData.forEach(element => {
          /** 05022021 - Abhishek - Set date format using date pipe */
          if(element.type === 'date')
            patchDeatilData[element.code] =  this.datePipe.transform(patchDeatilData[element.code], 'yyyy-MM-dd');
        });
        this.customerDetailForm.patchValue(patchDeatilData);
      }, () => {
        this._setLoading(false);
      });

    /** 05022021 - Abhishek - Set holding org listner to get globlelly selected holding org data */
     this._loadingService
      .showProgressBarUntilCompleted(this._dashboardService
      .getCurrentHoldingOrgListenerObs()
      ).subscribe(
        (selectedHoldingOrgData: HoldingOrg) =>
            this.selectedHoldingOrgData = selectedHoldingOrgData
        );

    /** 05022021 - Abhishek - Filter and sor usedInDetail view properties */
    this.holdingOrgId = this.selectedHoldingOrgData._id;
    this.selectedHoldingOrgData?.dataConfig?.customer?.dataAttributes?.map((data: any) => {
      if (data.useInDetailView === true) {
        this.customerData.push(data);
      }
    });

    /** 05022021 - Abhishek - Filter and sort selectedGroups */
    let selectedGroups: any[] = [];
    this.customerData.sort((a, b) => a.detailViewOrder - b.detailViewOrder);
    this.customerData.forEach(element => {
      this.customerDetailForm.addControl(element.code, new FormControl({value: '', disabled: true}));
      !selectedGroups.includes(element.groupCode) ? selectedGroups.push(element.groupCode) : null;
    });

    this.groups = this.selectedHoldingOrgData?.systemConfig?.dataConfig?.customer?.dataGroups?.filter((element: any) => {
      if (selectedGroups.includes(element.code)) {
        return element;
      }
    });

    this.groups = this.groups?.map(element => {
      let dataAttributes: any[] = [];
      this.customerData.forEach(data => {
        if (element.code === data.groupCode) {
          dataAttributes.push(data);
        }
      });
      dataAttributes = dataAttributes.sort((a,b) => { return a.detailViewOrder - b.detailViewOrder });
      return {
        ...element,
        dataAttributes: dataAttributes
      }
    });
  }

  /** 05022021 - Abhisehek - set back route on back click */
  onBack() {
    this._router.navigate(['../../'],{ relativeTo: this._route});
  }

  getSubTitle(): string {
    return generateNameAndCodeString(
      this.customerDetail?.code,
      this.customerDetail?.fullName
    );
  }

  private _setLoading(value: boolean): void {
    this.isLoading = value;
    if (!value) this._loadingService.loadingOff();
  }
}
