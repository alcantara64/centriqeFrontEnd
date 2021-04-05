/** 26032021 - Gaurav - JIRA-CA-310: Componentize setup-list action buttons */

import { MatBadgePosition, MatBadgeSize } from '@angular/material/badge';

export enum AppButtonTypes {
  add = 'add',
  edit = 'edit',
  copy = 'copy',
  view = 'view',
  delete = 'delete',
  webUri = 'webUri',
  status = 'status',
  terminate = 'terminate',
  preview = 'preview',
  reset = 'reset',
  cancel = 'cancel',
  save = 'save',
  showMoreRight = 'showMoreRight',
  download = 'download',
  close = 'close',
}

export interface ButtonProps {
  appButtonType: AppButtonTypes;
  isRender: boolean;
  status?: number;
  hrefURI?: string;
  matTooltipText?: string;
  isDisabled?: boolean;
  isEnableSpecialClass?: boolean;
}

export interface ButtonRowProps {
  rowButtons: ButtonProps[];
}

export interface ButtonRowClickedParams {
  appButtonType: AppButtonTypes;
  _id: string;
  name?: string;
  status?: number;
  type?: string;
  code?: string;
  data?: any;
  index?: number;
  link?: string;
}
