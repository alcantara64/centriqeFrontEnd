/** 30112020 - Gaurav - Init version: Service for User Management Feature */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';

const BACKEND_URL = `${environment.apiUrlV1}`;

@Injectable()
export class UserManagementService {
  /** Store fetched lists so that CRUD objects don't have to fetch individual record again */
  private _rolesListListener = new BehaviorSubject<any>({});
  private _usersListListener = new BehaviorSubject<any>({});

  constructor(private _http: HttpClient) {}

  /** Role APIs */
  getRolesList(): Observable<any> {
    return this._http.get<any>(`${BACKEND_URL}/user/roles`).pipe(
      tap((rolesList) => {
        this._rolesListListener.next(rolesList);
      })
    );
  }

  getRolesListListenerObs(): Observable<any> {
    /** 16032021 - Gaurav - JIRA-CA-237: Refactored to fetch the records, if observable is empty.
     * So when the browser is refreshed and any record is reloaded, it has the data which its parent 'setup list' component fetches */
    if (
      this._rolesListListener?.getValue() &&
      Object.entries(this._rolesListListener.getValue()).length > 0
    ) {
      return this._rolesListListener.asObservable();
    }

    return this.getRolesList();
  }

  addRole(payload: object) {
    return this._http.post(`${BACKEND_URL}/user/roles`, payload);
  }

  updateRole(roleId: string, payload: object) {
    return this._http.put(`${BACKEND_URL}/user/roles/${roleId}`, payload);
  }

  deleteRole(roleId: string) {
    return this._http.delete(`${BACKEND_URL}/user/roles/${roleId}`);
  }

  /** User APIs */
  getUsersList(): Observable<any> {
    return this._http.get<any>(`${BACKEND_URL}/user/users`).pipe(
      tap((usersList) => {
        this._usersListListener.next(usersList);
      })
    );
  }

  getUsersListListenerObs(): Observable<any> {
    /** 16032021 - Gaurav - JIRA-CA-237: Refactored to fetch the records, if observable is empty.
     * So when the browser is refreshed and any record is reloaded, it has the data which its parent 'setup list' component fetches */
    if (
      this._usersListListener?.getValue() &&
      Object.entries(this._usersListListener.getValue()).length > 0
    ) {
      return this._usersListListener.asObservable();
    }

    return this.getUsersList();
  }

  addUser(payload: object) {
    return this._http.post(`${BACKEND_URL}/user/users`, payload);
  }

  updateUser(userId: string, payload: object) {
    return this._http.put(`${BACKEND_URL}/user/users/${userId}`, payload);
  }

  deleteUser(userId: string) {
    return this._http.delete(`${BACKEND_URL}/user/users/${userId}`);
  }
}
