/** 24112020 - Gaurav - Init version: Menu service for all menu related activities
 * 25112020 - Gaurav - Added router links from constants
 * 15122020 - Gaurav - Added new menu item Comm-AI => View => Customer Data
 * 16122020 - Gaurav - Change for new menu requirements in issue tracker (issue# 40)
 * 23122020 - Gaurav - New System Admin menu related changes
 * 05032021 - Abhishek - Added new menu item Client-setup => configuration => Dashboard Org Configuration.
 * 08032021 - Gaurav - JIRA-CA-217: System Config - Customer Data Attribute
 * 12082021 - Gaurav - JIRA-CA-234: System Config - UI for Customer Attribute Enum
 * 17032021 - Gaurav - JIRA-CA-234: Reverted last UI for CRUD and will create per the backend API given
 * 18022021 - Abhishek - JIRA-CA-167: Render dashboards on UI -> Added analytics routes and make analytics as menu itself removed sub menus.
 */
import { Injectable } from '@angular/core';
import {
  DashboardMenuEnum,
  DashboardMenuEnum as m,
  dashboardRouteLinks as r,
  MenuAccessEnum,
} from './constants.routes';
import { ThreeLevelParentMenuItem, TwoLevelParentMenuItem } from './menu.model';

@Injectable()
export class MenuService {
  private _menus = new Map();
  private _menuPropsMap = new Map();

  constructor() {}

  getMenu(
    privileges: Set<string>
  ): Map<string, ThreeLevelParentMenuItem | TwoLevelParentMenuItem> {
    /** Init menu on each request from the dashboard component based on the auth status */
    this._initMenu();

    /** The privileges values recieved from the API may have more granular struture in the future, till then... */
    if (privileges.size === 0) return this._menus;

    // console.log('privileges', privileges);

    this._buildMenu(DashboardMenuEnum.ASK_BUDDY, privileges);
    this._buildMenu(DashboardMenuEnum.COMM_AI, privileges);
    this._buildMenu(DashboardMenuEnum.RESP_AI, privileges);
    this._buildMenu(DashboardMenuEnum.NPS, privileges);
    this._buildMenu(DashboardMenuEnum.MARKET_AI, privileges);
    this._buildMenu(DashboardMenuEnum.PROF_EDGE, privileges);
    this._buildMenu(DashboardMenuEnum.INSIGHT, privileges);
    this._buildMenu(DashboardMenuEnum.CLIENT_SETUP, privileges);
    this._buildMenu(DashboardMenuEnum.USER_ADMIN, privileges);
    this._buildMenu(DashboardMenuEnum.BILLING, privileges);
    this._buildMenu(DashboardMenuEnum.SYSTEM_ADMIN, privileges);

    // console.log('built menu', this._menus);

    return this._menus;
  }

  /** Build Menu based on priviliges methods - Start */
  private _buildMenu(menu: DashboardMenuEnum, priviliges: Set<string>): void {
    priviliges.has(`${menu}_${MenuAccessEnum.EDIT}`) &&
      this._setMenuItem(menu, MenuAccessEnum.EDIT);

    priviliges.has(`${menu}_${MenuAccessEnum.VIEW}`) &&
      this._setMenuItem(menu, MenuAccessEnum.VIEW);

    priviliges.has(`${menu}_${MenuAccessEnum.ANALYTICS}`) &&
      this._setMenuItem(menu, MenuAccessEnum.ANALYTICS);
  }

  /** Set access-level props and values */
  private _setMenuItem(
    menuSelector: DashboardMenuEnum,
    access: MenuAccessEnum
  ) {
    let obj = this._menus.get(menuSelector);
    const menuItemObjs = this._menuPropsMap.get(`${menuSelector}_${access}`);

    /** Continue only if valid values for available access */
    if (menuItemObjs) {
      let addObj = {};
      /** Determine the object is a three-level menu or two-level,
       * to constuct a common code below before the feature level addition */
      if ((obj as ThreeLevelParentMenuItem).dropDownMenuItems) {
        /** Three-level menu */
        if (menuItemObjs?.dropDownMenuItems?.length > 0) {
          addObj = {
            dropDownMenuItems: [
              ...obj.dropDownMenuItems,
              ...menuItemObjs.dropDownMenuItems,
            ],
          };
        }

        if (menuItemObjs?.directMenuItems?.length > 0) {
          addObj = {
            directMenuItems: [
              ...obj.directMenuItems,
              ...menuItemObjs.directMenuItems,
            ],
          };
        }
      } else {
        /** Two-level menu */
        addObj = {
          menuItems: [...obj.menuItems, ...menuItemObjs],
        };
      }

      /** Combine here */
      this._menus.set(menuSelector, {
        ...obj,
        disabled: false,
        hidden: false,
        ...addObj,
      });
    }
  }
  /** Build Menu based on priviliges methods - Ends */

  /** Initialization methods */
  private _initMenu(): void {
    /** Initialize Menu
     * Important!!! Whenever changing the two-level menu item to three-level or vice versa,
     * DO CHECK the interface types for each in the menu.model.ts
     */
    /** One item menu */
    this._menus.set(m.HOME, {
      menuId: 0,
      menuName: 'Home',
      menuIcon: 'home',
      hidden: false,
      disabled: false,
    });

    /** Two-level menu */
    this._menus.set(m.ASK_BUDDY, {
      menuId: 1,
      menuName: 'Ask Buddy',
      menuIcon: 'how_to_reg',
      hidden: true,
      disabled: true,
      menuItems: [],
    });
    /** Three-level menu */
    this._menus.set(m.COMM_AI, {
      menuId: 2,
      menuName: 'Communication AI',
      menuIcon: 'multiple_stop',
      hidden: true,
      disabled: true,
      dropDownMenuItems: [],
      directMenuItems: [],
    });
    /** Three-level menu */
    this._menus.set(m.RESP_AI, {
      menuId: 3,
      menuName: 'Response AI',
      menuIcon: 'rate_review',
      hidden: true,
      disabled: true,
      dropDownMenuItems: [],
      directMenuItems: [],
    });
    /** Three-level menu */
    this._menus.set(m.NPS, {
      menuId: 4,
      menuName: 'NPS',
      menuIcon: 'loyalty',
      hidden: true,
      disabled: true,
      dropDownMenuItems: [],
      directMenuItems: [],
    });
    /** Three-level menu */
    this._menus.set(m.MARKET_AI, {
      menuId: 5,
      menuName: 'Market Place AI',
      menuIcon: 'home_repair_service',
      hidden: true,
      disabled: true,
      dropDownMenuItems: [],
      directMenuItems: [],
    });
    /** Three-level menu */
    this._menus.set(m.PROF_EDGE, {
      menuId: 6,
      menuName: 'Profit Edge',
      menuIcon: 'analytics',
      hidden: true,
      disabled: true,
      dropDownMenuItems: [],
      directMenuItems: [],
    });

    /** Three-level menu */
    this._menus.set(m.INSIGHT, {
      menuId: 7,
      menuName: 'Insight',
      menuIcon: 'insights',
      hidden: true,
      disabled: true,
      dropDownMenuItems: [],
      directMenuItems: [],
    });

    /** Three-level menu */
    this._menus.set(m.CLIENT_SETUP, {
      menuId: 8,
      menuName: 'Client Setup',
      menuIcon: 'miscellaneous_services',
      hidden: true,
      disabled: true,
      dropDownMenuItems: [],
      directMenuItems: [],
    });
    /** Three-level menu */
    this._menus.set(m.USER_ADMIN, {
      menuId: 9,
      menuName: 'User Management',
      menuIcon: 'people_alt',
      hidden: true,
      disabled: true,
      dropDownMenuItems: [],
      directMenuItems: [],
    });
    /** Two-level menu */
    this._menus.set(m.BILLING, {
      menuId: 10,
      menuName: 'Billing',
      menuIcon: 'monetization_on',
      hidden: true,
      disabled: true,
      menuItems: [],
    });
    /** Three-level menu */
    this._menus.set(m.SYSTEM_ADMIN, {
      menuId: 11,
      menuName: 'System Admin',
      menuIcon: 'admin_panel_settings',
      hidden: true,
      disabled: true,
      dropDownMenuItems: [],
      directMenuItems: [],
    });

    /** Init menu access values */
    this._initMenuValues();
  }

  private _initMenuValues(): void {
    /** Ask buddy: Two-level menu */

    this._menuPropsMap.set(
      `${DashboardMenuEnum.ASK_BUDDY}_${MenuAccessEnum.ANALYTICS}`,
      [
        {
          menuItemLevelId: 1.1,
          routerLink: r.ASK_BUDDY_PROGRESS_ANALYTICS.routerLink,
          menuItemIcon: 'assessment',
          menuItemName: r.PROGRESS_ANALYTICS.linkName,
        },
      ]
    );

    /** Communication AI: Three-level menu */
    this._menuPropsMap.set(
      `${DashboardMenuEnum.COMM_AI}_${MenuAccessEnum.EDIT}`,
      {
        dropDownMenuItems: [
          {
            menuId: 2.1,
            menuName: 'Configuration',
            menuIcon: 'settings',
            menuItems: [
              {
                menuItemLevelId: 2.11,
                routerLink: r.COMMUNICATION_MANAGE_TEMPLATE.routerLink,
                menuItemIcon: '',
                menuItemName: r.COMMUNICATION_MANAGE_TEMPLATE.linkName,
              },
              {
                menuItemLevelId: 2.12,
                routerLink: r.COMMUNICATION_MANAGE_CAMPAIGN_MASTER.routerLink,
                menuItemIcon: '',
                menuItemName: r.COMMUNICATION_MANAGE_CAMPAIGN_MASTER.linkName,
              },
            ],
          },
        ],
        directMenuItems: [],
      }
    );
    this._menuPropsMap.set(
      `${DashboardMenuEnum.COMM_AI}_${MenuAccessEnum.VIEW}`,
      {
        dropDownMenuItems: [
          {
            menuId: 2.2,
            menuName: 'View',
            menuIcon: 'visibility',
            menuItems: [
              {
                menuItemLevelId: 2.21,
                routerLink: r.COMMUNICATION_TEMPLATE_VIEW.routerLink,
                menuItemIcon: '',
                menuItemName: r.COMMUNICATION_TEMPLATE_VIEW.linkName,
              },
              {
                menuItemLevelId: 2.22,
                routerLink: r.COMMUNICATION_CAMPAIGN_MASTER_VIEW.routerLink,
                menuItemIcon: '',
                menuItemName: r.COMMUNICATION_CAMPAIGN_MASTER_VIEW.linkName,
              },
              {
                menuItemLevelId: 2.23,
                routerLink: r.COMMUNICATION_LAUNCHED_CAMPAIGNS_VIEW.routerLink,
                menuItemIcon: '',
                menuItemName: r.COMMUNICATION_LAUNCHED_CAMPAIGNS_VIEW.linkName,
              },
              {
                menuItemLevelId: 2.24,
                routerLink: r.COMMUNICATION_CUSTOMERLIST_VIEW.routerLink,
                menuItemIcon: '',
                menuItemName: r.COMMUNICATION_CUSTOMERLIST_VIEW.linkName,
              },
              {
                menuItemLevelId: 2.25,
                routerLink: r.COMMUNICATION_UNSUBSCRIBED_VIEW.routerLink,
                menuItemIcon: '',
                menuItemName: r.COMMUNICATION_UNSUBSCRIBED_VIEW.linkName,
              },
            ],
          },
        ],
        directMenuItems: [],
      }
    );
    this._menuPropsMap.set(
      `${DashboardMenuEnum.COMM_AI}_${MenuAccessEnum.ANALYTICS}`,
      {
        dropDownMenuItems:[],
        directMenuItems: [
          {
            menuItemLevelId: 2.3,
            routerLink: r.COMMUNICATION_PROGRESS_ANALYTICS.routerLink,
            menuItemIcon: 'assessment',
            menuItemName: 'Analytics',
          },
        ],
      }
    );

    /** Response AI: Three-level menu */
    this._menuPropsMap.set(
      `${DashboardMenuEnum.RESP_AI}_${MenuAccessEnum.EDIT}`,
      {
        dropDownMenuItems: [
          {
            menuId: 3.1,
            menuName: 'Configuration',
            menuIcon: 'settings',
            menuItems: [
              {
                menuItemLevelId: 3.11,
                routerLink: r.RESPONSE_MANAGE_RESPONSE_TYPES.routerLink,
                menuItemIcon: '',
                menuItemName: r.RESPONSE_MANAGE_RESPONSE_TYPES.linkName,
              },
              {
                menuItemLevelId: 3.12,
                routerLink: r.RESPONSE_MANAGE_FEEDBACK_SETUP.routerLink,
                menuItemIcon: '',
                menuItemName: r.RESPONSE_MANAGE_FEEDBACK_SETUP.linkName,
              },
              {
                menuItemLevelId: 3.13,
                routerLink: r.RESPONSE_MANAGE_FEEDBACK_CAMPAIGN.routerLink,
                menuItemIcon: '',
                menuItemName: r.RESPONSE_MANAGE_FEEDBACK_CAMPAIGN.linkName,
              },
            ],
          },
        ],
        directMenuItems: [],
      }
    );
    this._menuPropsMap.set(
      `${DashboardMenuEnum.RESP_AI}_${MenuAccessEnum.VIEW}`,
      {
        dropDownMenuItems: [
          {
            menuId: 3.2,
            menuName: 'View',
            menuIcon: 'visibility',
            menuItems: [
              {
                menuItemLevelId: 3.21,
                routerLink: r.RESPONSE_RESPONSE_TYPES_VIEW.routerLink,
                menuItemIcon: '',
                menuItemName: r.RESPONSE_RESPONSE_TYPES_VIEW.linkName,
              },
              {
                menuItemLevelId: 3.22,
                routerLink: r.RESPONSE_FEEDBACK_SETUP_VIEW.routerLink,
                menuItemIcon: '',
                menuItemName: r.RESPONSE_FEEDBACK_SETUP_VIEW.linkName,
              },
              {
                menuItemLevelId: 3.23,
                routerLink: r.RESPONSE_FEEDBACK_CAMPAIGN_VIEW.routerLink,
                menuItemIcon: '',
                menuItemName: r.RESPONSE_FEEDBACK_CAMPAIGN_VIEW.linkName,
              },
              {
                menuItemLevelId: 3.24,
                routerLink: r.RESPONSE_PAST_CAMPAIGNS_VIEW.routerLink,
                menuItemIcon: '',
                menuItemName: r.RESPONSE_PAST_CAMPAIGNS_VIEW.linkName,
              },
              {
                menuItemLevelId: 3.25,
                routerLink: r.RESPONSE_CUSTOMERLIST_VIEW.routerLink,
                menuItemIcon: '',
                menuItemName: r.RESPONSE_CUSTOMERLIST_VIEW.linkName,
              },
              {
                menuItemLevelId: 3.26,
                routerLink: r.RESPONSE_UNSUBSCRIBED_VIEW.routerLink,
                menuItemIcon: '',
                menuItemName: r.RESPONSE_UNSUBSCRIBED_VIEW.linkName,
              },
            ],
          },
        ],
        directMenuItems: [],
      }
    );
    this._menuPropsMap.set(
      `${DashboardMenuEnum.RESP_AI}_${MenuAccessEnum.ANALYTICS}`,
      {
        dropDownMenuItems:[],
        directMenuItems: [
          {
            menuItemLevelId: 3.3,
            routerLink: r.RESPONSE_PROGRESS_ANALYTICS.routerLink,
            menuItemIcon: 'assessment',
            menuItemName: 'Analytics',
          },
        ],
      }
    );

    /** NPS: Three-level menu */
    this._menuPropsMap.set(`${DashboardMenuEnum.NPS}_${MenuAccessEnum.EDIT}`, {
      dropDownMenuItems: [
        {
          menuId: 4.1,
          menuName: 'Configuration',
          menuIcon: 'settings',
          menuItems: [
            {
              menuItemLevelId: 4.11,
              routerLink: r.NPS_MANAGE_NPS_MASTER.routerLink,
              menuItemIcon: '',
              menuItemName: r.NPS_MANAGE_NPS_MASTER.linkName,
            },
            {
              menuItemLevelId: 4.12,
              routerLink: r.NPS_MANAGE_NPS_SETUP.routerLink,
              menuItemIcon: '',
              menuItemName: r.NPS_MANAGE_NPS_SETUP.linkName,
            },
            {
              menuItemLevelId: 4.13,
              routerLink: r.NPS_MANAGE_NPS_CAMPAIGN.routerLink,
              menuItemIcon: '',
              menuItemName: r.NPS_MANAGE_NPS_CAMPAIGN.linkName,
            },
          ],
        },
      ],
      directMenuItems: [],
    });

    this._menuPropsMap.set(`${DashboardMenuEnum.NPS}_${MenuAccessEnum.VIEW}`, {
      dropDownMenuItems: [
        {
          menuId: 4.2,
          menuName: 'View',
          menuIcon: 'visibility',
          menuItems: [
            {
              menuItemLevelId: 4.21,
              routerLink: r.NPS_NPS_MASTER_VIEW.routerLink,
              menuItemIcon: '',
              menuItemName: r.NPS_NPS_MASTER_VIEW.linkName,
            },
            {
              menuItemLevelId: 4.22,
              routerLink: r.NPS_NPS_SETUP_VIEW.routerLink,
              menuItemIcon: '',
              menuItemName: r.NPS_NPS_SETUP_VIEW.linkName,
            },
            {
              menuItemLevelId: 4.23,
              routerLink: r.NPS_NPS_CAMPAIGN_VIEW.routerLink,
              menuItemIcon: '',
              menuItemName: r.NPS_NPS_CAMPAIGN_VIEW.linkName,
            },
            {
              menuItemLevelId: 4.24,
              routerLink: r.NPS_PAST_CAMPAIGNS_VIEW.routerLink,
              menuItemIcon: '',
              menuItemName: r.NPS_PAST_CAMPAIGNS_VIEW.linkName,
            },
            {
              menuItemLevelId: 4.25,
              routerLink: r.NPS_CUSTOMERLIST_VIEW.routerLink,
              menuItemIcon: '',
              menuItemName: r.NPS_CUSTOMERLIST_VIEW.linkName,
            },
            {
              menuItemLevelId: 4.26,
              routerLink: r.NPS_UNSUBSCRIBED_VIEW.routerLink,
              menuItemIcon: '',
              menuItemName: r.NPS_UNSUBSCRIBED_VIEW.linkName,
            },
          ],
        },
      ],
      directMenuItems: [],
    });

    this._menuPropsMap.set(
      `${DashboardMenuEnum.NPS}_${MenuAccessEnum.ANALYTICS}`,
      {
        dropDownMenuItems:[],
        directMenuItems: [
          {
            menuItemLevelId: 4.3,
            routerLink: r.NPS_PROGRESS_ANALYTICS.routerLink,
            menuItemIcon: 'assessment',
            menuItemName: 'Analytics',
          },
        ],
      }
    );

    /** Market Place AI: Three-level menu */
    this._menuPropsMap.set(
      `${DashboardMenuEnum.MARKET_AI}_${MenuAccessEnum.EDIT}`,
      {
        dropDownMenuItems: [
          {
            menuId: 5.1,
            menuName: 'Configuration',
            menuIcon: 'settings',
          },
        ],
        directMenuItems: [],
      }
    );

    this._menuPropsMap.set(
      `${DashboardMenuEnum.MARKET_AI}_${MenuAccessEnum.VIEW}`,
      {
        dropDownMenuItems: [
          {
            menuId: 5.2,
            menuName: 'View',
            menuIcon: 'visibility',
          },
        ],
        directMenuItems: [],
      }
    );

    this._menuPropsMap.set(
      `${DashboardMenuEnum.MARKET_AI}_${MenuAccessEnum.ANALYTICS}`,
      {
        dropDownMenuItems:[],
        directMenuItems: [
          {
            menuItemLevelId: 5.3,
            routerLink: r.MARKET_AI_PROGRESS_ANALYTICS.routerLink,
            menuItemIcon: 'assessment',
            menuItemName: 'Analytics',
          },
        ],
      }
    );

    /** Profit Edge: Three-level menu */
    this._menuPropsMap.set(
      `${DashboardMenuEnum.PROF_EDGE}_${MenuAccessEnum.EDIT}`,
      {
        dropDownMenuItems: [
          {
            menuId: 6.1,
            menuName: 'Configuration',
            menuIcon: 'settings',
          },
        ],
        directMenuItems: [],
      }
    );

    this._menuPropsMap.set(
      `${DashboardMenuEnum.PROF_EDGE}_${MenuAccessEnum.VIEW}`,
      {
        dropDownMenuItems: [
          {
            menuId: 6.2,
            menuName: 'View',
            menuIcon: 'visibility',
          },
        ],
        directMenuItems: [],
      }
    );

    this._menuPropsMap.set(
      `${DashboardMenuEnum.PROF_EDGE}_${MenuAccessEnum.ANALYTICS}`,
      {
        dropDownMenuItems:[],
        directMenuItems: [
          {
            menuItemLevelId: 6.3,
            routerLink: r.PROFIT_EDGE_PROGRESS_ANALYTICS.routerLink,
            menuItemIcon: 'assessment',
            menuItemName: 'Analytics',
          },
        ],
      }
    );

    /** Insight: Three-level menu */
    this._menuPropsMap.set(
      `${DashboardMenuEnum.INSIGHT}_${MenuAccessEnum.ANALYTICS}`,
      {
        dropDownMenuItems:[],
        directMenuItems: [
          {
            menuItemLevelId: 7.1,
            routerLink: r.INSIGHT_PROGRESS_ANALYTICS.routerLink,
            menuItemIcon: 'assessment',
            menuItemName: 'Analytics',
          },
        ],
      }
    );

    /** Client Setup: Three-level menu */
    this._menuPropsMap.set(
      `${DashboardMenuEnum.CLIENT_SETUP}_${MenuAccessEnum.EDIT}`,
      {
        dropDownMenuItems: [
          {
            menuId: 8.1,
            menuName: 'Configuration',
            menuIcon: 'settings',
            menuItems: [
              {
                menuItemLevelId: 8.11,
                routerLink: r.CLIENT_SETUP_MANAGE_HOLDINGORG.routerLink,
                menuItemIcon: '',
                menuItemName: r.CLIENT_SETUP_MANAGE_HOLDINGORG.linkName,
              },
              {
                menuItemLevelId: 8.12,
                routerLink: r.CLIENT_SETUP_MANAGE_MEMBERORG.routerLink,
                menuItemIcon: '',
                menuItemName: r.CLIENT_SETUP_MANAGE_MEMBERORG.linkName,
              },
              {
                menuItemLevelId: 8.13,
                routerLink:
                  r.CLIENT_SETUP_DASHBOARD_ORG_CONFIGURATION.routerLink,
                menuItemIcon: '',
                menuItemName:
                  r.CLIENT_SETUP_DASHBOARD_ORG_CONFIGURATION.linkName,
              },
              {
                menuItemLevelId: 8.14,
                routerLink: r.CLIENT_SETUP_MANAGE_LOAD_CUSTOMERDATA.routerLink,
                menuItemIcon: '',
                menuItemName: r.CLIENT_SETUP_MANAGE_LOAD_CUSTOMERDATA.linkName,
                disabled: true,
              },
            ],
          },
        ],
        directMenuItems: [],
      }
    );
    this._menuPropsMap.set(
      `${DashboardMenuEnum.CLIENT_SETUP}_${MenuAccessEnum.VIEW}`,
      {
        dropDownMenuItems: [
          {
            menuId: 8.2,
            menuName: 'View',
            menuIcon: 'visibility',
            menuItems: [
              {
                menuItemLevelId: 8.21,
                routerLink: r.CLIENT_SETUP_HOLDINGORG_VIEW.routerLink,
                menuItemIcon: '',
                menuItemName: r.CLIENT_SETUP_HOLDINGORG_VIEW.linkName,
              },
              {
                menuItemLevelId: 8.22,
                routerLink: r.CLIENT_SETUP_MEMBERORG_VIEW.routerLink,
                menuItemIcon: '',
                menuItemName: r.CLIENT_SETUP_MEMBERORG_VIEW.linkName,
              },
              {
                menuItemLevelId: 8.23,
                routerLink: r.CLIENT_SETUP_CUSTOMERLIST_VIEW.routerLink,
                menuItemIcon: '',
                menuItemName: r.CLIENT_SETUP_CUSTOMERLIST_VIEW.linkName,
              },
              {
                menuItemLevelId: 8.24,
                routerLink: r.CLIENT_SETUP_UNSUBSCRIBED_VIEW.routerLink,
                menuItemIcon: '',
                menuItemName: r.CLIENT_SETUP_UNSUBSCRIBED_VIEW.linkName,
                disabled: true,
              },
            ],
          },
        ],
        directMenuItems: [],
      }
    );
    this._menuPropsMap.set(
      `${DashboardMenuEnum.CLIENT_SETUP}_${MenuAccessEnum.ANALYTICS}`,
      {
        dropDownMenuItems: [],
        directMenuItems: [],
      }
    );

    /** User Management: Three-level menu */
    this._menuPropsMap.set(
      `${DashboardMenuEnum.USER_ADMIN}_${MenuAccessEnum.EDIT}`,
      {
        dropDownMenuItems: [
          {
            menuId: 9.1,
            menuName: 'Configuration',
            menuIcon: 'settings',
            menuItems: [
              {
                menuItemLevelId: 9.11,
                routerLink: r.USER_MANAGEMENT_MANAGE_ROLES.routerLink,
                menuItemIcon: '',
                menuItemName: r.USER_MANAGEMENT_MANAGE_ROLES.linkName,
              },
              {
                menuItemLevelId: 9.12,
                routerLink: r.USER_MANAGEMENT_MANAGE_USERS.routerLink,
                menuItemIcon: '',
                menuItemName: r.USER_MANAGEMENT_MANAGE_USERS.linkName,
              },
            ],
          },
        ],
        directMenuItems: [],
      }
    );
    this._menuPropsMap.set(
      `${DashboardMenuEnum.USER_ADMIN}_${MenuAccessEnum.VIEW}`,
      {
        dropDownMenuItems: [
          {
            menuId: 9.2,
            menuName: 'View',
            menuIcon: 'visibility',
            menuItems: [
              {
                menuItemLevelId: 9.21,
                routerLink: r.USER_MANAGEMENT_ROLES_VIEW.routerLink,
                menuItemIcon: '',
                menuItemName: r.USER_MANAGEMENT_ROLES_VIEW.linkName,
              },
              {
                menuItemLevelId: 9.22,
                routerLink: r.USER_MANAGEMENT_USERS_VIEW.routerLink,
                menuItemIcon: '',
                menuItemName: r.USER_MANAGEMENT_USERS_VIEW.linkName,
              },
            ],
          },
        ],
        directMenuItems: [],
      }
    );
    this._menuPropsMap.set(
      `${DashboardMenuEnum.USER_ADMIN}_${MenuAccessEnum.ANALYTICS}`,
      {
        dropDownMenuItems: [],
        directMenuItems: [],
      }
    );

    /** Billing: Two-level menu */
    this._menuPropsMap.set(
      `${DashboardMenuEnum.BILLING}_${MenuAccessEnum.EDIT}`,
      [
        {
          menuItemLevelId: 10.1,
          routerLink: r.BILLING_CURRENT_BALANCE.routerLink,
          menuItemIcon: 'local_atm',
          menuItemName: r.BILLING_CURRENT_BALANCE.linkName,
        },
        {
          menuItemLevelId: 10.2,
          routerLink: r.BILLING_PAYMENT_HISTORY.routerLink,
          menuItemIcon: 'attach_money',
          menuItemName: r.BILLING_PAYMENT_HISTORY.linkName,
        },
      ]
    );

    this._menuPropsMap.set(
      `${DashboardMenuEnum.BILLING}_${MenuAccessEnum.VIEW}`,
      []
    );

    this._menuPropsMap.set(
      `${DashboardMenuEnum.BILLING}_${MenuAccessEnum.ANALYTICS}`,
      []
    );

    /** Client Setup: Three-level menu */
    this._menuPropsMap.set(
      `${DashboardMenuEnum.SYSTEM_ADMIN}_${MenuAccessEnum.EDIT}`,
      {
        dropDownMenuItems: [
          {
            menuId: 11.1,
            menuName: 'Messaging',
            menuIcon: 'forward_to_inbox',
            menuItems: [
              {
                menuItemLevelId: 11.11,
                routerLink: r.SYSTEM_ADMIN_MANAGE_MESSAGE_EVENTS.routerLink,
                menuItemIcon: '',
                menuItemName: r.SYSTEM_ADMIN_MANAGE_MESSAGE_EVENTS.linkName,
              },
              {
                menuItemLevelId: 11.12,
                routerLink: r.SYSTEM_ADMIN_MANAGE_MESSAGES.routerLink,
                menuItemIcon: '',
                menuItemName: r.SYSTEM_ADMIN_MANAGE_MESSAGES.linkName,
              },
            ],
          },
          {
            menuId: 11.2,
            menuName: 'Customer',
            menuIcon: 'manage_accounts',
            menuItems: [
              {
                menuItemLevelId: 11.21,
                routerLink:
                  r.SYSTEM_ADMIN_MANAGE_CUSTOMER_GROUP_ATTRIBUTES.routerLink,
                menuItemIcon: '',
                menuItemName:
                  r.SYSTEM_ADMIN_MANAGE_CUSTOMER_GROUP_ATTRIBUTES.linkName,
              },
              {
                menuItemLevelId: 11.22,
                routerLink:
                  r.SYSTEM_ADMIN_MANAGE_CUSTOMER_DATA_ATTRIBUTES.routerLink,
                menuItemIcon: '',
                menuItemName:
                  r.SYSTEM_ADMIN_MANAGE_CUSTOMER_DATA_ATTRIBUTES.linkName,
              },
              {
                menuItemLevelId: 11.23,
                routerLink:
                  r.SYSTEM_ADMIN_MANAGE_CUSTOMER_DATA_ATTRIBUTE_ENUMS
                    .routerLink,
                menuItemIcon: '',
                menuItemName:
                  r.SYSTEM_ADMIN_MANAGE_CUSTOMER_DATA_ATTRIBUTE_ENUMS.linkName,
              },
            ],
          },
          // Important!!: Reorder numbering FOR ALL menuIds down below when Tools menu is uncommented
          // {
          //   menuId: 11.2,
          //   menuName: 'Tools',
          //   menuIcon: 'build',
          //   disabled: true,
          //   menuItems: [
          //     {
          //       menuItemLevelId: 11.21,
          //       routerLink: r.SYSTEM_ADMIN_MANAGE_EXPORT_NODES.routerLink,
          //       menuItemIcon: '',
          //       menuItemName: r.SYSTEM_ADMIN_MANAGE_EXPORT_NODES.linkName,
          //     },
          //     {
          //       menuItemLevelId: 11.22,
          //       routerLink: r.SYSTEM_ADMIN_MANAGE_UNSENT_MESSAGES.routerLink,
          //       menuItemIcon: '',
          //       menuItemName: r.SYSTEM_ADMIN_MANAGE_UNSENT_MESSAGES.linkName,
          //     },
          //   ],
          // },
        ],
        directMenuItems: [],
      }
    );

    this._menuPropsMap.set(
      `${DashboardMenuEnum.SYSTEM_ADMIN}_${MenuAccessEnum.VIEW}`,
      {
        dropDownMenuItems: [],
        directMenuItems: [
          {
            menuItemLevelId: 11.2,
            routerLink: r.SYSTEM_ADMIN_VIEW_NODES.routerLink,
            menuItemIcon: 'workspaces',
            menuItemName: r.SYSTEM_ADMIN_VIEW_NODES.linkName,
          },
        ],
      }
    );
  }
  /** Initialization methods - Ends */
}
