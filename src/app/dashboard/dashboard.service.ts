/** 20112020 - Gaurav - Init version: Provide this service in the dashboard module.
 * Instead of calling different services, in different feature modules.
 * Call the required services for that feature from this central dashboard service
 * and RETURN ONLY the data REQUIRED by that feature, tight bound by an interface
 *
 * 26112020 - Gaurav - Added loading listener and Holdin ORg listener
 * 27112020 - Gaurav - After CanDeactivate, if the user chose to stay on the component,
 * the other selected menu when navigating away stayed as selected (candeactivate inherent issue). To mitigate this issue, added _selectedMenuLevelsListener
 * 28112020 - Gaurav - Emit selected holding org object than just its ID
 * 04122020 - Gaurav - Changed interface for HoldingOrg expected values from userInfo (get:/user/me)
 * 10122020 - Gaurav - Modified getHomeDataListener() to return user name from the new API fields
 * 11122020 - Gaurav - Added new field logoUrl to HoldingOrg interface
 * 01022021 - Abhishek - Added data config and systeconfig properties
 * 01022021 - Abhishek - Added getSelectedCustomerDetail method to fetch selected customer's detail
 * 05022021 - Abhishek set default payload to maintain filtered data in customer list view
 * 08022021 - Gaurav - Removed old loading listeners for new progress-bar service implemented
 * 09032021 - Gaurav - JIRA-CA-226: Adjust UI to work with new login and global selector routes
 * 16032021 - Gaurav - JIRA-CA-237: Moved both _selectedMenuLevelsListener and _clearCanDeactivate, and its related methods to global Auth Service
 * 17032021 - Gaurav - JIRA-CA-226: Modified login (getAdditionalHoldingOrgData()) per new orgAccess API response
 */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, ReplaySubject, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { AuthService, AuthStatusData } from '../auth/auth.service';

const BACKEND_URL = `${environment.apiUrlV1}`;

export interface HomePageData {
  name: string;
}

export interface HoldingOrg {
  _id: string;
  code: string;
  name: string;
  dataConfig: any;
  dataDomainConfig: any;
  dashboardConfig: DashBoardConfigResponse[];
  memberOrgs: any[];
  logoUrl: string;
  systemConfig: any;
}

/** 17032021 - Gaurav - JIRA-CA-226 - Start */
export interface OrgAccessInformationResponse {
  dashboardConfig: DashBoardConfigResponse[];
  dataDoaminConfig: DataDomainConfigResponse;
  holdingOrg: HoldingOrg;
}

/** 18022021 - Abhishek - JIRA-CA-167: Render dashboards on UI -> Make dashboardName and module properties optional. */
export interface DashBoardConfigResponse {
  dashboardLink: string | null;
  dashboardName?: string | null;
  module?: string;
}

export interface DataDomainConfigResponse {
  communication: DataDomainConfigSettingsResponse;
  cost: DataDomainConfigSettingsResponse;
  customer: DataDomainConfigSettingsResponse;
  marketPlace: DataDomainConfigSettingsResponse;
  nps: DataDomainConfigSettingsResponse;
  product: DataDomainConfigSettingsResponse;
  profitEdge: DataDomainConfigSettingsResponse;
  response: DataDomainConfigSettingsResponse;
  revenue: DataDomainConfigSettingsResponse;
}

export interface DataDomainConfigSettingsResponse {
  holdingOrgLevel: boolean;
  memberOrgLevel: boolean;
}
/** 17032021 - Gaurav - JIRA-CA-226 - Ends */

@Injectable()
export class DashboardService {
  /** 19032021 - Gaurav - JIRA-CA-249: Used replay instead of behaviour subject */
  private _selectedHoldingOrgListener = new ReplaySubject<HoldingOrg>(1);

  /** set default payload values when payload is not specified. */
  defaultPaylod: any = {
    options: {
      offset: 0,
      limit: 10,
    },
  };

  constructor(private _authService: AuthService, private _http: HttpClient) {}

  /** Update Observables */
  setSelectedHoldingOrg(value: HoldingOrg): void {
    this._selectedHoldingOrgListener.next(value);
  }

  /** Observable Listeners */
  getCurrentHoldingOrgListenerObs(): Observable<HoldingOrg> {
    return this._selectedHoldingOrgListener.asObservable();
  }

  getUserPrivilegesListener(): Observable<any> {
    return this._authService.getAuthStatusListener();
  }

  getHomeDataListener(): Observable<any> {
    return this._authService.getAuthStatusListener().pipe(
      map((userData: AuthStatusData) => {
        /** Checked if name property exists because userInfo, as coming from the api, is set to 'any' type */
        return `${userData.userInfo?.firstName ?? ''} ${
          userData.userInfo?.lastName ?? ''
        }`;
      })
    );
  }

  /** 15122020 - Gaurav - Customer List API, moved from client-setup service to here */
  getCustomersList(searchString: string): Observable<any> {
    return this._http.get<any>(`${BACKEND_URL}/customers${searchString}`);
  }

  /** 15122020 - Gaurav - new post API to search Customers list with special conditions (payload) */
  getCustomersListFromSearch(payload: any): Observable<any> {
    /** 05022021 - Abhishek - Very first time there is not sorting and search parammeter provided at that time this defaultPayload is set with offset limit and query to get customer list */
    this.defaultPaylod =
      payload?.query !== undefined && payload?.options !== undefined
        ? payload
        : { ...this.defaultPaylod, query: payload.query };
    return this._http.post<any>(
      `${BACKEND_URL}/customers/search`,
      this.defaultPaylod
    );
  }

  /** 05012021 - Abhishek - New Get API to get selected customer detail */
  getSelectedCustomerDetail(id: string): Observable<any> {
    return this._http.get<any>(`${BACKEND_URL}/customers/${id}`);
  }

  /** 09032021 - Gaurav - JIRA-CA-226: Adjust UI to work with new login and global selector routes
   * 17032021 - Gaurav - JIRA-CA-226 - change per new API response struct */
  getAdditionalHoldingOrgData(selectedHoldingOrgId: string): Observable<any> {
    return this._http
      .get<any>(`${BACKEND_URL}/user/Users/orgAccess/${selectedHoldingOrgId}`)
      .pipe(
        map((response: OrgAccessInformationResponse) => {
          console.log(`getAdditionalHoldingOrgData: ${selectedHoldingOrgId}`, {
            response,
          });
          // send the holdingOrg object and also the dashboard config
          return {
            holdingOrg: {
              ...response.holdingOrg,
              dashboardConfig: [...response.dashboardConfig],
            },
          };
        })
      );
  }
}
