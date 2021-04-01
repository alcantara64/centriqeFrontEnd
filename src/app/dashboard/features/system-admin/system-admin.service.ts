/** 23122020 - Abhishek - Init version: Service for System Admin Feature
 * 09032021 - Gaurav - JIRA-CA-217: Call API to update Customer Attribute Group configuration
 * 17032021 - Gaurav - JIRA-CA-234
 */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';
import {
  CustomerDataAttributeEnums,
  CustomerDataAttributeGroup,
  CustomerDataAttributes,
} from '../../shared/models/data-attributes.model';

const BACKEND_URL = `${environment.apiUrlV1}`;

@Injectable()
export class SystemAdminService {
  /** Store fetched lists so that CRUD objects don't have to fetch individual record again */
  private _messagesListListener = new BehaviorSubject<any>({});
  private _messageEventsListListener = new BehaviorSubject<any>({});

  constructor(private _http: HttpClient) {}

  /** Messages APIs */
  getMessagesList() {
    return this._http.get<any>(`${BACKEND_URL}/messages`).pipe(
      tap((rolesList) => {
        this._messagesListListener.next(rolesList);
      })
    );
  }
  /** 11022021 - Ramesh - New post API */
  getMessagesListBySearch(payload: object) {
    return this._http.post<any>(`${BACKEND_URL}/messages/search`, payload);
  }
  //Message view data
  getMessageViewData(id: string) {
    return this._http.get<any>(`${BACKEND_URL}/messages/${id}`);
  }
  /** MessageEvents APIs */
  getMessageEventsList() {
    return this._http.get<any>(`${BACKEND_URL}/messageEvents`).pipe(
      tap((rolesList) => {
        this._messageEventsListListener.next(rolesList);
      })
    );
  }
  //11022021 - Ramesh - Get message event list by search -> from 'system admin'
  getMessageEventsListBySearch(payLoad: object) {
    return this._http.post<any>(`${BACKEND_URL}/messageEvents/search`, payLoad);
  }

  //get message event filterd list by its source path to sending 'comm/resp/nps', 'searchPayload'
  getCampaignMessageEvents(
    sourcepage: string,
    campId: string,
    payload: object
  ) {
    if (campId != undefined) {
      //Its navigating from 'comm/resp/nps' -> message events
      return this._http.post(
        `${BACKEND_URL}/${sourcepage}/${campId}/messageEvents/search`,
        payload
      );
    } else {
      //Its navigating from 'View luanched camp' -> message events -> messages
      return this._http.post(
        `${BACKEND_URL}/${sourcepage}/messageEvents/search`,
        payload
      );
    }
  }

  //25022021 - Ramesh - Get message event list by its source path to sending 'comm/resp/nps', 'campaignId', 'messageEventId', 'searchPayload'
  getMessagesByMessageEvents(
    source: string,
    campId: string,
    mesEventId: string,
    payLoad: object
  ) {
    if (campId != undefined) {
      //Its navigating from 'comm/resp/nps' -> message events -> messages
      return this._http.post<any>(
        `${BACKEND_URL}/${source}/${campId}/messageEvents/${mesEventId}/messages/search`,
        payLoad
      );
    } else if (source != '') {
      //Its navigating from 'View luanched camp' -> message events -> messages
      return this._http.post<any>(
        `${BACKEND_URL}/${source}/messageEvents/${mesEventId}/messages/search`,
        payLoad
      );
    } else {
      //Its navigating from 'system admin' -> message events -> messages
      return this._http.post<any>(
        `${BACKEND_URL}/messageEvents/${mesEventId}/messages/search`,
        payLoad
      );
    }
  }

  getMessagesInfoByMesEvents(
    source: string,
    campId: string,
    mesEventId: string,
    messageId: string
  ) {
    if (campId != undefined) {
      //if campId is not undefined its navigating from 'comm/resp/nps' -> message events -> messagesInfo
      return this._http.get<any>(
        `${BACKEND_URL}/${source}/${campId}/messageEvents/${mesEventId}/messages/${messageId}`
      );
    } else if (source != '') {
      //if source not is empty('') its navigating from 'View luanched camp' -> message events -> messagesInfo
      return this._http.get<any>(
        `${BACKEND_URL}/${source}/messageEvents/${mesEventId}/messages/${messageId}`
      );
    } else {
      //Its navigating from 'system admin' -> message events -> messagesInfo
      return this._http.get<any>(
        `${BACKEND_URL}/campaigns/messageEvents/${mesEventId}/messages/${messageId}`
      );
    }
  }

  //MessageEvents view APIs
  getMessageEventsView(id: string) {
    return this._http.get<any>(`${BACKEND_URL}/messageEvents/${id}`);
  }

  /** 08032021 - Gaurav - JIRA-CA-217 */
  updateCustomerDataAttributeGroups(payload: CustomerDataAttributeGroup[]) {
    return this._http.put(
      `${BACKEND_URL}/systemConfig/dataConfig/customer/dataGroups`,
      payload
    );
  }

  /** 10032021 - Gaurav - JIRA-CA-218 */
  updateCustomerDataAttributes(payload: CustomerDataAttributes[]) {
    return this._http.put(
      `${BACKEND_URL}/systemConfig/dataConfig/customer/dataAttributes`,
      payload
    );
  }

  /** 17032021 - Gaurav - JIRA-CA-234 */
  updateCustomerDataAttributeEnums(payload: CustomerDataAttributeEnums[]) {
    return this._http.put(
      `${BACKEND_URL}/systemConfig/dataConfig/customer/dataEnumTypes`,
      payload
    );
  }
}
