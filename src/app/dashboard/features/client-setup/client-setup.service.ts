/** 26112020 - Gaurav - Init version: Service for client-setup feature components
 * 27112020 - Gaurav - Added Member Org APIs
 * 28112020 - Gaurav - Added Customer List API and get Holding Org (by ID) API
 * 30112020 - Gaurav - Return type changed for list APIs - from array to object
 * 01122020 - Gaurav - Added searchString to getCustomersList() for selective fetch
 * 04122020 - Gaurav - Added API to get Org Access details for a holding org
 * 15122020 - Gaurav - Moved common customer list API to dashboard service
 * 05032021 - Abhishek - Added get and update dashboard config data API.
 * 17032021 - Gaurav - JIRA-CA-226: Modified org-drop-down (getOrgAccessInformation()) per new orgAccess API response
 * 18022021 - Abhishek - JIRA-CA-167: Render dashboards on UI -> Added update dashboard Org HTTP PUT call.
 */
import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { map, tap } from 'rxjs/operators';
import { BehaviorSubject, Observable, of } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { OrgAccessInformationResponse } from '../../dashboard.service';
import { FilterParams } from 'src/app/core/models/dashboardCofig';
const BACKEND_URL = `${environment.apiUrlV1}`;

@Injectable()
export class ClientSetupService {
  private _holdingOrgListListener = new BehaviorSubject<any>({});
  private _memberOrgListListener = new BehaviorSubject<any>({});
  private _allMemberOrgsListener = new BehaviorSubject<any>({});
  private _dataDomainStaticsListener = new BehaviorSubject<any>({});

  constructor(private _http: HttpClient) {}

  /** Holding Org APIs */
  getHoldingOrgs(): Observable<any[]> {
    return this._http.get<any>(`${BACKEND_URL}/holdingOrgs`).pipe(
      tap((orgData) => {
        this._holdingOrgListListener.next(orgData);
      })
    );
  }

  getHoldingOrg(holdingOrgId: string): Observable<any> {
    return this._http.get<any>(`${BACKEND_URL}/holdingOrgs/${holdingOrgId}`);
  }

  getDataBindingStatics(): Observable<any> {
    return this._http.get(`${BACKEND_URL}/statics`).pipe(
      tap((statics: any) => {
        this._dataDomainStaticsListener.next(statics?.dataDomains);
      })
    );
  }

  createHoldingOrg(payload: any): Observable<any> {
    return this._http.post(`${BACKEND_URL}/holdingOrgs`, payload);
  }

  updateHoldingOrg(holdingOrgId: string, payload: any): Observable<any> {
    return this._http.put(
      `${BACKEND_URL}/holdingOrgs/${holdingOrgId}`,
      payload
    );
  }

  /** Member Org APIs */
  getMemberOrgList(holdingOrgId: string) {
    return this._http
      .get<any>(`${BACKEND_URL}/memberOrgs/holdingOrg/${holdingOrgId}`)
      .pipe(
        tap((memberOrgs) => {
          this._memberOrgListListener.next(memberOrgs);
        })
      );
  }

  /** 02122020 - Gaurav - Method used by User Management Setup/List Component */
  getAllMemberOrgs() {
    return this._http.get<any>(`${BACKEND_URL}/memberOrgs`).pipe(
      tap((orgData) => {
        this._allMemberOrgsListener.next(orgData);
      })
    );
  }

  createMemberOrg(payload: any): Observable<any> {
    return this._http.post(`${BACKEND_URL}/memberOrgs`, payload);
  }

  updateMemberOrg(memberOrgId: string, payload: any): Observable<any> {
    return this._http.put(`${BACKEND_URL}/memberOrgs/${memberOrgId}`, payload);
  }

  deleteMemberOrg(memberOrgId: string): Observable<any> {
    return this._http.delete(`${BACKEND_URL}/memberOrgs/${memberOrgId}`);
  }

  /** Holding and Member Org API Listeners */
  getHoldingOrgListListener(): Observable<any> {
    return this._holdingOrgListListener.asObservable();
  }

  getDataDomainStaticsListener(): Observable<any> {
    return this._dataDomainStaticsListener.asObservable();
  }

  getMemberOrgListListener(): Observable<any> {
    return this._memberOrgListListener.asObservable();
  }

  /** 02122020 - Gaurav - Method used by User Management CRUD Component */
  getAllMemberOrgsListener(): Observable<any> {
    return this._allMemberOrgsListener.asObservable();
  }

  /** 04122020 - Gaurav - This API uses 'user APIs' and should ideally be in User Management BUT
   * have put here since it is more related to the Holding Orgs in the Client Setup feature and of no use in the User Management feature
   * 17032021 - Gaurav - JIRA-CA-226 - change per new API response struct */
  getOrgAccessInformation(holdingOrgId: string): Observable<any> {
    /** 19032021 - Gaurav - Patch fix for JIRA-CA-249 */
    if (!holdingOrgId) {
      return of({});
    }

    return this._http
      .get<any>(`${BACKEND_URL}/user/Users/orgAccess/${holdingOrgId}`)
      .pipe(
        map((response: OrgAccessInformationResponse) => {
          return response.dataDoaminConfig;
        })
      );
  }

  /** get Dshboard cofigdata */
  getDashboardConfigData(): Observable<any[]> {
    // get:/orgs/dashboard
    return this._http.get<any>(`${BACKEND_URL}/orgs/dashboardConfig`);
  }

  /** update dashboard config data */
  updateDashboardConfig(data: any): Observable<any[]> {
    // get:/orgs/dashboard
    return this._http.put<any>(`${BACKEND_URL}/orgs/dashboardConfig`, data);
  }

  // '{{api_base}}/systemConfig/default/dashboardConfig'
  updateDefaultLink(payload: object): Observable<any[]> {
    return this._http.put<any>(
      `${BACKEND_URL}/systemConfig/default/dashboardConfig`,
      payload
    );
  }

    /** get filtered dashboard config
      @params filter 
     **/
    getFilteredDashboardConfig(filter:FilterParams): Observable<any[]> {
      // get:/orgs/dashboard
      return this._http.post<any>(`${BACKEND_URL}/orgs/dashboardConfig/filter`,filter );
    }
    getSystemConfig(): Observable<any> {
      // get:/orgs/dashboard
      return this._http.get<any>(`${BACKEND_URL}/systemConfig`);
    }
}
