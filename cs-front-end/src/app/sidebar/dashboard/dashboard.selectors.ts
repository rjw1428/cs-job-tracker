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
    dashboardState => dashboardState.columns.map(col => {
        return {
            ...col,
            itemIdList: (dashboardState.invites && Object.keys(dashboardState.invites).length > 0)
                ? Object.keys(dashboardState.invites)
                    .map(key => +key)
                    .filter(key => dashboardState.invites[key].currentDashboardColumn == col.id)
                    .filter(key => {
                        const jobs = dashboardState.invites
                        const job = jobs[key] as Job
                        const searchString = [job.projectName, job.contactName, job.status, job.assignedToName, job.jobDisplayId].join(" ").toLowerCase()
                        return searchString.includes(dashboardState.filterValue.toLowerCase())
                    })
                : []
        }
    })
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
        if (!dashboardState.invites || Object.keys(dashboardState.invites).length === 0) return []

        const jobs = dashboardState.invites
        const keys = Object.keys(dashboardState.invites)
            .filter(key => dashboardState.invites[key].currentDashboardColumn == columnId)
            .filter(key => {
                const job = jobs[key] as Job
                const searchString = [job.projectName, job.contactName, job.status, job.assignedToName, job.jobDisplayId].join(" ").toLowerCase()
                return searchString.includes(dashboardState.filterValue.toLowerCase())
            })
        const items = keys.map(key => dashboardState.invites[key])
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
    dashboardState => dashboardState.selectedSingleProposal
)

export const proposalHistorySelector = createSelector(
    selectDashboardState,
    dashboardState => dashboardState.selectedProposalHistory
)

export const jobHistorySelector = createSelector(
    selectDashboardState,
    dashboardState => dashboardState.selectedJobHistory
)

export const fileOptionTypesSelector = createSelector(
    selectDashboardState,
    dashboardState => dashboardState.fileTypeOptions
)