/** 11122020 - Gaurav - Copied Frank's code from old app source for Email Service */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { DataDomainConfig } from 'src/app/dashboard/shared/components/menu/constants.routes';

@Injectable({
  providedIn: 'root',
})
export class EmailService {
  baseUrl = environment.apiUrlV1;

  constructor(private _httpClient: HttpClient) { }

  sendEmail(postData: object) {
    /** 2020-01-06 Frank - Email endpoint does not exist anymore. Now using templateInteractive.
     * It may make sense to move this eventually to communication-ai.service.ts (also see sendDemoMessage) */
    const url = `${this.baseUrl}/messageEvents/templateInteractive`;

    //sending message based on customer preference
    (<any>postData).channelSelection = { basedOnCustomer: true }
    return this._httpClient.post(url, postData);
  }

  /** 15122020 - Frank - Special route client demo purpose */
  sendDemoMessage(dataDomain: DataDomainConfig, payload: any): Observable<any> {
    const newPayload = {dataDomain, ...payload}
    return this._httpClient.post(
      `${this.baseUrl}/messageEvents/templateInteractive`,
      newPayload
    );
  }
}
