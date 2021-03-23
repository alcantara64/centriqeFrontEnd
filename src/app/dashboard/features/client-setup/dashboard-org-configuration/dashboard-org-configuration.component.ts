/** 05032021 - Abhishek - Init Version */
/** 18022021 - Abhishek - JIRA-CA-167: Render dashboards on UI -> Added methods.
 * 18022021 - Abhishek - JIRA-CA-201: Extend dashboard config UI with default dashboard link -> Added methods.
 */
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatOption } from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { DialogConditionType, SystemDialogReturnType, SystemDialogType } from '../../../../dashboard/shared/components/dialog/dialog.model';
import { DialogService } from '../../../../dashboard/shared/components/dialog/dialog.service';
import { LoadingService } from '../../../../shared/services/loading.service';
import { ClientSetupService } from '../client-setup.service';

export interface DashboardModule {
  code: string,
  name: string
}
// const dashboardModules: DashboardModule[] = [
//   {code: 'home', name: "Home"},
//   {code: 'askBuddy', name: "Ask Buddy"},
//   {code: 'comm', name: "Comm AI"},
//   {code: 'resp', name: "Response AI"},
//   {code: 'nps', name: "NPS"},
//   {code: 'insight', name: "Insight"},
//   {code: 'profitEdge', name: "Profit Edge"},
// ]

@Component({
  selector: 'app-dashboard-org-configuration',
  templateUrl: './dashboard-org-configuration.component.html',
  styleUrls: ['./dashboard-org-configuration.component.css', '../../../shared/styling/setup-table-list.shared.css']
})
export class DashboardOrgConfigurationComponent implements OnInit {

  isLoading = false;
  isDashboardNameChange = false;
  isDashboardLinkChange = false;
  isDefaultEdit = false;
  dashboardConfigForm: FormGroup;
  /** Cols chosen to be displayed on the table */
  displayedColumns: string[] = [
    'holdingOrg',
    'memberOrg',
    'module',
    'dashboardName',
    'dashboardLink',
    'action_buttons'
  ];
  allChecked = false;
  dashboardModules!: DashboardModule[];
  selectedHoldingOrg: any = 'all';
  selectedMemberOrg: any = 'all';
  selectedModule: any[] = [];
  holdingOrgData!: any;
  memberOrgData!: any;
  totalRecords = 0;
  dashboardConfigList: any[] = [];
  dataSource!: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('allSelected') private allSelected!: MatOption;

  constructor(_formBuilder: FormBuilder, private _clientSetupService: ClientSetupService,
    private _loadingService: LoadingService,
    private _dialogService: DialogService,) {
    this.dashboardConfigForm = _formBuilder.group({
      module: [''],
      dashboardName: [''],
      dashboardLink: [''],
      defaultName: [{ value: '', disabled: true }],
      defaultLink: [{ value: '', disabled: true }],
      // dashboardName:['',Validators.required],
      // dashboardLink:['',Validators.required]
    })
    this.dashboardModules = [
      { code: 'home', name: "Home" },
      { code: 'askBuddy', name: "Ask Buddy" },
      { code: 'comm', name: "Comm AI" },
      { code: 'resp', name: "Response AI" },
      { code: 'nps', name: "NPS" },
      { code: 'insight', name: "Insight" },
      { code: 'profitEdge', name: "Profit Edge" },
    ];
  }

  ngOnInit(): void {
    this._setLoading(true);
    this._getHoldingOrgs();
    this.setDefaultDashboardConfig();
  }
  setDefaultDashboardConfig() {
    this._clientSetupService.getSystemConfig().subscribe((res) => {
      if (res.dashboardConfig) {
        this.dashboardConfigForm.get('defaultLink')?.patchValue(res.dashboardConfig?.dashboardLink);
        this.dashboardConfigForm.get('defaultName')?.patchValue(res.dashboardConfig?.dashboardName);
      }
    }, (error) => {
      console.log('err ==>', error)
    })
  }
  searchConfig() {
    const filterQuery = {
      memberOrg: this.selectedMemberOrg._id,
      holdingOrg: this.selectedHoldingOrg._id,
      modules: this.selectedModule.map((x) => x.code)
    }
    this._setLoading(true);
    this.dashboardConfigList = [];
    this._loadingService
      .showProgressBarUntilCompleted(
        this._clientSetupService.getFilteredDashboardConfig(filterQuery)).subscribe(async (response: any) => {
          response?.map((data: any) => {
            data = data?.dashboardConfig?.map((element: any) => {
              let data1 = {
                ...data,
                module: element.module,
                dashboardLink: element.dashboardLink ? element.dashboardLink : null,
                dashboardName: element.dashboardName ? element.dashboardName : null,
                isEdit: false
              }
              this.dashboardConfigList.push(data1);
            })
          });
          this.dataSource = new MatTableDataSource(this.dashboardConfigList)
          this._setLoading(false);
        }, () => this._setLoading(false))
  }

  onHoldingOrgChange() {
    this.selectedMemberOrg = 'all';
    this.memberOrgData = [];
    if (this.selectedHoldingOrg !== 'all') {
      this._setLoading(true);
      this._loadingService
        .showProgressBarUntilCompleted(
          this._clientSetupService.getMemberOrgList(this.selectedHoldingOrg?._id)).subscribe(async (data) => {
            this.memberOrgData = data;
            this._setLoading(false);
          }, () => this._setLoading(false))
    }
  }

  change(event: any) {
    if (event.isUserInput) {
      const index = this.selectedModule.findIndex(
        (module: any) => module === event.source.value
      );
      event.source.selected ? this.selectedModule.push(event.source.value) : this.selectedModule?.splice(index, 1)
      this.allChecked = this.selectedModule?.length === this.dashboardModules?.length;

    }
  }
  toggleAllSelection() {
    if (this.allSelected.selected) {
      this.selectedModule.push(...this.dashboardModules.map(item => item.code), 0);
    } else {
      this.selectedModule = [];
    }
  }

  onDashboardNameChange(e: any, value: string) {
    this.isDashboardNameChange = false;
    if (e.target.value) {
      this.isDashboardNameChange = e.target.value !== value ? true : false;
    }
  }

  onDashboardLinkChange(e: any, value: string) {
    this.isDashboardLinkChange = false;
    if (e.target.value) {
      this.isDashboardLinkChange = e.target.value !== value ? true : false;
    }
  }

  onDefaultEdit() {
    this.isDefaultEdit = true;
    this.dashboardConfigForm.get('defaultName')?.enable();
    this.dashboardConfigForm.get('defaultLink')?.enable();
  }

  onCancelDefaultConfig() {
    this.isDefaultEdit = false;
    this.dashboardConfigForm.get('defaultName')?.reset();
    this.dashboardConfigForm.get('defaultLink')?.reset();
    this.dashboardConfigForm.get('defaultName')?.disable();
    this.dashboardConfigForm.get('defaultLink')?.disable();
  }

  onEditConfig(data: any, index: number) {
    if (this.dashboardConfigList?.some((x) => x.isEdit) && (this.isDashboardLinkChange || this.isDashboardNameChange)) {
      const findIndex = this.dashboardConfigList.findIndex((config) => {
        config.isEdit === true;
      });
      this._dialogService
        .openSystemDialog({
          alertType: SystemDialogType.warning_alert_yes_no,
          dialogConditionType: DialogConditionType.prompt_custom_data,
          title: 'Alert',
          body: `Do you want to save the changes and continue?`,
        })
        .then((response) => {
          /** Only process confirmation requests */
          if (response === SystemDialogReturnType.continue_yes) {
            this.onSaveConfig(this.dashboardConfigList[index], index)
            this.isDashboardLinkChange = false;
            this.isDashboardNameChange = false;
            this.dashboardConfigList = this.dashboardConfigList.map(config => {
              config.isEdit = false;
              if (data === config) {
                config.isEdit = true;
              }
              return config;
            });
            this.dataSource = new MatTableDataSource(this.dashboardConfigList);
          }
        })
        .catch((error) => {
          // DEV team => Pass VALID parameters to this service method
        });
    } else {
      this._setLoading(true);
      this.isDashboardLinkChange = false;
      this.isDashboardNameChange = false;
      this.dashboardConfigList = this.dashboardConfigList.map(config => {
        config.isEdit = false;
        if (data === config) {
          this.dashboardConfigForm.get('module')?.setValue(config.module);
          this.dashboardConfigForm.get('dashboardLink')?.setValue(config.dashboardLink);
          this.dashboardConfigForm.get('dashboardName')?.setValue(config.dashboardName);
          config.isEdit = true;
        }
        return config;
      });
      this.dataSource = new MatTableDataSource(this.dashboardConfigList);
    }

  }

  openLink(link: string) {
    window.open(link, "_blank");
  }

  onSaveConfig(data?: any, index?: number) {
    let updatedConfigData: any;
    // debugger
    if (data) {
      // this.dashboardConfigList[index].isEdit = false;
      this.dashboardConfigList = this.dashboardConfigList.map(config => {
        config.isEdit = false;
        // if(data === config){
        //   config.isEdit = true;
        // }
        return config;
      });
      this.isDashboardLinkChange = false;
      this.isDashboardNameChange = false;
      updatedConfigData = data.memberOrgId ? { memberOrgId: data.memberOrgId } : { holdingOrgId: data.holdingOrgId };
      updatedConfigData = {
        ...updatedConfigData,
        dashboardConfig: [
          {
            ...this.dashboardConfigForm.value
          }
        ]
      }
      // this.dashboardConfigForm.reset();
      this._loadingService
        .showProgressBarUntilCompleted(
          this._clientSetupService.updateDashboardConfig(updatedConfigData)).subscribe(async () => {
            this._getDashboardConfigsBySearch();
          })
    } else {
      let defaultConfig = {
        dashboardName: this.dashboardConfigForm.get('defaultName')?.value,
        dashboardLink: this.dashboardConfigForm.get('defaultLink')?.value,
      }
      this._clientSetupService.updateDefaultLink(defaultConfig).subscribe((data: any) => {
        this.isDefaultEdit = false;
        this.dashboardConfigForm.get('defaultName')?.patchValue(data?.dashboardName)
        this.dashboardConfigForm.get('defaultLink')?.patchValue(data?.dashboardLink)
        this.dashboardConfigForm.get('defaultName')?.disable();
        this.dashboardConfigForm.get('defaultLink')?.disable();
      })
    }

  }

  onCancelConfig(id: any, index: number) {
    this.dashboardConfigList[index].isEdit = false;
    this.isDashboardLinkChange = false;
    this.isDashboardNameChange = false;
    this.dataSource = new MatTableDataSource(this.dashboardConfigList);
  }

  private _getHoldingOrgs() {
    this._loadingService
      .showProgressBarUntilCompleted(
        this._clientSetupService.getHoldingOrgs()).subscribe(async (data: any) => {
          this.holdingOrgData = await data.results;
          this._setLoading(false);
        }, () => this._setLoading(false));
    this._getDashboardConfigsBySearch()
  }

  private _getDashboardConfigsBySearch() {
    this._loadingService
      .showProgressBarUntilCompleted(
        this._clientSetupService.getDashboardConfigData(),
        'query'
      )
      .subscribe(
        async (response: any) => {
          this.totalRecords = response?.length;
          this.dashboardConfigList = [];

          response?.map((data: any) => {
            // debugger
            if (data?.dashboardConfig?.length) {
              data = data?.dashboardConfig?.map((element: any) => {
                let data1 = {
                  ...data,
                  module: element.module,
                  dashboardLink: element.dashboardLink ? element.dashboardLink : null,
                  dashboardName: element.dashboardName ? element.dashboardName : null,
                  isEdit: false
                }
                this.dashboardConfigList.push(data1);
              })
            } else {
              let data1 = {
                ...data,
                isEdit: false
              }
              this.dashboardConfigList.push(data1);
            }
          });
          this.dataSource = new MatTableDataSource(this.dashboardConfigList);
          //this.dataSource.paginator = await this.paginator;
          this.dataSource.sort = await this.sort;
          this._setLoading(false);
        },
        (error) => {
          // shall be handled by Http Interceptor
          this._setLoading(false);
        }
      );

  }
  private _setLoading(value: boolean): void {
    this.isLoading = value;
    if (!value) this._loadingService.loadingOff();
  }
}
