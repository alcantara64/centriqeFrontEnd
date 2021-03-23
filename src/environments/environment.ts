// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

/** 10122020 - Gaurav - Added allowConsoleLogs flag to control display of console logs from common.util.ts.
 * This shall prevent any accidental display of consoled information in prod mode
 * 30122020 - Gaurav - Added ngMultiPurposeAppUrl to access the ng-survey app urls */
export const environment = {
  production: false,
  //  apiUrlV1: 'http://localhost:5000',
  apiUrlV1: 'https://app.dev.centriqe.com/api/v2',
  ngMultiPurposeAppUrl: 'http://localhost:4201',
  allowConsoleLogs: true,
  // featureFlags: {
  //   disabledPaths: [
  //     /** response ai configuration menu items */
  //     'responseAI/manageFeedbackMaster',
  //     'responseAI/manageFeedbackSetup',
  //     'responseAI/feedbackCampaignMaster',

  //     /** response ai configuration view items */
  //     'responseAI/feedbackMasterView',
  //     'responseAI/feedbackSetupView',
  //     'responseAI/feedbackCampaignMasterView',
  //     'responseAI/pastCampaignsView',
  //     'responseAI/unsubscribedListView'
  //   ]
  // }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
