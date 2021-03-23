/** 23112020 - Gaurav - Init Version
 * Export the constant values gesperrtes Objekt :) for the dashboard route linkes (absolute).
 * 24112020 - Gaurav - Export ENUM of available dash menus and access categories
 * 25112020 - Gaurav - Modified dashboardRouteLinks object to add 'requiredPrivilege' for Dasboard Route Guard specific requirements
 * 01122020 - Gaurav - Export privileges array
 * 14122020 - Gaurav - Added/Modified routes for Response AI components
 * 16122020 - Gaurav - Change for new menu requirements in issue tracker (issue# 40)
 * 23122020 - Gaurav - New System Admin menu related changes
 * 04012021 - Gaurav - Added NPS routerlinks
 * 14012021 - Ramesh - Modified NPS routerlinks
 * 09022021 - Gaurav - Added routerlinks for Campaign Survey Response in Response AI and NPS:
 * RESPONSE_MANAGE_FEEDBACK_CAMPAIGN_VIEW_SURVEY_RESPONSES & NPS_MANAGE_NPS_CAMPAIGN_VIEW_SURVEY_RESPONSES
 * 05032021 - Gaurav - JIRA-CA-154: Added routerlinks for pastCampaignsView/Campaign Survey Response
 * 05032021 - Abhishek - Added CLIENT_SETUP_DASHBOARD_ORG_CONFIGURATION new constant route for dashboard org configuration.
 * 08032021 - Gaurav - JIRA-CA-217: System Config - Customer Data Attribute
 * 12082021 - Gaurav - JIRA-CA-234: System Config - UI for Customer Attribute Enum
 * 15032021 - Gaurav - JIRA-CA-234: Added Enum AccessModes
 * 17032021 - Gaurav - JIRA-CA-234: Reverted last UI for CRUD and will create per the backend API given
 * 18022021 - Abhishek - JIRA-CA-167: Render dashboards on UI -> Added analytics routes.
 * */

export enum AccessModes {
  PreAdd = 'PreAdd',
  Add = 'Add',
  Edit = 'Edit',
  Copy = 'Copy',
  View = 'View',
}

/** An enum of dash menus to avoid typing-errors */
export enum DashboardMenuEnum {
  HOME = 'HOME',
  ASK_BUDDY = 'ASK_BUDDY',
  COMM_AI = 'COMM_AI',
  RESP_AI = 'RESP_AI',
  NPS = 'NPS',
  MARKET_AI = 'MARKET_AI',
  PROF_EDGE = 'PROF_EDGE',
  INSIGHT = 'INSIGHT',
  CLIENT_SETUP = 'CLIENT_SETUP',
  USER_ADMIN = 'USER_ADMIN',
  BILLING = 'BILLING',
  SYSTEM_ADMIN = 'SYSTEM_ADMIN',
}

export enum MenuAccessEnum {
  EDIT = 'EDIT',
  VIEW = 'VIEW',
  ANALYTICS = 'ANALYTICS',
}

/** 15122020 - Gaurav - Added for uniformity and to prevent any inadvertent typing mistakes when used */
export enum DataDomainConfig {
  communication = 'communication',
  cost = 'cost',
  customer = 'customer',
  marketPlace = 'marketPlace',
  nps = 'nps',
  product = 'product',
  profitEdge = 'profitEdge',
  response = 'response',
  revenue = 'revenue',
}

const backendMappedPrivileges = [
  `${DashboardMenuEnum.ASK_BUDDY}_${MenuAccessEnum.ANALYTICS}`,
  `${DashboardMenuEnum.BILLING}_${MenuAccessEnum.ANALYTICS}`,
  `${DashboardMenuEnum.BILLING}_${MenuAccessEnum.EDIT}`,
  `${DashboardMenuEnum.BILLING}_${MenuAccessEnum.VIEW}`,
  `${DashboardMenuEnum.CLIENT_SETUP}_${MenuAccessEnum.ANALYTICS}`,
  `${DashboardMenuEnum.CLIENT_SETUP}_${MenuAccessEnum.EDIT}`,
  `${DashboardMenuEnum.CLIENT_SETUP}_${MenuAccessEnum.VIEW}`,
  `${DashboardMenuEnum.COMM_AI}_${MenuAccessEnum.ANALYTICS}`,
  `${DashboardMenuEnum.COMM_AI}_${MenuAccessEnum.EDIT}`,
  `${DashboardMenuEnum.COMM_AI}_${MenuAccessEnum.VIEW}`,
  `${DashboardMenuEnum.INSIGHT}_${MenuAccessEnum.ANALYTICS}`,
  `${DashboardMenuEnum.MARKET_AI}_${MenuAccessEnum.ANALYTICS}`,
  `${DashboardMenuEnum.MARKET_AI}_${MenuAccessEnum.EDIT}`,
  `${DashboardMenuEnum.MARKET_AI}_${MenuAccessEnum.VIEW}`,
  `${DashboardMenuEnum.NPS}_${MenuAccessEnum.ANALYTICS}`,
  `${DashboardMenuEnum.NPS}_${MenuAccessEnum.EDIT}`,
  `${DashboardMenuEnum.NPS}_${MenuAccessEnum.VIEW}`,
  `${DashboardMenuEnum.PROF_EDGE}_${MenuAccessEnum.ANALYTICS}`,
  `${DashboardMenuEnum.PROF_EDGE}_${MenuAccessEnum.EDIT}`,
  `${DashboardMenuEnum.PROF_EDGE}_${MenuAccessEnum.VIEW}`,
  `${DashboardMenuEnum.RESP_AI}_${MenuAccessEnum.ANALYTICS}`,
  `${DashboardMenuEnum.RESP_AI}_${MenuAccessEnum.EDIT}`,
  `${DashboardMenuEnum.RESP_AI}_${MenuAccessEnum.VIEW}`,
  `${DashboardMenuEnum.SYSTEM_ADMIN}_${MenuAccessEnum.EDIT}`,
  `${DashboardMenuEnum.SYSTEM_ADMIN}_${MenuAccessEnum.VIEW}`,
  `${DashboardMenuEnum.USER_ADMIN}_${MenuAccessEnum.ANALYTICS}`,
  `${DashboardMenuEnum.USER_ADMIN}_${MenuAccessEnum.EDIT}`,
  `${DashboardMenuEnum.USER_ADMIN}_${MenuAccessEnum.VIEW}`,
];

/** Send a copy to avoid any edits */
export const privileges = [...backendMappedPrivileges];

// TODO 15032021 - Gaurav - move dashboardRouteLinks to a one instance class or service
export const dashboardRouteLinks = Object.freeze({
  /** PLACEHOLDER ROUTES */
  PROGRESS: {
    routerLink: 'progress',
    requiredPrivilege: null,
    linkName: '',
  },
  CONFIGURATION: {
    routerLink: 'configuration',
    requiredPrivilege: null,
    linkName: 'Configuration',
  },
  VIEW: {
    routerLink: 'view',
    requiredPrivilege: null,
    linkName: 'View',
  },
  ANALYTICS: {
    routerLink: 'analytics',
    requiredPrivilege: null,
    linkName: 'Analytics',
  },
  PROGRESS_CONFIGURATION: {
    routerLink: 'progress/configuration',
    requiredPrivilege: null,
    linkName: 'Configuration',
  },
  PROGRESS_VIEW: {
    routerLink: 'progress/view',
    requiredPrivilege: null,
    linkName: 'View',
  },
  PROGRESS_ANALYTICS: {
    routerLink: 'progress/analytics',
    requiredPrivilege: null,
    linkName: 'Analytics',
  },
  /** ASK BUDDY ROUTES: TODO */
  ASK_BUDDY_PROGRESS_ANALYTICS: {
    routerLink: 'askBuddy/progress/analytics',
    requiredPrivilege: null,
    linkName: 'Analytics',
  },
  /** COMMUNICATION AI ROUTES */
  /** Manage */
  COMMUNICATION_MANAGE_TEMPLATE: {
    routerLink: 'communicationAI/manageMessageTemplate',
    requiredPrivilege: `${DashboardMenuEnum.COMM_AI}_${MenuAccessEnum.EDIT}`,
    linkName: 'Manage Message Template',
  },
  COMMUNICATION_MANAGE_TEMPLATE_ADD: {
    routerLink: 'communicationAI/manageMessageTemplate/add',
    requiredPrivilege: `${DashboardMenuEnum.COMM_AI}_${MenuAccessEnum.EDIT}`,
    linkName: '',
  },
  COMMUNICATION_MANAGE_TEMPLATE_VIEW: {
    routerLink: 'communicationAI/manageMessageTemplate/view/:id',
    requiredPrivilege: `${DashboardMenuEnum.COMM_AI}_${MenuAccessEnum.EDIT}`,
    linkName: '',
  },
  COMMUNICATION_MANAGE_TEMPLATE_EDIT: {
    routerLink: 'communicationAI/manageMessageTemplate/edit/:id',
    requiredPrivilege: `${DashboardMenuEnum.COMM_AI}_${MenuAccessEnum.EDIT}`,
    linkName: '',
  },
  COMMUNICATION_MANAGE_TEMPLATE_COPY: {
    routerLink: 'communicationAI/manageMessageTemplate/copy/:id',
    requiredPrivilege: `${DashboardMenuEnum.COMM_AI}_${MenuAccessEnum.EDIT}`,
    linkName: '',
  },
  COMMUNICATION_MANAGE_CAMPAIGN_MASTER: {
    routerLink: 'communicationAI/messageCampaignMaster',
    requiredPrivilege: `${DashboardMenuEnum.COMM_AI}_${MenuAccessEnum.EDIT}`,
    linkName: 'Message Campaign Master',
  },
  COMMUNICATION_MANAGE_CAMPAIGN_MASTER_VIEW: {
    routerLink: 'communicationAI/messageCampaignMaster/view/:id',
    requiredPrivilege: `${DashboardMenuEnum.COMM_AI}_${MenuAccessEnum.EDIT}`,
    linkName: '',
  },
  COMMUNICATION_MANAGE_CAMPAIGN_MASTER_ADD: {
    routerLink: 'communicationAI/messageCampaignMaster/add',
    requiredPrivilege: `${DashboardMenuEnum.COMM_AI}_${MenuAccessEnum.EDIT}`,
    linkName: '',
  },
  COMMUNICATION_MANAGE_CAMPAIGN_MASTER_EDIT: {
    routerLink: 'communicationAI/messageCampaignMaster/edit/:id',
    requiredPrivilege: `${DashboardMenuEnum.COMM_AI}_${MenuAccessEnum.EDIT}`,
    linkName: '',
  },
  COMMUNICATION_MANAGE_CAMPAIGN_MASTER_COPY: {
    routerLink: 'communicationAI/messageCampaignMaster/copy/:id',
    requiredPrivilege: `${DashboardMenuEnum.COMM_AI}_${MenuAccessEnum.EDIT}`,
    linkName: '',
  },
  /** View */
  COMMUNICATION_TEMPLATE_VIEW: {
    routerLink: 'communicationAI/messageTemplateView',
    requiredPrivilege: `${DashboardMenuEnum.COMM_AI}_${MenuAccessEnum.VIEW}`,
    linkName: 'View Message Template',
  },
  COMMUNICATION_TEMPLATE_VIEW_VIEW: {
    routerLink: 'communicationAI/messageTemplateView/view/:id',
    requiredPrivilege: `${DashboardMenuEnum.COMM_AI}_${MenuAccessEnum.VIEW}`,
    linkName: '',
  },
  COMMUNICATION_CAMPAIGN_MASTER_VIEW: {
    routerLink: 'communicationAI/messageCampaignMasterView',
    requiredPrivilege: `${DashboardMenuEnum.COMM_AI}_${MenuAccessEnum.VIEW}`,
    linkName: 'View Message Campaign Master',
  },
  COMMUNICATION_CAMPAIGN_MASTER_VIEW_VIEW: {
    routerLink: 'communicationAI/messageCampaignMasterView/view/:id',
    requiredPrivilege: `${DashboardMenuEnum.COMM_AI}_${MenuAccessEnum.VIEW}`,
    linkName: '',
  },
  COMMUNICATION_LAUNCHED_CAMPAIGNS_VIEW: {
    routerLink: 'communicationAI/launchedCampaignsView',
    requiredPrivilege: `${DashboardMenuEnum.COMM_AI}_${MenuAccessEnum.VIEW}`,
    linkName: 'View Launched Campaigns',
  },
  /** 15122020 - Gaurav - Added Comm-AI => Customer Data link per new requirement */
  /** 29012021 - Abhishek - Changes route Name */
  COMMUNICATION_CUSTOMERLIST_VIEW: {
    routerLink: 'communicationAI/customerList',
    requiredPrivilege: `${DashboardMenuEnum.COMM_AI}_${MenuAccessEnum.VIEW}`,
    linkName: 'Customer Data',
  },
  /** 29012021 - Abhishek - Added Comm-AI => Customer detail view per new requirement */
  COMMUNICATION_CUSTOMERDETAIL_VIEW: {
    routerLink: 'communicationAI/customerList/view/:id',
    requiredPrivilege: `${DashboardMenuEnum.COMM_AI}_${MenuAccessEnum.VIEW}`,
    linkName: 'Customer Data',
  },
  COMMUNICATION_UNSUBSCRIBED_VIEW: {
    routerLink: 'communicationAI/unsubscribedListView',
    requiredPrivilege: `${DashboardMenuEnum.COMM_AI}_${MenuAccessEnum.VIEW}`,
    linkName: 'Unsubscribed List',
  },
  COMMUNICATION_PROGRESS_ANALYTICS: {
    routerLink: 'comm/progress/analytics',
    requiredPrivilege: null,
    linkName: 'Analytics',
  },
  /** RESPONSE AI ROUTES */
  RESPONSE_MANAGE_RESPONSE_TYPES: {
    routerLink: 'responseAI/manageFeedbackMaster',
    requiredPrivilege: `${DashboardMenuEnum.RESP_AI}_${MenuAccessEnum.EDIT}`,
    linkName: 'Manage Question Repository',
  },
  RESPONSE_MANAGE_RESPONSE_TYPES_ADD: {
    routerLink: 'responseAI/manageFeedbackMaster/add',
    requiredPrivilege: `${DashboardMenuEnum.RESP_AI}_${MenuAccessEnum.EDIT}`,
    linkName: '',
  },
  RESPONSE_MANAGE_RESPONSE_TYPES_EDIT: {
    routerLink: 'responseAI/manageFeedbackMaster/edit/:id',
    requiredPrivilege: `${DashboardMenuEnum.RESP_AI}_${MenuAccessEnum.EDIT}`,
    linkName: '',
  },
  RESPONSE_MANAGE_RESPONSE_TYPES_COPY: {
    routerLink: 'responseAI/manageFeedbackMaster/copy/:id',
    requiredPrivilege: `${DashboardMenuEnum.RESP_AI}_${MenuAccessEnum.EDIT}`,
    linkName: '',
  },
  RESPONSE_MANAGE_RESPONSE_TYPES_VIEW: {
    routerLink: 'responseAI/manageFeedbackMaster/view/:id',
    requiredPrivilege: `${DashboardMenuEnum.RESP_AI}_${MenuAccessEnum.EDIT}`,
    linkName: '',
  },
  RESPONSE_MANAGE_FEEDBACK_SETUP: {
    routerLink: 'responseAI/manageFeedbackSetup',
    requiredPrivilege: `${DashboardMenuEnum.RESP_AI}_${MenuAccessEnum.EDIT}`,
    linkName: 'Manage Surveys',
  },
  RESPONSE_MANAGE_FEEDBACK_SETUP_ADD: {
    routerLink: 'responseAI/manageFeedbackSetup/add',
    requiredPrivilege: `${DashboardMenuEnum.RESP_AI}_${MenuAccessEnum.EDIT}`,
    linkName: '',
  },
  RESPONSE_MANAGE_FEEDBACK_SETUP_EDIT: {
    routerLink: 'responseAI/manageFeedbackSetup/edit/:id',
    requiredPrivilege: `${DashboardMenuEnum.RESP_AI}_${MenuAccessEnum.EDIT}`,
    linkName: '',
  },
  RESPONSE_MANAGE_FEEDBACK_SETUP_COPY: {
    routerLink: 'responseAI/manageFeedbackSetup/copy/:id',
    requiredPrivilege: `${DashboardMenuEnum.RESP_AI}_${MenuAccessEnum.EDIT}`,
    linkName: '',
  },
  RESPONSE_MANAGE_FEEDBACK_SETUP_VIEW: {
    routerLink: 'responseAI/manageFeedbackSetup/view/:id',
    requiredPrivilege: `${DashboardMenuEnum.RESP_AI}_${MenuAccessEnum.EDIT}`,
    linkName: '',
  },
  RESPONSE_MANAGE_FEEDBACK_CAMPAIGN: {
    routerLink: 'responseAI/feedbackCampaignMaster',
    requiredPrivilege: `${DashboardMenuEnum.RESP_AI}_${MenuAccessEnum.EDIT}`,
    linkName: 'Survey Campaign Master',
  },
  RESPONSE_MANAGE_FEEDBACK_CAMPAIGN_ADD: {
    routerLink: 'responseAI/feedbackCampaignMaster/add',
    requiredPrivilege: `${DashboardMenuEnum.RESP_AI}_${MenuAccessEnum.EDIT}`,
    linkName: '',
  },
  RESPONSE_MANAGE_FEEDBACK_CAMPAIGN_EDIT: {
    routerLink: 'responseAI/feedbackCampaignMaster/edit/:id',
    requiredPrivilege: `${DashboardMenuEnum.RESP_AI}_${MenuAccessEnum.EDIT}`,
    linkName: '',
  },
  RESPONSE_MANAGE_FEEDBACK_CAMPAIGN_COPY: {
    routerLink: 'responseAI/feedbackCampaignMaster/copy/:id',
    requiredPrivilege: `${DashboardMenuEnum.RESP_AI}_${MenuAccessEnum.EDIT}`,
    linkName: '',
  },
  RESPONSE_MANAGE_FEEDBACK_CAMPAIGN_VIEW: {
    routerLink: 'responseAI/feedbackCampaignMaster/view/:id',
    requiredPrivilege: `${DashboardMenuEnum.RESP_AI}_${MenuAccessEnum.EDIT}`,
    linkName: '',
  },
  RESPONSE_MANAGE_FEEDBACK_CAMPAIGN_VIEW_SURVEY_RESPONSES: {
    routerLink: 'responseAI/feedbackCampaignMaster/viewSurveyResponses/:id',
    requiredPrivilege: `${DashboardMenuEnum.RESP_AI}_${MenuAccessEnum.EDIT}`,
    linkName: '',
  },
  /** View */
  RESPONSE_RESPONSE_TYPES_VIEW: {
    routerLink: 'responseAI/feedbackMasterView',
    requiredPrivilege: `${DashboardMenuEnum.RESP_AI}_${MenuAccessEnum.VIEW}`,
    linkName: 'View Question Repository',
  },
  RESPONSE_RESPONSE_TYPES_VIEW_VIEW: {
    routerLink: 'responseAI/feedbackMasterView/view/:id',
    requiredPrivilege: `${DashboardMenuEnum.RESP_AI}_${MenuAccessEnum.VIEW}`,
    linkName: '',
  },
  RESPONSE_FEEDBACK_SETUP_VIEW: {
    routerLink: 'responseAI/feedbackSetupView',
    requiredPrivilege: `${DashboardMenuEnum.RESP_AI}_${MenuAccessEnum.VIEW}`,
    linkName: 'View Surveys',
  },
  RESPONSE_FEEDBACK_SETUP_VIEW_VIEW: {
    routerLink: 'responseAI/feedbackSetupView/view/:id',
    requiredPrivilege: `${DashboardMenuEnum.RESP_AI}_${MenuAccessEnum.VIEW}`,
    linkName: '',
  },
  RESPONSE_FEEDBACK_CAMPAIGN_VIEW: {
    routerLink: 'responseAI/feedbackCampaignMasterView',
    requiredPrivilege: `${DashboardMenuEnum.RESP_AI}_${MenuAccessEnum.VIEW}`,
    linkName: 'View Survey Campaign Master',
  },
  RESPONSE_FEEDBACK_CAMPAIGN_VIEW_VIEW: {
    routerLink: 'responseAI/feedbackCampaignMasterView/view/:id',
    requiredPrivilege: `${DashboardMenuEnum.RESP_AI}_${MenuAccessEnum.VIEW}`,
    linkName: '',
  },
  RESPONSE_FEEDBACK_CAMPAIGN_VIEW_SURVEY_RESPONSES_VIEW: {
    routerLink: 'responseAI/feedbackCampaignMasterView/viewSurveyResponses/:id',
    requiredPrivilege: `${DashboardMenuEnum.RESP_AI}_${MenuAccessEnum.VIEW}`,
    linkName: '',
  },
  RESPONSE_PAST_CAMPAIGNS_VIEW: {
    routerLink: 'responseAI/pastCampaignsView',
    requiredPrivilege: `${DashboardMenuEnum.RESP_AI}_${MenuAccessEnum.VIEW}`,
    linkName: 'View Launched Survey Campaigns',
  },
  RESPONSE_PAST_CAMPAIGNS_VIEW_SURVEY_RESPONSES_VIEW: {
    routerLink: 'responseAI/pastCampaignsView/viewSurveyResponses/:id',
    requiredPrivilege: `${DashboardMenuEnum.RESP_AI}_${MenuAccessEnum.VIEW}`,
    linkName: '',
  },
  RESPONSE_CUSTOMERLIST_VIEW: {
    routerLink: 'responseAI/customerList',
    requiredPrivilege: `${DashboardMenuEnum.RESP_AI}_${MenuAccessEnum.VIEW}`,
    linkName: 'Customer Data',
  },
  /** 01022021 - Abhishek - Added Response - AI => Customer detail view per new requirement */
  RESPONSE_CUSTOMERDETAIL_VIEW: {
    routerLink: 'responseAI/customerList/view/:id',
    requiredPrivilege: `${DashboardMenuEnum.RESP_AI}_${MenuAccessEnum.VIEW}`,
    linkName: 'Customer Data',
  },
  RESPONSE_UNSUBSCRIBED_VIEW: {
    routerLink: 'responseAI/unsubscribedListView',
    requiredPrivilege: `${DashboardMenuEnum.RESP_AI}_${MenuAccessEnum.VIEW}`,
    linkName: 'Unsubscribed List',
  },
  RESPONSE_PROGRESS_ANALYTICS: {
    routerLink: 'resp/progress/analytics',
    requiredPrivilege: null,
    linkName: 'Analytics',
  },
  /** NPS ROUTES */
  NPS_MANAGE_NPS_MASTER: {
    routerLink: 'nps/manageNPSMaster',
    requiredPrivilege: `${DashboardMenuEnum.NPS}_${MenuAccessEnum.EDIT}`,
    linkName: 'Manage NPS Repository',
  },
  NPS_MANAGE_NPS_MASTER_ADD: {
    routerLink: 'nps/manageNPSMaster/add',
    requiredPrivilege: `${DashboardMenuEnum.NPS}_${MenuAccessEnum.EDIT}`,
    linkName: '',
  },
  NPS_MANAGE_NPS_MASTER_EDIT: {
    routerLink: 'nps/manageNPSMaster/edit/:id',
    requiredPrivilege: `${DashboardMenuEnum.NPS}_${MenuAccessEnum.EDIT}`,
    linkName: '',
  },
  NPS_MANAGE_NPS_MASTER_COPY: {
    routerLink: 'nps/manageNPSMaster/copy/:id',
    requiredPrivilege: `${DashboardMenuEnum.NPS}_${MenuAccessEnum.EDIT}`,
    linkName: '',
  },
  NPS_MANAGE_NPS_MASTER_VIEW: {
    routerLink: 'nps/manageNPSMaster/view/:id',
    requiredPrivilege: `${DashboardMenuEnum.NPS}_${MenuAccessEnum.EDIT}`,
    linkName: '',
  },
  NPS_MANAGE_NPS_SETUP: {
    routerLink: 'nps/manageNPSSetup',
    requiredPrivilege: `${DashboardMenuEnum.NPS}_${MenuAccessEnum.EDIT}`,
    linkName: 'Manage NPS Questionnaire',
  },
  NPS_MANAGE_NPS_SETUP_ADD: {
    routerLink: 'nps/manageNPSSetup/add',
    requiredPrivilege: `${DashboardMenuEnum.NPS}_${MenuAccessEnum.EDIT}`,
    linkName: '',
  },
  NPS_MANAGE_NPS_SETUP_EDIT: {
    routerLink: 'nps/manageNPSSetup/edit/:id',
    requiredPrivilege: `${DashboardMenuEnum.NPS}_${MenuAccessEnum.EDIT}`,
    linkName: '',
  },
  NPS_MANAGE_NPS_SETUP_COPY: {
    routerLink: 'nps/manageNPSSetup/copy/:id',
    requiredPrivilege: `${DashboardMenuEnum.NPS}_${MenuAccessEnum.EDIT}`,
    linkName: '',
  },
  NPS_MANAGE_NPS_SETUP_VIEW: {
    routerLink: 'nps/manageNPSSetup/view/:id',
    requiredPrivilege: `${DashboardMenuEnum.NPS}_${MenuAccessEnum.EDIT}`,
    linkName: '',
  },
  NPS_MANAGE_NPS_CAMPAIGN: {
    routerLink: 'nps/manageNPSCampaign',
    requiredPrivilege: `${DashboardMenuEnum.NPS}_${MenuAccessEnum.EDIT}`,
    linkName: 'NPS Campaign Master',
  },
  NPS_MANAGE_NPS_CAMPAIGN_ADD: {
    routerLink: 'nps/manageNPSCampaign/add',
    requiredPrivilege: `${DashboardMenuEnum.NPS}_${MenuAccessEnum.EDIT}`,
    linkName: '',
  },
  NPS_MANAGE_NPS_CAMPAIGN_EDIT: {
    routerLink: 'nps/manageNPSCampaign/edit/:id',
    requiredPrivilege: `${DashboardMenuEnum.NPS}_${MenuAccessEnum.EDIT}`,
    linkName: '',
  },
  NPS_MANAGE_NPS_CAMPAIGN_COPY: {
    routerLink: 'nps/manageNPSCampaign/copy/:id',
    requiredPrivilege: `${DashboardMenuEnum.NPS}_${MenuAccessEnum.EDIT}`,
    linkName: '',
  },
  NPS_MANAGE_NPS_CAMPAIGN_VIEW: {
    routerLink: 'nps/manageNPSCampaign/view/:id',
    requiredPrivilege: `${DashboardMenuEnum.NPS}_${MenuAccessEnum.EDIT}`,
    linkName: '',
  },
  NPS_MANAGE_NPS_CAMPAIGN_VIEW_SURVEY_RESPONSES: {
    routerLink: 'nps/manageNPSCampaign/viewSurveyResponses/:id',
    requiredPrivilege: `${DashboardMenuEnum.NPS}_${MenuAccessEnum.EDIT}`,
    linkName: '',
  },
  /** View */
  NPS_NPS_MASTER_VIEW: {
    routerLink: 'nps/npsMasterView',
    requiredPrivilege: `${DashboardMenuEnum.NPS}_${MenuAccessEnum.VIEW}`,
    linkName: 'View NPS Repository',
  },
  NPS_NPS_MASTER_VIEW_VIEW: {
    routerLink: 'nps/npsMasterView/view/:id',
    requiredPrivilege: `${DashboardMenuEnum.NPS}_${MenuAccessEnum.VIEW}`,
    linkName: '',
  },
  NPS_NPS_SETUP_VIEW: {
    routerLink: 'nps/npsSetupView',
    requiredPrivilege: `${DashboardMenuEnum.NPS}_${MenuAccessEnum.VIEW}`,
    linkName: 'View NPS Questionnaire',
  },
  NPS_NPS_SETUP_VIEW_VIEW: {
    routerLink: 'nps/npsSetupView/view/:id',
    requiredPrivilege: `${DashboardMenuEnum.NPS}_${MenuAccessEnum.VIEW}`,
    linkName: '',
  },
  NPS_NPS_CAMPAIGN_VIEW: {
    routerLink: 'nps/npsCampaignView',
    requiredPrivilege: `${DashboardMenuEnum.NPS}_${MenuAccessEnum.VIEW}`,
    linkName: 'View NPS Campaign Master',
  },
  NPS_NPS_CAMPAIGN_VIEW_VIEW: {
    routerLink: 'nps/npsCampaignView/view/:id',
    requiredPrivilege: `${DashboardMenuEnum.NPS}_${MenuAccessEnum.VIEW}`,
    linkName: '',
  },
  NPS_NPS_CAMPAIGN_VIEW_SURVEY_RESPONSES_VIEW: {
    routerLink: 'nps/npsCampaignView/viewSurveyResponses/:id',
    requiredPrivilege: `${DashboardMenuEnum.NPS}_${MenuAccessEnum.VIEW}`,
    linkName: '',
  },
  NPS_PAST_CAMPAIGNS_VIEW: {
    routerLink: 'nps/pastCampaignsView',
    requiredPrivilege: `${DashboardMenuEnum.NPS}_${MenuAccessEnum.VIEW}`,
    linkName: 'View Launched NPS Campaigns',
  },
  NPS_PAST_CAMPAIGNS_VIEW_SURVEY_RESPONSES_VIEW: {
    routerLink: 'nps/pastCampaignsView/viewSurveyResponses/:id',
    requiredPrivilege: `${DashboardMenuEnum.NPS}_${MenuAccessEnum.VIEW}`,
    linkName: '',
  },
  NPS_CUSTOMERLIST_VIEW: {
    routerLink: 'nps/customerList',
    requiredPrivilege: `${DashboardMenuEnum.NPS}_${MenuAccessEnum.VIEW}`,
    linkName: 'Customer Data',
  },
  /** 01022021 - Abhishek - Added NPS => Customer detail view per new requirement */
  NPS_CUSTOMERDETAIL_VIEW: {
    routerLink: 'nps/customerList/view/:id',
    requiredPrivilege: `${DashboardMenuEnum.NPS}_${MenuAccessEnum.VIEW}`,
    linkName: 'Customer Data',
  },
  NPS_UNSUBSCRIBED_VIEW: {
    routerLink: 'nps/unsubscribedListView',
    requiredPrivilege: `${DashboardMenuEnum.NPS}_${MenuAccessEnum.VIEW}`,
    linkName: 'Unsubscribed List',
  },
  NPS_PROGRESS_ANALYTICS: {
    routerLink: 'nps/progress/analytics',
    requiredPrivilege: null,
    linkName: 'Analytics',
  },
  /** MARKET PLACE AI ROUTES: TODO */
  MARKET_AI_PROGRESS_ANALYTICS: {
    routerLink: 'marketAI/progress/analytics',
    requiredPrivilege: null,
    linkName: 'Analytics',
  },
  /** PROFIT EDGE ROUTES: TODO */
  PROFIT_EDGE_PROGRESS_ANALYTICS: {
    routerLink: 'profitEdge/progress/analytics',
    requiredPrivilege: null,
    linkName: 'Analytics',
  },
  /** INSIGHT ROUTES */
  INSIGHT_BUSINESS_ANALYTICS: {
    routerLink: 'insight/businessAnalytics',
    requiredPrivilege: `${DashboardMenuEnum.INSIGHT}_${MenuAccessEnum.ANALYTICS}`,
    linkName: 'Business Insight Analytics',
  },
  INSIGHT_PROGRESS_ANALYTICS: {
    routerLink: 'insight/progress/analytics',
    requiredPrivilege: null,
    linkName: 'Analytics',
  },
  /** CLIENT SETUP ROUTES */
  CLIENT_SETUP_MANAGE_HOLDINGORG: {
    routerLink: 'clientSetup/holdingOrg',
    requiredPrivilege: `${DashboardMenuEnum.CLIENT_SETUP}_${MenuAccessEnum.EDIT}`,
    linkName: 'Holding Organization Setup',
  },
  CLIENT_SETUP_MANAGE_HOLDINGORG_ADD: {
    routerLink: 'clientSetup/holdingOrg/add',
    requiredPrivilege: `${DashboardMenuEnum.CLIENT_SETUP}_${MenuAccessEnum.EDIT}`,
    linkName: '',
  },
  CLIENT_SETUP_MANAGE_HOLDINGORG_EDIT: {
    routerLink: 'clientSetup/holdingOrg/edit/:id',
    requiredPrivilege: `${DashboardMenuEnum.CLIENT_SETUP}_${MenuAccessEnum.EDIT}`,
    linkName: '',
  },
  CLIENT_SETUP_MANAGE_HOLDINGORG_VIEW: {
    routerLink: 'clientSetup/holdingOrg/view/:id',
    requiredPrivilege: `${DashboardMenuEnum.CLIENT_SETUP}_${MenuAccessEnum.EDIT}`,
    linkName: '',
  },
  CLIENT_SETUP_MANAGE_MEMBERORG: {
    routerLink: 'clientSetup/memberOrg',
    requiredPrivilege: `${DashboardMenuEnum.CLIENT_SETUP}_${MenuAccessEnum.EDIT}`,
    linkName: 'Member Organization Setup',
  },
  CLIENT_SETUP_MANAGE_MEMBERORG_ADD: {
    routerLink: 'clientSetup/memberOrg/add',
    requiredPrivilege: `${DashboardMenuEnum.CLIENT_SETUP}_${MenuAccessEnum.EDIT}`,
    linkName: '',
  },
  CLIENT_SETUP_MANAGE_MEMBERORG_EDIT: {
    routerLink: 'clientSetup/memberOrg/edit/:id',
    requiredPrivilege: `${DashboardMenuEnum.CLIENT_SETUP}_${MenuAccessEnum.EDIT}`,
    linkName: '',
  },
  CLIENT_SETUP_MANAGE_MEMBERORG_VIEW: {
    routerLink: 'clientSetup/memberOrg/view/:id',
    requiredPrivilege: `${DashboardMenuEnum.CLIENT_SETUP}_${MenuAccessEnum.EDIT}`,
    linkName: '',
  },
  CLIENT_SETUP_DASHBOARD_ORG_CONFIGURATION: {
    routerLink: 'clientSetup/dashboardOrgConfiguration',
    requiredPrivilege: `${DashboardMenuEnum.CLIENT_SETUP}_${MenuAccessEnum.EDIT}`,
    linkName: 'Dashboard Org configuration',
  },
  CLIENT_SETUP_MANAGE_LOAD_CUSTOMERDATA: {
    routerLink: 'clientSetup/loadCustomerData',
    requiredPrivilege: `${DashboardMenuEnum.CLIENT_SETUP}_${MenuAccessEnum.EDIT}`,
    linkName: 'Load Customer Data',
  },
  /** View */
  CLIENT_SETUP_HOLDINGORG_VIEW: {
    routerLink: 'clientSetup/holdingOrgView',
    requiredPrivilege: `${DashboardMenuEnum.CLIENT_SETUP}_${MenuAccessEnum.VIEW}`,
    linkName: 'Holding Organization',
  },
  CLIENT_SETUP_HOLDINGORG_VIEW_VIEW: {
    routerLink: 'clientSetup/holdingOrgView/view/:id',
    requiredPrivilege: `${DashboardMenuEnum.CLIENT_SETUP}_${MenuAccessEnum.VIEW}`,
    linkName: '',
  },
  CLIENT_SETUP_MEMBERORG_VIEW: {
    routerLink: 'clientSetup/memberOrgView',
    requiredPrivilege: `${DashboardMenuEnum.CLIENT_SETUP}_${MenuAccessEnum.VIEW}`,
    linkName: 'Member Organization',
  },
  CLIENT_SETUP_MEMBERORG_VIEW_VIEW: {
    routerLink: 'clientSetup/memberOrgView/view/:id',
    requiredPrivilege: `${DashboardMenuEnum.CLIENT_SETUP}_${MenuAccessEnum.VIEW}`,
    linkName: '',
  },
  CLIENT_SETUP_CUSTOMERLIST_VIEW: {
    routerLink: 'clientSetup/customerList',
    requiredPrivilege: `${DashboardMenuEnum.CLIENT_SETUP}_${MenuAccessEnum.VIEW}`,
    linkName: 'Customer Data',
  },
  /** 01022021 - Abhishek - Added Client - Setup => Customer detail view per new requirement */
  CLIENT_SETUP_CUSTOMERDETAIL_VIEW: {
    routerLink: 'clientSetup/customerList/view/:id',
    requiredPrivilege: `${DashboardMenuEnum.CLIENT_SETUP}_${MenuAccessEnum.VIEW}`,
    linkName: 'Customer Data',
  },
  CLIENT_SETUP_UNSUBSCRIBED_VIEW: {
    routerLink: 'clientSetup/unsubscribedListView',
    requiredPrivilege: `${DashboardMenuEnum.CLIENT_SETUP}_${MenuAccessEnum.VIEW}`,
    linkName: 'Unsubscribed List',
  },
  /** USER MANAGEMENT ROUTES */
  /** Configuration */
  USER_MANAGEMENT_MANAGE_ROLES: {
    routerLink: 'userManagement/roles',
    requiredPrivilege: `${DashboardMenuEnum.USER_ADMIN}_${MenuAccessEnum.EDIT}`,
    linkName: 'Roles',
  },
  USER_MANAGEMENT_MANAGE_ROLES_ADD: {
    routerLink: 'userManagement/roles/add',
    requiredPrivilege: `${DashboardMenuEnum.USER_ADMIN}_${MenuAccessEnum.EDIT}`,
    linkName: '',
  },
  USER_MANAGEMENT_MANAGE_ROLES_EDIT: {
    routerLink: 'userManagement/roles/edit/:id',
    requiredPrivilege: `${DashboardMenuEnum.USER_ADMIN}_${MenuAccessEnum.EDIT}`,
    linkName: '',
  },
  USER_MANAGEMENT_MANAGE_ROLES_VIEW: {
    routerLink: 'userManagement/roles/view/:id',
    requiredPrivilege: `${DashboardMenuEnum.USER_ADMIN}_${MenuAccessEnum.EDIT}`,
    linkName: '',
  },
  USER_MANAGEMENT_MANAGE_USERS: {
    routerLink: 'userManagement/users',
    requiredPrivilege: `${DashboardMenuEnum.USER_ADMIN}_${MenuAccessEnum.EDIT}`,
    linkName: 'Users',
  },
  USER_MANAGEMENT_MANAGE_USERS_ADD: {
    routerLink: 'userManagement/users/add',
    requiredPrivilege: `${DashboardMenuEnum.USER_ADMIN}_${MenuAccessEnum.EDIT}`,
    linkName: '',
  },
  USER_MANAGEMENT_MANAGE_USERS_EDIT: {
    routerLink: 'userManagement/users/edit/:id',
    requiredPrivilege: `${DashboardMenuEnum.USER_ADMIN}_${MenuAccessEnum.EDIT}`,
    linkName: '',
  },
  USER_MANAGEMENT_MANAGE_USERS_VIEW: {
    routerLink: 'userManagement/users/view/:id',
    requiredPrivilege: `${DashboardMenuEnum.USER_ADMIN}_${MenuAccessEnum.EDIT}`,
    linkName: '',
  },
  /** View */
  USER_MANAGEMENT_ROLES_VIEW: {
    routerLink: 'userManagement/rolesView',
    requiredPrivilege: `${DashboardMenuEnum.USER_ADMIN}_${MenuAccessEnum.VIEW}`,
    linkName: 'Roles',
  },
  USER_MANAGEMENT_ROLES_VIEW_VIEW: {
    routerLink: 'userManagement/rolesView/view/:id',
    requiredPrivilege: `${DashboardMenuEnum.USER_ADMIN}_${MenuAccessEnum.VIEW}`,
    linkName: '',
  },
  USER_MANAGEMENT_USERS_VIEW: {
    routerLink: 'userManagement/usersView',
    requiredPrivilege: `${DashboardMenuEnum.USER_ADMIN}_${MenuAccessEnum.VIEW}`,
    linkName: 'Users',
  },
  USER_MANAGEMENT_USERS_VIEW_VIEW: {
    routerLink: 'userManagement/usersView/view/:id',
    requiredPrivilege: `${DashboardMenuEnum.USER_ADMIN}_${MenuAccessEnum.VIEW}`,
    linkName: '',
  },
  /** BILLING ROUTES */
  BILLING_CURRENT_BALANCE: {
    routerLink: 'billing/currentBalance',
    requiredPrivilege: `${DashboardMenuEnum.BILLING}_${MenuAccessEnum.EDIT}`,
    linkName: 'Current Balance',
  },
  BILLING_PAYMENT_HISTORY: {
    routerLink: 'billing/paymentHistory',
    requiredPrivilege: `${DashboardMenuEnum.BILLING}_${MenuAccessEnum.EDIT}`,
    linkName: 'Payment History',
  },
  /** SYS ADMIN ROUTES */
  SYSTEM_ADMIN_MANAGE_MESSAGE_EVENTS: {
    routerLink: 'sysAdmin/messageEvents',
    requiredPrivilege: `${DashboardMenuEnum.SYSTEM_ADMIN}_${MenuAccessEnum.EDIT}`,
    linkName: 'Message Events',
  },
  SYSTEM_ADMIN_MANAGE_MESSAGE_EVENTS_VIEW: {
    routerLink: 'sysAdmin/messageEvents/view/:id',
    requiredPrivilege: `${DashboardMenuEnum.SYSTEM_ADMIN}_${MenuAccessEnum.EDIT}`,
    linkName: 'Message Events',
  },
  SYSTEM_ADMIN_MANAGE_MESSAGES: {
    routerLink: 'sysAdmin/messages',
    requiredPrivilege: `${DashboardMenuEnum.SYSTEM_ADMIN}_${MenuAccessEnum.EDIT}`,
    linkName: 'Messages',
  },
  SYSTEM_ADMIN_MANAGE_EXPORT_NODES: {
    routerLink: 'sysAdmin/nodes',
    requiredPrivilege: `${DashboardMenuEnum.SYSTEM_ADMIN}_${MenuAccessEnum.EDIT}`,
    linkName: 'Export Nodes List',
  },
  SYSTEM_ADMIN_MANAGE_UNSENT_MESSAGES: {
    routerLink: 'sysAdmin/unsentMessages',
    requiredPrivilege: `${DashboardMenuEnum.SYSTEM_ADMIN}_${MenuAccessEnum.EDIT}`,
    linkName: 'Manage unsent messages',
  },
  SYSTEM_ADMIN_MANAGE_CUSTOMER_GROUP_ATTRIBUTES: {
    routerLink: 'sysAdmin/customerGroupAttribute',
    requiredPrivilege: `${DashboardMenuEnum.SYSTEM_ADMIN}_${MenuAccessEnum.EDIT}`,
    linkName: 'Data Attribute Groups',
  },
  SYSTEM_ADMIN_MANAGE_CUSTOMER_DATA_ATTRIBUTES: {
    routerLink: 'sysAdmin/customerDataAttributes',
    requiredPrivilege: `${DashboardMenuEnum.SYSTEM_ADMIN}_${MenuAccessEnum.EDIT}`,
    linkName: 'Data Attributes',
  },
  SYSTEM_ADMIN_MANAGE_CUSTOMER_DATA_ATTRIBUTE_ENUMS: {
    routerLink: 'sysAdmin/customerDataAttributeEnums',
    requiredPrivilege: `${DashboardMenuEnum.SYSTEM_ADMIN}_${MenuAccessEnum.EDIT}`,
    linkName: 'Data Attribute Enums',
  },

  /** View */
  SYSTEM_ADMIN_VIEW_NODES: {
    routerLink: 'sysAdmin/nodesView',
    requiredPrivilege: `${DashboardMenuEnum.SYSTEM_ADMIN}_${MenuAccessEnum.VIEW}`,
    linkName: 'Active Nodes',
  },
});
