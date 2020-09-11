import { createFeatureSelector, createSelector } from '@ngrx/store'
import { DashboardState } from 'src/models/dashboardState'
import { AppState } from 'src/models/appState'
import { Job } from 'src/models/job'
import { Proposal } from 'src/models/proposal'

export const selectDashboardState = createFeatureSelector<DashboardState>("dashboard")

export const estimatorsAllSelector = createSelector(
    selectDashboardState,
    dashboardState => dashboardState.estimators
)

export const estimatorsSelector = createSelector(
    selectDashboardState,
    dashboardState => dashboardState.estimators.filter(estimator => !!estimator.isActive)
)

export const estimateTypesSelector = createSelector(
    selectDashboardState,
    dashboardState => dashboardState.estimateTypes
)

export const projectsSelector = createSelector(
    selectDashboardState,
    dashboardState => dashboardState.projects
)

export const contractorsSelector = createSelector(
    selectDashboardState,
    dashboardState => dashboardState.contractors
)

export const columnsSelector = createSelector(
    selectDashboardState,
    dashboardState => dashboardState.columns
)

export const selectedJobSelector = createSelector(
    selectDashboardState,
    dashboardState => dashboardState.selectedJob
)

export const selectedJobFilesSelector = createSelector(
    selectDashboardState,
    dashboardState => dashboardState.selectedJobFiles
)

export const formLoadingSelector = createSelector(
    selectDashboardState,
    dashboardState => dashboardState.formLoading
)

export const itemsSelector = createSelector(
    selectDashboardState,
    (dashboardState: DashboardState, { columnId }: { columnId: string }) => {
        const matchingCol = dashboardState.columns.find(column => column.id == columnId)
        const items = matchingCol && matchingCol.items
            ? matchingCol.items
                .filter(item => item.currentDashboardColumn == columnId)
                .map(item => ({ ...item, longName: `${item['contractorName']} ${item['projectName']}` }))
            : []
        return items
    }
)

export const boxOptionsSelector = createSelector(
    selectDashboardState,
    dashboardState => dashboardState.boxOptions
)

export const statusOptionsSelector = createSelector(
    selectDashboardState,
    (dashboardState: DashboardState, { columnId }: { columnId: string }) => {
        const matchingCol = dashboardState.columns.find(column => column.id == columnId)
        const options = matchingCol && matchingCol.statusOptions
            ? matchingCol.statusOptions
            : []
        return options
    }
)

export const tileColorSelector = createSelector(
    selectDashboardState,
    (dashboardState: DashboardState, { job }: { job: Job }) => {
        if (job.isAlerted) return '#fdfd96'
        const matchingCol = dashboardState.columns.find(column => column.id == job.currentDashboardColumn)
        const matchingOption = matchingCol.statusOptions.find(option => option.id == job.statusId)
        return matchingOption && matchingOption.color ? matchingOption.color : 'white'
    }
)

export const singleProposalSelector = createSelector(
    selectDashboardState,
    dashboardState => {
        const projectValue = dashboardState.selectedSingleProposal.map(estimate => estimate.cost).reduce((acc, cur) => acc + cur, 0)
        const outsourceCost = dashboardState.selectedSingleProposal.map(estimate => estimate.fee).reduce((acc, cur) => acc + cur, 0)
        return {
            estimates: dashboardState.selectedSingleProposal,
            id: null,
            projectValue,
            outsourceCost,
            finalCost: null,
            finalCostNote: null,
            dateSent: null
        } as Proposal
    }
)

export const proposalHistorySelector = createSelector(
    selectDashboardState,
    dashboardState => dashboardState.selectedProposalHistory
)

export const jobHistorySelector = createSelector(
    selectDashboardState,
    dashboardState => dashboardState.selectedJobHistory
)