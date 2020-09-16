// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiUrl: 'http://localhost:9000',
  assetPath: '../../assets',
  version: "1.0.0",

  jobsTableName: 'projects_ready_for_proposal',
  dataTableName: 'estimates',
  estimatorsTableName: 'estimators',
  estimatorTableName: 'estimators_active',
  mappingTableName: 'map_estimates_to_jobs',
  proposalTypesTableName: 'options_estimate_types',
  transactionTableName: "job_transactions",
  currentProposalTableName: 'proposals_current',
  proposalSnapshotTableName: 'proposals_snapshot',
  proposalWriteTableName: 'map_proposals_sent',
  awardTimelineTableName: 'awards_timeline',
  jobHistoryTableName: 'job_history',
  jobFileTableName: 'job_files',
  jobIsActiveTableName: 'job_isActive',
  jobFinalCostTableName: 'job_final_cost',
  jobNoBidTableName: 'job_noBid',
  activeProjects: 'projects_active'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
