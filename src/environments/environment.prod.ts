export const environment = {
  production: true,
  apiUrl: 'https://cs-work-tracker.herokuapp.com',
  version: "0.3.0",

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
  jobFileTableName: 'job_files',
  jobIsActiveTableName: 'job_isActive',
  jobFinalCostTableName: 'job_final_cost',
  jobNoBidTableName: 'job_noBid'
};
