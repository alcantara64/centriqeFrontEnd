/** 21012021 - Gaurav - Init version: Shared drop-down to be used on setup (list) screens of features
 * which require records to be filtered based on dataDomainConfig.
 * 22012021 - Gaurav - Moved code from parent to here to populate searchPayload. Added holOrMol to identify the orgId passed */
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';

import { HoldingOrg } from 'src/app/dashboard/dashboard.service';

import { consoleLog, ConsoleTypes } from 'src/app/shared/util/common.util';
import { DataDomainConfig } from '../menu/constants.routes';

export enum CanFilterByOrg {
  HOLDING_ORG = 'HOLDING_ORG',
  MEMBER_ORG = 'MEMBER_ORG',
  BOTH_ORGS = 'BOTH_ORGS',
}

export interface OrgDrDwEmitStruct {
  searchString: string;
  searchPayload: any;
  filterByOrg: string;
  selectedOrgInDrDw: any;
  compareByKeyForFilter: OrgIdentifier;
  queryParamsForNewRecord: any;
}

export enum OrgIdentifier {
  hol = 'holdingOrg',
  mol = 'memberOrg',
}

@Component({
  selector: 'app-org-dropdownlist',
  templateUrl: './org-dropdownlist.component.html',
})
export class OrgDropdownlistComponent implements OnChanges {
  @Input() currentFeatureDataDomain!: DataDomainConfig;
  @Input() parentSelectedHoldingOrgData!: HoldingOrg;
  @Input() parentOrgAccessInformation!: any;
  @Output() fromOrgDrDw = new EventEmitter<OrgDrDwEmitStruct>();

  selectedHoldingOrgData!: HoldingOrg;
  selectedOrgInDrDw!: any;
  listOfOrgs: any[] = <any[]>[];

  private _searchString = '';
  private _searchPayload!: any;
  private _filterCampaignListBy!: CanFilterByOrg;
  private _compareKey: OrgIdentifier = OrgIdentifier.hol;

  constructor() {}

  get isShowBothOrgDropDown(): boolean {
    return (
      this._filterCampaignListBy === CanFilterByOrg.BOTH_ORGS &&
      this.selectedHoldingOrgData?.memberOrgs?.length > 0
    );
  }

  get isShowMemberOrgDropDown(): boolean {
    return (
      this._filterCampaignListBy === CanFilterByOrg.MEMBER_ORG &&
      this.selectedHoldingOrgData?.memberOrgs?.length > 0
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.parentOrgAccessInformation) {
      this._init();
    }
  }

  onSelectionChange(): void {
    this._emitValuesToParent();
  }

  private _init(): void {
    let bindingData;

    this.selectedHoldingOrgData = this.parentSelectedHoldingOrgData;
    this.selectedHoldingOrgData = {
      ...this.selectedHoldingOrgData,
      memberOrgs: [],
    };

    /** Set default search string based on globally selected Holding Org */
    this._searchString = `?holdingOrg=${this.selectedHoldingOrgData._id}`;

    /** Get the Config Data for current feature data domain */
    if (
      this.selectedHoldingOrgData?.dataDomainConfig &&
      Object.keys(this.selectedHoldingOrgData?.dataDomainConfig)?.length > 0 &&
      this.selectedHoldingOrgData?.dataDomainConfig?.hasOwnProperty(
        this.currentFeatureDataDomain
      )
    ) {
      bindingData = this.selectedHoldingOrgData?.dataDomainConfig?.[
        this.currentFeatureDataDomain
      ];
    }
    // else {
    //   /** For debug purpose */
    //   consoleLog({
    //     consoleType: ConsoleTypes.error,
    //     valuesArr: [
    //       `Error inside Org DropdownList when checking org binding for current feature data domain ${this.currentFeatureDataDomain}`,
    //       'this.selectedHoldingOrgData',
    //       this.selectedHoldingOrgData,
    //       'this.selectedHoldingOrgData?.dataDomainConfig',
    //       this.selectedHoldingOrgData?.dataDomainConfig,
    //     ],
    //   });
    // }
    /** Based on the config data, determine the org levels */
    if (bindingData?.memberOrgLevel && bindingData?.holdingOrgLevel) {
      this._filterCampaignListBy = CanFilterByOrg.BOTH_ORGS;
    } else if (bindingData?.holdingOrgLevel) {
      this._filterCampaignListBy = CanFilterByOrg.HOLDING_ORG;
    } else if (bindingData?.memberOrgLevel) {
      this._filterCampaignListBy = CanFilterByOrg.MEMBER_ORG;
    }

    if (
      this.parentOrgAccessInformation[this.currentFeatureDataDomain]?.memberOrgs
        ?.length > 0
    ) {
      this.selectedHoldingOrgData = {
        ...this.selectedHoldingOrgData,
        memberOrgs: this.parentOrgAccessInformation[
          this.currentFeatureDataDomain
        ]?.memberOrgs.map((member: any) => member),
      };

      /** Can show both orgs list */
      if (this.isShowBothOrgDropDown) {
        this.listOfOrgs = [
          {
            name: 'Holding Org',
            /** Match the object values as got for this.selectedHoldingOrgData?.memberOrgs */
            value: [
              {
                code: this.selectedHoldingOrgData?.code,
                name: this.selectedHoldingOrgData?.name,
                _id: this.selectedHoldingOrgData?._id,
                holOrMol: OrgIdentifier.hol,
              },
            ],
          },
          {
            name: 'Member Org',
            value: this.selectedHoldingOrgData?.memberOrgs?.map((mo) => {
              return {
                ...mo,
                holOrMol: OrgIdentifier.mol,
              };
            }),
          },
        ];

        this.selectedOrgInDrDw = this.listOfOrgs[0]?.value[0];
        /** Can show only member org list */
      } else if (this.isShowMemberOrgDropDown) {
        this._searchString = '?';
        this.selectedHoldingOrgData?.memberOrgs.forEach((memberOrg) => {
          this._searchString += `memberOrg=${memberOrg?._id}&`;
        });
        this._searchString = this._searchString.slice(0, -1);
        this.listOfOrgs = [...this.selectedHoldingOrgData?.memberOrgs];
        this.selectedOrgInDrDw = this.selectedHoldingOrgData?.memberOrgs[0];
      }
      /** For debug purpose */
      consoleLog({
        valuesArr: [
          'Inside Org DropdownList when members orgs available in OrgAccessInformation: this.selectedHoldingOrgData',
          this.selectedHoldingOrgData,
          'this.isShowBothOrgDropDown',
          this.isShowBothOrgDropDown,
          'this.isShowMemberOrgDropDown',
          this.isShowMemberOrgDropDown,
          'this.listOfOrgs',
          this.listOfOrgs,
          'this.selectedOrgInDrDw',
          this.selectedOrgInDrDw,
        ],
      });
    } else {
      this.selectedOrgInDrDw = {
        code: this.selectedHoldingOrgData?.code,
        name: this.selectedHoldingOrgData?.name,
        _id: this.selectedHoldingOrgData?._id,
      };

      /** For debug purpose */
      consoleLog({
        valuesArr: [
          'Inside Org DropdownList when NO member orgs found in OrgAccessInformation: this.parentOrgAccessInformation',
          this.parentOrgAccessInformation,
          'this.currentFeatureDataDomain',
          this.currentFeatureDataDomain,
          'this.selectedOrgInDrDw',
          this.selectedOrgInDrDw,
        ],
      });
    }

    if (this._filterCampaignListBy === CanFilterByOrg.BOTH_ORGS) {
      this._searchPayload = {
        options: {
          offset: 0,
          limit: 500,
        },
        query: {
          $or: <any[]>[
            { holdingOrg: this.selectedHoldingOrgData?._id },
            {
              memberOrg: this.selectedHoldingOrgData?.memberOrgs.map(
                (memberOrg: any) => memberOrg._id
              ),
            },
          ],
        },
      };
    }

    this._emitValuesToParent();
  }

  private _emitValuesToParent(): void {
    this._setCompareKey();

    /** Emit values to parent */
    this.fromOrgDrDw.emit(<OrgDrDwEmitStruct>{
      searchString: this._searchString,
      searchPayload: this._searchPayload,
      filterByOrg: this._filterCampaignListBy,
      selectedOrgInDrDw: this.selectedOrgInDrDw,
      compareByKeyForFilter: this._compareKey,
      queryParamsForNewRecord: {
        holOrMol: <OrgIdentifier>(
          (this._filterCampaignListBy === CanFilterByOrg.BOTH_ORGS
            ? this.selectedOrgInDrDw?.holOrMol
            : this._filterCampaignListBy === CanFilterByOrg.MEMBER_ORG
            ? OrgIdentifier.mol
            : OrgIdentifier.hol)
        ),
        orgId: this.selectedOrgInDrDw._id,
      },
    });
  }

  private _setCompareKey(): void {
    if (this._filterCampaignListBy === CanFilterByOrg.MEMBER_ORG) {
      this._compareKey = OrgIdentifier.mol;
    } else if (this._filterCampaignListBy === CanFilterByOrg.BOTH_ORGS) {
      this._compareKey = <OrgIdentifier>this.selectedOrgInDrDw?.holOrMol;
    } else {
      this._compareKey = OrgIdentifier.hol;
    }
  }
}
