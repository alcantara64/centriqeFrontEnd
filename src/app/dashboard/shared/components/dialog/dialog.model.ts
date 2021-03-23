/** 25112020 - Gaurav - Init version: Interfaces and Enums for Dialog Service
 * 27112020 - Gaurav - Added prompt_discard_data_changes predefined dialog condition type
 * 11122020 - Gaurav - Added InfoDialogType
 * 05032021 - Gaurav - JIRA-CA-154: New interfaces for Shared date range dialog
 */
export enum SystemDialogType {
  info_alert_ok,
  success_alert_ok,
  warning_alert_yes_no,
  warning_alert_yes_no_cancel,
  danger_alert_yes_no,
}

export enum DialogConditionType {
  prompt_general,
  prompt_save_data_changes,
  prompt_discard_data_changes,
  prompt_custom_data,
}

export interface SystemDialogInput {
  alertType: SystemDialogType;
  dialogConditionType: DialogConditionType;
  title?: string;
  body?: string;
}

export enum SystemDialogReturnType {
  continue_yes,
  continue_no,
  cancel,
}

export enum InfoDialogType {
  support,
  privacy_terms,
  other,
}

export interface ScheduleDialogReturnType {
  alertType: SystemDialogType;
  dialogConditionType: DialogConditionType;
  title?: string;
  body?: any;
}

export interface DateRangeDialogPayload {
  title: string;
  subTitle: string;
  response?: SelectedDateRange;
}

export interface SelectedDateRange {
  startDate: string;
  endDate: string;
}

export interface BottomSheetDialogInput {
  status?: number;
  title?: string;
  accessMode: string;
}


export enum BottomSheetDialogReturnType {
  launched_yes,
  draft_yes,
  terminate_yes,
  delete_yes,
  status,
  title
}
