/** 23112020 - Gaurav - Init version: Dynamic menu interfaces for strict type checking */
/** 18022021 - Abhishek - JIRA-CA-167: Render dashboards on UI -> Make some properties optional. */
/** Base Structure Items */
interface MenuLinkItems {
  menuItemLevelId: number;
  routerLink: string;
}

interface MenuBaseInfo {
  menuId: number;
  menuName: string;
  menuIcon: string;
  item?:any[];
}

interface MenuSecurityItems {
  disabled?: boolean;
  hidden?: boolean;
}

/** Low-level Selection Item  */
interface MenuItem extends MenuLinkItems, MenuSecurityItems {
  menuItemIcon: string;
  menuItemName: string;
}

/** App-usable interface exports */
export interface SelectedMenuItem extends MenuLinkItems {}

export interface ChildMenuItem extends MenuItem {}

/** Two-level menu item: Parent Menu Item (dropdown) and child menu items under it with routing capability */
export interface TwoLevelParentMenuItem
  extends MenuBaseInfo,
    MenuSecurityItems {
  menuItems?: MenuItem[];
}

/** Three-level menu item: Parent Menu Item (dropdown), with -
 * 1. another dropdown and its child menu items under it with routing capability
 * 2. direct child menu items with routing capabilities */
export interface ThreeLevelParentMenuItem
  extends MenuBaseInfo,
    MenuSecurityItems {
  dropDownMenuItems?: TwoLevelParentMenuItem[];
  directMenuItems?: MenuItem[];
}
