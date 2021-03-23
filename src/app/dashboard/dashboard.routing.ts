/** 20112020 - Gaurav - Init version
 * 23112020 - Gaurav - Added Frank's feature check and added hard-coded routes to mimic the existing ones (only routes, NOT pages => since those would be new)
 * 25112020 - Gaurav - Used global constants for route links and added *** Dashboard Route Guard *** to control priviledged access to routes
 * 25112020 - Gaurav - Added components for client-setup => Holding Org routes
 * 26112020 - Gaurav - Added components for client-setup => Member Org routes
 * 27112020 - Gaurav - Added CanDeactivate for Client Setup Orgs - Add or Update process
 * 28112020 - Gaurav - Added CustomerList component for 'Client Setup => View => Customer List'
 * 09122020 - Ramesh - Added CampaignMasterSetup component for communication AI setup => View
 * 10122020 - Ramesh - Added CampaignMasterComponent for communication AI setup => View
 * 14122020 - Gaurav - Added Response AI component routes
 * 15122020 - Gaurav - Added new menu item Comm-AI => View => Customer Data
 * 16122020 - Gaurav - Change for new menu requirements in issue tracker (issue# 40)
 * 23122020 - Gaurav - New System Admin menu related changes
 */
/**
 * 23122020 - Abhishek - Added Messages component for 'System Admin => Messaging => Messages'
 * 23122020 - Abhishek - Added MessageEvents component for 'System Admin => Messaging => Message Events'
 * 29122020 - Gaurav - Added Survey components to routes
 * 04212021 - Gaurav - Added NPS related code to re-use response components
 * 14012021 - Ramesh - Added NPS routerlinks
 * 12012021 - Gaurav - Modified to enable feature-updates-guard on Survey routes
 * 29012021 - Abhishek - Added CustomerDetail component for commAi
 * 01022021 - Abhishek - Added CustomerDetail component for nps response ai and client setup
 * 09022021 - Gaurav - Added route paths for CampaignSurveyResponseComponent (Campaign Survey Response) in Response AI and NPS
 * 22022021 - Gaurav - JIRA Bug CA-158: implement feature guard for Response AI/NPS Questions create/edit page
 * 05032021 - Gaurav - JIRA-CA-154: Added route paths for pastCampaignsView/Campaign Survey Response
 *
 * 05032021 - Abhishek - Added new route for dashboard org configuaration.
 * 12082021 - Gaurav - JIRA-CA-234: System Config - UI for Customer Attribute Enum
 * 17032021 - Gaurav - JIRA-CA-234: Reverted last UI for CRUD and will create per the backend API given
 * 17032021 - Gaurav - JIRA-CA-234: Rework per new API
 * 18022021 - Abhishek - JIRA-CA-167: Render dashboards on UI ->  Added routes for analytics
 */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { isPathActive } from '../shared/util/feature.util';

import { dashboardRouteLinks as r } from './shared/components/menu/constants.routes';
import { DashboardRouteGuard } from './shared/dashboard-route-guard.service';

/** Components */
import { DashboardComponent } from './dashboard.component';
import { HomeComponent } from './home/home.component';
import { EmailTemplateSetupComponent } from './features/communication-ai/email-template-setup/email-template-setup.component';
import { EmailTemplateComponent } from './features/communication-ai/email-template/email-template.component';
import { CampaignMasterSetup } from './features/communication-ai/campaign-master-setup/campaign-master-setup.component';
import { CampaignMasterComponent } from './features/communication-ai/campaign-master/campaign-master.component';
import { ViewLanchedCampComponent } from './features/communication-ai/view-launched-camp/view-launched-camp.component';
import { UnderProgressComponent } from './features/under-progress/under-progress.component';
import { HoldingOrgSetupComponent } from './features/client-setup/holding-org-setup/holding-org-setup.component';
import { HoldingOrgComponent } from './features/client-setup/holding-org/holding-org.component';
import { MemberOrgSetupComponent } from './features/client-setup/member-org-setup/member-org-setup.component';
import { MemberOrgComponent } from './features/client-setup/member-org/member-org.component';
import { FeaturesUpdatesGuardService } from './shared/services/feature-updates-guard.service';
import { CustomerListComponent } from './shared/components/customer-list/customer-list.component';
import { RolesSetupComponent } from './features/user-management/roles-setup/roles-setup.component';
import { UsersSetupComponent } from './features/user-management/users-setup/users-setup.component';
import { RolesComponent } from './features/user-management/roles/roles.component';
import { UsersComponent } from './features/user-management/users/users.component';
import { ResponseTypeSetupComponent } from './features/response-ai/response-type-setup/response-type-setup.component';
import { ResponseTypeComponent } from './features/response-ai/response-type/response-type.component';
import { SurveySetupComponent } from './features/response-ai/survey-setup/survey-setup.component';
import { SurveyComponent } from './features/response-ai/survey/survey.component';
import { MessageEventsSetupComponent } from './features/system-admin/message-events-setup/message-events-setup.component';
import { MessagesSetupComponent } from './features/system-admin/messages-setup/messages-setup.component';
import { consoleLog } from '../shared/util/common.util';
import { CustomerDetailComponent } from './shared/components/customer-detail/customer-detail.component';
import { CampaignSurveyResponseComponent } from './features/communication-ai/campaign-survey-response/campaign-survey-response.component';
import { DashboardOrgConfigurationComponent } from './features/client-setup/dashboard-org-configuration/dashboard-org-configuration.component';
import { DataAttributesGroupComponent } from './features/system-admin/customer/data-attributes-group/data-attributes-group.component';
import { DataAttributesComponent } from './shared/components/data-attributes/data-attributes.component';
import { DataAttributeEnumsComponent } from './shared/components/data-attribute-enums/data-attribute-enums.component';

/** Placeholder Routes */
const childUnderProgressRoutes: Routes = [
  {
    path: r.PROGRESS.routerLink,
    component: UnderProgressComponent,
    children: [
      { path: r.CONFIGURATION.routerLink, component: UnderProgressComponent },
      { path: r.VIEW.routerLink, component: UnderProgressComponent },
      { path: r.ANALYTICS.routerLink, component: HomeComponent },
    ],
  },
  // {
  //   path: r.PROGRESS_ANALYTICS.routerLink,
  //   component: HomeComponent
  // }
];

/** Ask Buddy Routes */
const askBuddyRoutes: Routes = [
  {
    path: r.ASK_BUDDY_PROGRESS_ANALYTICS.routerLink,
    component: HomeComponent,
    canActivate: [DashboardRouteGuard],
  },
]
/** Communication AI Routes */
const communicationAIRoutes: Routes = [
  /** Configuration */
  {
    path: r.COMMUNICATION_MANAGE_TEMPLATE.routerLink,
    component: EmailTemplateSetupComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.COMMUNICATION_MANAGE_TEMPLATE_ADD.routerLink,
    component: EmailTemplateComponent,
    canActivate: [DashboardRouteGuard],
    canDeactivate: [FeaturesUpdatesGuardService],
  },
  {
    path: r.COMMUNICATION_MANAGE_TEMPLATE_VIEW.routerLink,
    component: EmailTemplateComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.COMMUNICATION_MANAGE_TEMPLATE_EDIT.routerLink,
    component: EmailTemplateComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.COMMUNICATION_MANAGE_TEMPLATE_COPY.routerLink,
    component: EmailTemplateComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.COMMUNICATION_MANAGE_CAMPAIGN_MASTER.routerLink,
    component: CampaignMasterSetup,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.COMMUNICATION_MANAGE_CAMPAIGN_MASTER_VIEW.routerLink,
    component: CampaignMasterComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.COMMUNICATION_MANAGE_CAMPAIGN_MASTER_ADD.routerLink,
    component: CampaignMasterComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.COMMUNICATION_MANAGE_CAMPAIGN_MASTER_EDIT.routerLink,
    component: CampaignMasterComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.COMMUNICATION_MANAGE_CAMPAIGN_MASTER_COPY.routerLink,
    component: CampaignMasterComponent,
    canActivate: [DashboardRouteGuard],
  },
  /** View */
  {
    path: r.COMMUNICATION_TEMPLATE_VIEW.routerLink,
    component: EmailTemplateSetupComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.COMMUNICATION_TEMPLATE_VIEW_VIEW.routerLink,
    component: EmailTemplateComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.COMMUNICATION_CAMPAIGN_MASTER_VIEW.routerLink,
    component: CampaignMasterSetup,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.COMMUNICATION_CAMPAIGN_MASTER_VIEW_VIEW.routerLink,
    component: CampaignMasterComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.COMMUNICATION_LAUNCHED_CAMPAIGNS_VIEW.routerLink,
    component: ViewLanchedCampComponent,
    canActivate: [DashboardRouteGuard],
  },
  /** 15122020 - Gaurav - Added Comm-AI => Customer Data link per new requirement */
  {
    path: r.COMMUNICATION_CUSTOMERLIST_VIEW.routerLink,
    component: CustomerListComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.COMMUNICATION_CUSTOMERDETAIL_VIEW.routerLink,
    component: CustomerDetailComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.COMMUNICATION_UNSUBSCRIBED_VIEW.routerLink,
    component: UnderProgressComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.COMMUNICATION_PROGRESS_ANALYTICS.routerLink,
    component: HomeComponent,
    canActivate: [DashboardRouteGuard],
  }
];

/** Response AI Routes */
const responseAIRoutes: Routes = [
  /** Configuration */
  {
    path: r.RESPONSE_MANAGE_RESPONSE_TYPES.routerLink,
    component: ResponseTypeSetupComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.RESPONSE_MANAGE_RESPONSE_TYPES_ADD.routerLink,
    component: ResponseTypeComponent,
    canActivate: [DashboardRouteGuard],
    canDeactivate: [FeaturesUpdatesGuardService],
  },
  {
    path: r.RESPONSE_MANAGE_RESPONSE_TYPES_EDIT.routerLink,
    component: ResponseTypeComponent,
    canActivate: [DashboardRouteGuard],
    canDeactivate: [FeaturesUpdatesGuardService],
  },
  {
    path: r.RESPONSE_MANAGE_RESPONSE_TYPES_COPY.routerLink,
    component: ResponseTypeComponent,
    canActivate: [DashboardRouteGuard],
    canDeactivate: [FeaturesUpdatesGuardService],
  },
  {
    path: r.RESPONSE_MANAGE_RESPONSE_TYPES_VIEW.routerLink,
    component: ResponseTypeComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.RESPONSE_MANAGE_FEEDBACK_SETUP.routerLink,
    component: SurveySetupComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.RESPONSE_MANAGE_FEEDBACK_SETUP_ADD.routerLink,
    component: SurveyComponent,
    canActivate: [DashboardRouteGuard],
    canDeactivate: [FeaturesUpdatesGuardService],
  },
  {
    path: r.RESPONSE_MANAGE_FEEDBACK_SETUP_EDIT.routerLink,
    component: SurveyComponent,
    canActivate: [DashboardRouteGuard],
    canDeactivate: [FeaturesUpdatesGuardService],
  },
  {
    path: r.RESPONSE_MANAGE_FEEDBACK_SETUP_COPY.routerLink,
    component: SurveyComponent,
    canActivate: [DashboardRouteGuard],
    canDeactivate: [FeaturesUpdatesGuardService],
  },
  {
    path: r.RESPONSE_MANAGE_FEEDBACK_SETUP_VIEW.routerLink,
    component: SurveyComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.RESPONSE_MANAGE_FEEDBACK_CAMPAIGN.routerLink,
    component: CampaignMasterSetup,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.RESPONSE_MANAGE_FEEDBACK_CAMPAIGN_ADD.routerLink,
    component: CampaignMasterComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.RESPONSE_MANAGE_FEEDBACK_CAMPAIGN_EDIT.routerLink,
    component: CampaignMasterComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.RESPONSE_MANAGE_FEEDBACK_CAMPAIGN_COPY.routerLink,
    component: CampaignMasterComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.RESPONSE_MANAGE_FEEDBACK_CAMPAIGN_VIEW.routerLink,
    component: CampaignMasterComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.RESPONSE_MANAGE_FEEDBACK_CAMPAIGN_VIEW_SURVEY_RESPONSES.routerLink,
    component: CampaignSurveyResponseComponent,
    canActivate: [DashboardRouteGuard],
  },
  /** View */
  {
    path: r.RESPONSE_RESPONSE_TYPES_VIEW.routerLink,
    component: ResponseTypeSetupComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.RESPONSE_RESPONSE_TYPES_VIEW_VIEW.routerLink,
    component: ResponseTypeComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.RESPONSE_FEEDBACK_SETUP_VIEW.routerLink,
    component: SurveySetupComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.RESPONSE_FEEDBACK_SETUP_VIEW_VIEW.routerLink,
    component: SurveyComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.RESPONSE_FEEDBACK_CAMPAIGN_VIEW.routerLink,
    component: CampaignMasterSetup,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.RESPONSE_FEEDBACK_CAMPAIGN_VIEW_VIEW.routerLink,
    component: CampaignMasterComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.RESPONSE_FEEDBACK_CAMPAIGN_VIEW_SURVEY_RESPONSES_VIEW.routerLink,
    component: CampaignSurveyResponseComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.RESPONSE_PAST_CAMPAIGNS_VIEW.routerLink,
    component: ViewLanchedCampComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.RESPONSE_PAST_CAMPAIGNS_VIEW_SURVEY_RESPONSES_VIEW.routerLink,
    component: CampaignSurveyResponseComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.RESPONSE_CUSTOMERLIST_VIEW.routerLink,
    component: CustomerListComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.RESPONSE_CUSTOMERDETAIL_VIEW.routerLink,
    component: CustomerDetailComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.RESPONSE_UNSUBSCRIBED_VIEW.routerLink,
    component: UnderProgressComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.RESPONSE_PROGRESS_ANALYTICS.routerLink,
    component: HomeComponent,
    canActivate: [DashboardRouteGuard],
  }
];

/** NPS Routes */
const npsRoutes: Routes = [
  {
    path: r.NPS_MANAGE_NPS_MASTER.routerLink,
    component: ResponseTypeSetupComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.NPS_MANAGE_NPS_MASTER_ADD.routerLink,
    component: ResponseTypeComponent,
    canActivate: [DashboardRouteGuard],
    // canDeactivate: [FeaturesUpdatesGuardService],
  },
  {
    path: r.NPS_MANAGE_NPS_MASTER_EDIT.routerLink,
    component: ResponseTypeComponent,
    canActivate: [DashboardRouteGuard],
    // canDeactivate: [FeaturesUpdatesGuardService],
  },
  {
    path: r.NPS_MANAGE_NPS_MASTER_COPY.routerLink,
    component: ResponseTypeComponent,
    canActivate: [DashboardRouteGuard],
    // canDeactivate: [FeaturesUpdatesGuardService],
  },
  {
    path: r.NPS_MANAGE_NPS_MASTER_VIEW.routerLink,
    component: ResponseTypeComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.NPS_MANAGE_NPS_SETUP.routerLink,
    component: SurveySetupComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.NPS_MANAGE_NPS_SETUP_ADD.routerLink,
    component: SurveyComponent,
    canActivate: [DashboardRouteGuard],
    canDeactivate: [FeaturesUpdatesGuardService],
  },
  {
    path: r.NPS_MANAGE_NPS_SETUP_EDIT.routerLink,
    component: SurveyComponent,
    canActivate: [DashboardRouteGuard],
    canDeactivate: [FeaturesUpdatesGuardService],
  },
  {
    path: r.NPS_MANAGE_NPS_SETUP_COPY.routerLink,
    component: SurveyComponent,
    canActivate: [DashboardRouteGuard],
    canDeactivate: [FeaturesUpdatesGuardService],
  },
  {
    path: r.NPS_MANAGE_NPS_SETUP_VIEW.routerLink,
    component: SurveyComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.NPS_MANAGE_NPS_CAMPAIGN.routerLink,
    component: CampaignMasterSetup,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.NPS_MANAGE_NPS_CAMPAIGN_ADD.routerLink,
    component: CampaignMasterComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.NPS_MANAGE_NPS_CAMPAIGN_EDIT.routerLink,
    component: CampaignMasterComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.NPS_MANAGE_NPS_CAMPAIGN_COPY.routerLink,
    component: CampaignMasterComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.NPS_MANAGE_NPS_CAMPAIGN_VIEW.routerLink,
    component: CampaignMasterComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.NPS_MANAGE_NPS_CAMPAIGN_VIEW_SURVEY_RESPONSES.routerLink,
    component: CampaignSurveyResponseComponent,
    canActivate: [DashboardRouteGuard],
  },
  /** View */
  {
    path: r.NPS_NPS_MASTER_VIEW.routerLink,
    component: CampaignMasterSetup,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.NPS_NPS_MASTER_VIEW_VIEW.routerLink,
    component: CampaignMasterComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.NPS_NPS_SETUP_VIEW.routerLink,
    component: SurveySetupComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.NPS_NPS_SETUP_VIEW_VIEW.routerLink,
    component: SurveyComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.NPS_NPS_CAMPAIGN_VIEW.routerLink,
    component: CampaignMasterSetup,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.NPS_NPS_CAMPAIGN_VIEW_VIEW.routerLink,
    component: CampaignMasterComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.NPS_NPS_CAMPAIGN_VIEW_SURVEY_RESPONSES_VIEW.routerLink,
    component: CampaignSurveyResponseComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.NPS_PAST_CAMPAIGNS_VIEW.routerLink,
    component: ViewLanchedCampComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.NPS_PAST_CAMPAIGNS_VIEW_SURVEY_RESPONSES_VIEW.routerLink,
    component: CampaignSurveyResponseComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.NPS_CUSTOMERLIST_VIEW.routerLink,
    component: CustomerListComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.NPS_CUSTOMERDETAIL_VIEW.routerLink,
    component: CustomerDetailComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.NPS_UNSUBSCRIBED_VIEW.routerLink,
    component: UnderProgressComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.NPS_PROGRESS_ANALYTICS.routerLink,
    component: HomeComponent,
    canActivate: [DashboardRouteGuard],
  }
];

// /** Market Place AI Routes */
const marketAiRoutes: Routes = [
  {
    path: r.MARKET_AI_PROGRESS_ANALYTICS.routerLink,
    component: HomeComponent,
    canActivate: [DashboardRouteGuard],
  },
]
// /** Profit Edge Routes */
const profitEdgeRoutes: Routes = [
  {
    path: r.PROFIT_EDGE_PROGRESS_ANALYTICS.routerLink,
    component: HomeComponent,
    canActivate: [DashboardRouteGuard],
  },
]
/** Insight Routes */
const insightRoutes: Routes = [
  {
    path: r.INSIGHT_BUSINESS_ANALYTICS.routerLink,
    component: UnderProgressComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.INSIGHT_PROGRESS_ANALYTICS.routerLink,
    component: HomeComponent,
    canActivate: [DashboardRouteGuard],
  }
];
/** Client Setup Routes */
const clientSetupRoutes: Routes = [
  /** Configuration */
  {
    path: r.CLIENT_SETUP_MANAGE_HOLDINGORG.routerLink,
    component: HoldingOrgSetupComponent,
    canActivate: [DashboardRouteGuard],
  },
  /** 25112020 - Gaurav - Since we are using one router-outlet in the dash component,
   * can't add children to r.CLIENT_SETUP_MANAGE_HOLDINGORG as 'add', 'edit', etc.
   * Those has to be separate routes for them to show themselves in the dash router-outlet  */
  {
    path: r.CLIENT_SETUP_MANAGE_HOLDINGORG_ADD.routerLink,
    component: HoldingOrgComponent,
    canActivate: [DashboardRouteGuard],
    canDeactivate: [FeaturesUpdatesGuardService],
  },
  {
    path: r.CLIENT_SETUP_MANAGE_HOLDINGORG_EDIT.routerLink,
    component: HoldingOrgComponent,
    canActivate: [DashboardRouteGuard],
    canDeactivate: [FeaturesUpdatesGuardService],
  },
  {
    path: r.CLIENT_SETUP_MANAGE_HOLDINGORG_VIEW.routerLink,
    component: HoldingOrgComponent,
    canActivate: [DashboardRouteGuard],
  },

  {
    path: r.CLIENT_SETUP_MANAGE_MEMBERORG.routerLink,
    component: MemberOrgSetupComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.CLIENT_SETUP_MANAGE_MEMBERORG_ADD.routerLink,
    component: MemberOrgComponent,
    canActivate: [DashboardRouteGuard],
    canDeactivate: [FeaturesUpdatesGuardService],
  },
  {
    path: r.CLIENT_SETUP_MANAGE_MEMBERORG_EDIT.routerLink,
    component: MemberOrgComponent,
    canActivate: [DashboardRouteGuard],
    canDeactivate: [FeaturesUpdatesGuardService],
  },
  {
    path: r.CLIENT_SETUP_MANAGE_MEMBERORG_VIEW.routerLink,
    component: MemberOrgComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.CLIENT_SETUP_DASHBOARD_ORG_CONFIGURATION.routerLink,
    component: DashboardOrgConfigurationComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.CLIENT_SETUP_MANAGE_LOAD_CUSTOMERDATA.routerLink,
    component: UnderProgressComponent,
    canActivate: [DashboardRouteGuard],
  },
  /** View */
  {
    path: r.CLIENT_SETUP_HOLDINGORG_VIEW.routerLink,
    component: HoldingOrgSetupComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.CLIENT_SETUP_HOLDINGORG_VIEW_VIEW.routerLink,
    component: HoldingOrgComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.CLIENT_SETUP_MEMBERORG_VIEW.routerLink,
    component: MemberOrgSetupComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.CLIENT_SETUP_MEMBERORG_VIEW_VIEW.routerLink,
    component: MemberOrgComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.CLIENT_SETUP_CUSTOMERLIST_VIEW.routerLink,
    component: CustomerListComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.CLIENT_SETUP_CUSTOMERDETAIL_VIEW.routerLink,
    component: CustomerDetailComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.CLIENT_SETUP_UNSUBSCRIBED_VIEW.routerLink,
    component: UnderProgressComponent,
    canActivate: [DashboardRouteGuard],
  },
];

/** User Management Routes */
const userManagementRoutes: Routes = [
  /** Configuration */
  {
    path: r.USER_MANAGEMENT_MANAGE_ROLES.routerLink,
    component: RolesSetupComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.USER_MANAGEMENT_MANAGE_ROLES_ADD.routerLink,
    component: RolesComponent,
    canActivate: [DashboardRouteGuard],
    canDeactivate: [FeaturesUpdatesGuardService],
  },
  {
    path: r.USER_MANAGEMENT_MANAGE_ROLES_EDIT.routerLink,
    component: RolesComponent,
    canActivate: [DashboardRouteGuard],
    canDeactivate: [FeaturesUpdatesGuardService],
  },
  {
    path: r.USER_MANAGEMENT_MANAGE_ROLES_VIEW.routerLink,
    component: RolesComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.USER_MANAGEMENT_MANAGE_USERS.routerLink,
    component: UsersSetupComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.USER_MANAGEMENT_MANAGE_USERS_ADD.routerLink,
    component: UsersComponent,
    canActivate: [DashboardRouteGuard],
    canDeactivate: [FeaturesUpdatesGuardService],
  },
  {
    path: r.USER_MANAGEMENT_MANAGE_USERS_EDIT.routerLink,
    component: UsersComponent,
    canActivate: [DashboardRouteGuard],
    canDeactivate: [FeaturesUpdatesGuardService],
  },
  {
    path: r.USER_MANAGEMENT_MANAGE_USERS_VIEW.routerLink,
    component: UsersComponent,
    canActivate: [DashboardRouteGuard],
  },
  /** View */
  {
    path: r.USER_MANAGEMENT_ROLES_VIEW.routerLink,
    component: RolesSetupComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.USER_MANAGEMENT_ROLES_VIEW_VIEW.routerLink,
    component: RolesComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.USER_MANAGEMENT_USERS_VIEW.routerLink,
    component: UsersSetupComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.USER_MANAGEMENT_USERS_VIEW_VIEW.routerLink,
    component: UsersComponent,
    canActivate: [DashboardRouteGuard],
  },
];

/** Billing Routes */
const billingRoutes: Routes = [
  {
    path: r.BILLING_CURRENT_BALANCE.routerLink,
    component: UnderProgressComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.BILLING_PAYMENT_HISTORY.routerLink,
    component: UnderProgressComponent,
    canActivate: [DashboardRouteGuard],
  },
];

/** SYS ADMIN ROUTES */
const sysAdminRoutes: Routes = [
  {
    path: r.SYSTEM_ADMIN_MANAGE_MESSAGE_EVENTS.routerLink,
    component: MessageEventsSetupComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.SYSTEM_ADMIN_MANAGE_MESSAGE_EVENTS_VIEW.routerLink,
    component: CampaignMasterComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.SYSTEM_ADMIN_MANAGE_MESSAGES.routerLink,
    component: MessagesSetupComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.SYSTEM_ADMIN_MANAGE_CUSTOMER_GROUP_ATTRIBUTES.routerLink,
    component: DataAttributesGroupComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.SYSTEM_ADMIN_MANAGE_CUSTOMER_DATA_ATTRIBUTES.routerLink,
    component: DataAttributesComponent,
    canActivate: [DashboardRouteGuard],
  },
  {
    path: r.SYSTEM_ADMIN_MANAGE_CUSTOMER_DATA_ATTRIBUTE_ENUMS.routerLink,
    component: DataAttributeEnumsComponent,
    canActivate: [DashboardRouteGuard],
  },
];

/** All Dashboard Routes
 * 24112020 - Gaurav - Fixed error to exclude any empty routes {} from the dashboardRoutes const
 */
const dashboardRoutes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      { path: '', component: HomeComponent },
      ...askBuddyRoutes,
      ...childUnderProgressRoutes,
      ...communicationAIRoutes,
      ...responseAIRoutes,
      ...npsRoutes,
      ...insightRoutes,
      ...marketAiRoutes,
      ...profitEdgeRoutes,
      ...clientSetupRoutes,
      ...userManagementRoutes,
      ...billingRoutes,
      ...sysAdminRoutes,
      { path: '**', component: UnderProgressComponent },
    ],
  },
];

/** Frank: feature check */
(function () {
  for (const dashboardRoute of dashboardRoutes) {
    const stack: Routes = [];

    stack.push(dashboardRoute);

    do {
      const currentRoute = stack.pop();

      if (currentRoute?.path) {
        const path = currentRoute.path;

        if (!isPathActive(path)) {
          currentRoute.component = UnderProgressComponent;
        }
      }

      if (currentRoute?.children) {
        currentRoute.children.forEach((v) => {
          stack.push(v);
        });
      }
    } while (stack.length > 0);
  }
})();

@NgModule({
  imports: [RouterModule.forChild(dashboardRoutes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}
