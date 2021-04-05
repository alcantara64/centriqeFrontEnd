/** 18112020 - Gaurav - Init version
 * 19112020 - Gaurav - Added SideNav, Expansion Modules
 * 23112020 - Gaurav - Added shared menu components
 * 27/11/2020 - Gaurav - Provided Feature Updates CanDeactivate guard service
 * 30112020 - Gaurav - Added User Management components and provided is related services
 * 11122020 - Gaurav - Added Home Component here to fix (can't bind to 'ngifelse' since it isn't a known property of 'img') error
 * 16/12/2020 - Gaurav - Added Response AI components and service
 * 23122020 - Abhishek - Added Messages MessageEvents componets and provided SystemAdminService for new System Admin feature
 * 29012021 - Abhishek - Added CustomerDetail component
 * 05022021 - Abhishek - Added DatePipe to set date format 'yyyy-MM-dd' in customer list amd detail view.
 * 10022021 - Gaurav - Added apache echarts
 * 05032021 - Abhishek - Added DashboardOrgConfigurationComponent.
 * 17032021 - Gaurav - JIRA-CA-234: Reverted last UI for CRUD and will create per the backend API given
 * 01042021 - Abhishek - CA-334: Implement Frontend "load file".
 */

import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

import { SharedModule } from '../shared/shared.module';
import { EmailEditorModule } from 'angular-email-editor';

/** Routing and Angular Material Modules */
import { DashboardRoutingModule } from './dashboard.routing';
import { AngularMaterialModule } from './shared/modules/angular-material.module';
//17-12-2020 added angular material datepicker with time picker pluggin
import {
  NgxMatDatetimePickerModule,
  NgxMatTimepickerModule,
  NgxMatNativeDateModule,
} from '@angular-material-components/datetime-picker';

/** apache echarts */
import { NgxEchartsModule } from 'ngx-echarts';
import * as echarts from 'echarts';

/** Custom Services and Guards */
import { DashboardRouteGuard } from './shared/dashboard-route-guard.service';
import { FeaturesUpdatesGuardService } from './shared/services/feature-updates-guard.service';
import { DashboardService } from './dashboard.service';
import { MenuService } from './shared/components/menu/menu.service';
import { DialogService } from './shared/components/dialog/dialog.service';
import { TemplateFieldValidationService } from './shared/services/template-field-validation.service';

/** Feature Services */
import { ClientSetupService } from './features/client-setup/client-setup.service';
import { CommunicationAIService } from './features/communication-ai/communication-ai.service';
import { ResponseAIService } from './features/response-ai/response-ai.service';

/** Shared Components */
import { HeaderComponent } from './header/header.component';
import { DashboardComponent } from './dashboard.component';
import { MenuItemComponent } from './shared/components/menu/menu-item.component';
import { MenuItemListComponent } from './shared/components/menu/menu-item-list.component';
import { TwoLevelMenuComponent } from './shared/components/menu/two-level-menu.component';
import { ThreeLevelMenuComponent } from './shared/components/menu/three-level-menu.component';
import { InfoDialogComponent } from './shared/components/dialog/info-dialog/info-dialog.component';
import { ScheduleDialogComponent } from './shared/components/dialog/schedule-dialog/schedule-dialog';
import { SystemDialogComponent } from './shared/components/dialog/system-dialog/system-dialog.component';
import { BottomSheetDialog } from 'src/app/dashboard/shared/components/dialog/bottom-sheet-dialog/bottom-sheet-dialog';

/** Feature Components */
import { EmailTemplateSetupComponent } from './features/communication-ai/email-template-setup/email-template-setup.component';
import { EmailTemplateComponent } from './features/communication-ai/email-template/email-template.component';
import { CampaignMasterSetup } from './features/communication-ai/campaign-master-setup/campaign-master-setup.component';
import { CampaignMasterComponent } from './features/communication-ai/campaign-master/campaign-master.component';
import { CampMessageEventComponent } from './features/communication-ai/campaign-master/message-events/camp-message-events';
import { HoldingOrgSetupComponent } from './features/client-setup/holding-org-setup/holding-org-setup.component';
import { HoldingOrgComponent } from './features/client-setup/holding-org/holding-org.component';
import { MemberOrgComponent } from './features/client-setup/member-org/member-org.component';
import { MemberOrgSetupComponent } from './features/client-setup/member-org-setup/member-org-setup.component';
import { CustomerListComponent } from './shared/components/customer-list/customer-list.component';
import { UsersSetupComponent } from './features/user-management/users-setup/users-setup.component';
import { UsersComponent } from './features/user-management/users/users.component';
import { RolesSetupComponent } from './features/user-management/roles-setup/roles-setup.component';
import { RolesComponent } from './features/user-management/roles/roles.component';
import { UserManagementService } from './features/user-management/user-management.service';
import { HomeComponent } from './home/home.component';
import { DemoDialogComponent } from './shared/components/dialog/demo-dialog/demo-dialog.component';
import { ResponseTypeSetupComponent } from './features/response-ai/response-type-setup/response-type-setup.component';
import { ResponseTypeComponent } from './features/response-ai/response-type/response-type.component';
import { SurveySetupComponent } from './features/response-ai/survey-setup/survey-setup.component';
import { SurveyComponent } from './features/response-ai/survey/survey.component';
import { SurveyPageComponent } from './features/response-ai/survey/survey-page/survey-page.component';
import { SurveySectionComponent } from './features/response-ai/survey/survey-section/survey-section.component';
import { SurveyQuestionComponent } from './features/response-ai/survey/survey-question/survey-question.component';
import { SingleTextAreaOrInputComponent } from './features/response-ai/response-type/response-types/single-textarea-or-input/single-textarea-or-input.component';
import { RatingComponent } from './features/response-ai/response-type/response-types/rating/rating.component';
import { PreviewResponseTypeComponent } from './features/response-ai/response-type/preview-response-type/preview-response-type.component';
import { BaseTypeComponent } from './features/response-ai/response-type/response-types/base-type/base-type.component';

import { SystemAdminService } from './features/system-admin/system-admin.service';
import { MessagesSetupComponent } from './features/system-admin/messages-setup/messages-setup.component';
import { MessageEventsSetupComponent } from './features/system-admin/message-events-setup/message-events-setup.component';
import { NpsSingleChoiceRadioBoxComponent } from './features/response-ai/response-type/response-types/nps-single-choice-radio-box/nps-single-choice-radio-box.component';
import { SingleRowRadioOrCheckboxComponent } from './features/response-ai/response-type/response-types/single-row-radio-or-checkbox/single-row-radio-or-checkbox.component';
import { LikertRadioOrCheckboxComponent } from './features/response-ai/response-type/response-types/likert-radio-or-checkbox/likert-radio-or-checkbox.component';
import { MatrixRadioOrCheckboxComponent } from './features/response-ai/response-type/response-types/matrix-radio-or-checkbox/matrix-radio-or-checkbox.component';
import { DropdownSelectionComponent } from './features/response-ai/response-type/response-types/dropdown-selection/dropdown-selection.component';
import { OrgDropdownlistComponent } from './shared/components/org-dropdownlist/org-dropdownlist.component';
import { MatFileUploadModule } from 'mat-file-upload';
import { CustomerDetailComponent } from './shared/components/customer-detail/customer-detail.component';
import { CampaignSurveyResponseComponent } from './features/communication-ai/campaign-survey-response/campaign-survey-response.component';
import { EchartsComponent } from './shared/components/echarts/echarts.component';
import { EchartsService } from './shared/components/echarts/echarts.service';
import { ViewLanchedCampComponent } from './features/communication-ai/view-launched-camp/view-launched-camp.component';
import { StatsQuestionComponent } from './features/communication-ai/campaign-survey-response/display-components/stats-question/stats-question.component';
import { StatsTableComponent } from './features/communication-ai/campaign-survey-response/display-components/stats-table/stats-table.component';
import { DateRangeDialogComponent } from './shared/components/dialog/date-range-dialog/date-range-dialog.component';
import { DashboardOrgConfigurationComponent } from './features/client-setup/dashboard-org-configuration/dashboard-org-configuration.component';
import { DataAttributesGroupComponent } from './features/system-admin/customer/data-attributes-group/data-attributes-group.component';
import { DataAttributesComponent } from './shared/components/data-attributes/data-attributes.component';
import { DataAttributeEnumsComponent } from './shared/components/data-attribute-enums/data-attribute-enums.component';
import { ReconcileSysDataAttributesComponent } from './features/client-setup/holding-org/reconcile-sys-data-attributes/reconcile-sys-data-attributes.component';
import { LoadCustomerDataComponent } from './features/client-setup/load-customer-data/load-customer-data.component';
import { AddFabButtonComponent } from './shared/components/buttons/add-button-fab/add-fab-button.component';
import { BaseButtonComponent } from './shared/components/buttons/base-button/base-button.component';
import { EditFabButtonComponent } from './shared/components/buttons/edit-button-fab/edit-fab-button.component';
import { ViewFabButtonComponent } from './shared/components/buttons/view-button-fab/view-fab-button.component';
import { DeleteFabButtonComponent } from './shared/components/buttons/delete-button-fab/delete-fab-button.component';
import { OpenWeblinkFabButtonComponent } from './shared/components/buttons/open-weblink-button-fab/open-weblink-fab-button.component';
import { StatusFabButtonComponent } from './shared/components/buttons/status-button-fab/status-fab-button.component';
import { FabButtonRowComponent } from './shared/components/buttons/fab-button-row/fab-button-row.component';
import { CopyFabButtonComponent } from './shared/components/buttons/copy-button-fab/copy-button-fab.component';
import { PreviewButtonFabComponent } from './shared/components/buttons/preview-button-fab/preview-button-fab.component';
import { TerminateButtonFabComponent } from './shared/components/buttons/terminate-button-fab/terminate-button-fab.component';
import { ResetButtonFabComponent } from './shared/components/buttons/reset-button-fab/reset-button-fab.component';
import { CancelButtonFabComponent } from './shared/components/buttons/cancel-button-fab/cancel-button-fab.component';
import { SaveButtonFabComponent } from './shared/components/buttons/save-button-fab/save-button-fab.component';
import { ShowMoreRightButtonFabComponent } from './shared/components/buttons/show-more-right-button-fab/show-more-right-button-fab.component';
import { DownloadButtonFabComponent } from './shared/components/buttons/download-button-fab/download-button-fab.component';
import { CloseButtonFabComponent } from './shared/components/buttons/close-button-fab/close-button-fab.component';

@NgModule({
  declarations: [
    HomeComponent,
    DashboardComponent,
    HeaderComponent,
    MenuItemComponent,
    MenuItemListComponent,
    TwoLevelMenuComponent,
    ThreeLevelMenuComponent,
    InfoDialogComponent,
    ScheduleDialogComponent,
    EmailTemplateSetupComponent,
    EmailTemplateComponent,
    CampaignMasterSetup,
    CampaignMasterComponent,
    CampMessageEventComponent,
    HoldingOrgSetupComponent,
    SystemDialogComponent,
    BottomSheetDialog,
    HoldingOrgComponent,
    MemberOrgComponent,
    MemberOrgSetupComponent,
    CustomerListComponent,
    UsersSetupComponent,
    UsersComponent,
    RolesSetupComponent,
    RolesComponent,
    DemoDialogComponent,
    ResponseTypeSetupComponent,
    ResponseTypeComponent,
    SurveySetupComponent,
    SurveyComponent,
    SurveyPageComponent,
    SurveySectionComponent,
    SurveyQuestionComponent,
    SingleTextAreaOrInputComponent,
    RatingComponent,
    PreviewResponseTypeComponent,
    BaseTypeComponent,
    MessagesSetupComponent,
    MessageEventsSetupComponent,
    NpsSingleChoiceRadioBoxComponent,
    SingleRowRadioOrCheckboxComponent,
    LikertRadioOrCheckboxComponent,
    MatrixRadioOrCheckboxComponent,
    DropdownSelectionComponent,
    OrgDropdownlistComponent,
    CustomerDetailComponent,
    CampaignSurveyResponseComponent,
    EchartsComponent,
    ViewLanchedCampComponent,
    StatsQuestionComponent,
    StatsTableComponent,
    DashboardOrgConfigurationComponent,
    DateRangeDialogComponent,
    DataAttributesGroupComponent,
    DataAttributesComponent,
    DataAttributeEnumsComponent,
    ReconcileSysDataAttributesComponent,
    LoadCustomerDataComponent,
    AddFabButtonComponent,
    BaseButtonComponent,
    CopyFabButtonComponent,
    EditFabButtonComponent,
    ViewFabButtonComponent,
    DeleteFabButtonComponent,
    OpenWeblinkFabButtonComponent,
    StatusFabButtonComponent,
    FabButtonRowComponent,
    PreviewButtonFabComponent,
    TerminateButtonFabComponent,
    ResetButtonFabComponent,
    CancelButtonFabComponent,
    SaveButtonFabComponent,
    ShowMoreRightButtonFabComponent,
    DownloadButtonFabComponent,
    CloseButtonFabComponent,
  ],
  imports: [
    SharedModule,
    ReactiveFormsModule,
    EmailEditorModule,
    FormsModule,
    DashboardRoutingModule,
    AngularMaterialModule,
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    NgxMatNativeDateModule,
    MatFileUploadModule,
    NgxEchartsModule.forRoot({
      echarts,
    }),
  ],
  providers: [
    DashboardService,
    MenuService,
    DashboardRouteGuard,
    DialogService,
    ClientSetupService,
    CommunicationAIService,
    FeaturesUpdatesGuardService,
    UserManagementService,
    ResponseAIService,
    TemplateFieldValidationService,
    SystemAdminService,
    DatePipe,
    EchartsService,
  ],
  entryComponents: [
    InfoDialogComponent,
    ScheduleDialogComponent,
    SystemDialogComponent,
    BottomSheetDialog,
    DemoDialogComponent,
    DateRangeDialogComponent,
  ],
})
export class DashboardModule {}
