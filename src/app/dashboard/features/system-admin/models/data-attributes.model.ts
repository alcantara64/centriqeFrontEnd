/** 08032021 - Gaurav - JIRA-CA-217: Init version
 * 17032021 - Gaurav - JIRA-CA-233: enums
 */
export interface CustomerDataAttributeGroup {
  _id?: string;
  code: string;
  name: string;
  detailViewOrder: number;
  displayCode?: string;
  displayOrder?: number;
  hideFromDisplay?: boolean;
}

export interface CustomerDataAttributes extends CustomerDataAttributeGroup {
  shortName: string;
  groupCode: string;
  type: CustomerDataAttributeDataType;
  dataProviderType: CustomerDataAttributeDataProviderType;
  data: any;
  tableViewOrder?: number;
  displayTableViewOrder?: number;
  loadAttributeName?: string;
  useInCampaignFilter?: boolean;
  useInTableView?: boolean;
  useInDetailView?: boolean;
  position?: number; // 23032021 - Gaurav - for mat table row selection
}

export enum CustomerDataAttributeDataType {
  string = 'string',
  stringMonthDay = 'stringMonthDay',
  date = 'date',
  integer = 'integer',
  number = 'number',
}

export enum CustomerDataAttributeDataProviderType {
  none = 'none',
  dynamic = 'dynamic',
  enum = 'enum',
}

export interface DataAttributeClassParams {
  dataAttributesList: CustomerDataAttributes[];
  dataAttributeGroups: CustomerDataAttributeGroup[];
  sysDataAttributesList: CustomerDataAttributes[];
  dataEnumTypes: CustomerDataAttributeEnums[];
  isViewOnly: boolean;
}

export interface CustomerDataAttributeEnums {
  _id?: string;
  code: string;
  displayCode?: string;
  name: string;
  data: any;
  type?: string;
}

export interface OrgDataAttributesFormData {
  formStatus: string;
  formPayload: any;
}
