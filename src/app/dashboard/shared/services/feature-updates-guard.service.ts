/** 27112020 - Gaurav - Init version: Added guard to check for any pending user updates on Holding or Member Org Add/Edit pages,
 * and to prompt the user when the user tries to navigate */
/** 28112020 - Gaurav - Fix: CanDeactivate would be triggered when user is explicitly routed back to the Orgs page
 * after successful submission of the record in the components. Allow CanDeactivate in this case, hence the _submitMode check
 * 30112020 - Gaurav - Added User Management Add/Update components
 * 12012021 - Gaurav - Modified to add Survey component for feature-updates-guard service
 * 22022021 - Gaurav - JIRA Bug CA-158: implement this for Response AI/NPS Questions create/edit page */
import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanDeactivate,
  RouterStateSnapshot,
} from '@angular/router';

import { EmailTemplateComponent } from '../../features/communication-ai/email-template/email-template.component';
import { HoldingOrgComponent } from '../../features/client-setup/holding-org/holding-org.component';
import { MemberOrgComponent } from '../../features/client-setup/member-org/member-org.component';
import { RolesComponent } from '../../features/user-management/roles/roles.component';
import { UsersComponent } from '../../features/user-management/users/users.component';
import { SurveyComponent } from '../../features/response-ai/survey/survey.component';
import { ResponseTypeComponent } from '../../features/response-ai/response-type/response-type.component';

@Injectable()
export class FeaturesUpdatesGuardService
  implements
    CanDeactivate<
      | EmailTemplateComponent
      | HoldingOrgComponent
      | MemberOrgComponent
      | RolesComponent
      | UsersComponent
      | SurveyComponent
      | ResponseTypeComponent
    > {
  async canDeactivate(
    component:
      | EmailTemplateComponent
      | HoldingOrgComponent
      | MemberOrgComponent
      | RolesComponent
      | UsersComponent
      | SurveyComponent
      | ResponseTypeComponent,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot
  ): Promise<boolean> {
    if (component.isSubMitMode()) return true;
    return component.onUserNavigation(currentRoute, currentState);
  }
}
