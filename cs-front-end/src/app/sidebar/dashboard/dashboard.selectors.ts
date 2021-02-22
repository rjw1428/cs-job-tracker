import { createFeatureSelector, createSelector } from '@ngrx/store'
import { DashboardState } from 'src/models/dashboardState'
import { Job } from 'src/models/job'

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
    dashboardState => dashboardState.columns ? Object.values(dashboardState.columns) : []
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
                const searchString = [job.projectName, job.contactName, job.status, job.assignedToName, job.jobDisplayId, job.contractorName, job.projectStreet, job.city, job.state, job.zip].join(" ").toLowerCase()
                return searchString.includes(dashboardState.filterValue.toLowerCase())
            })
        const items = keys
            .map(key => {
                const job = jobs[key] as Job
                const searchString = [job.projectName, job.contactName, job.status, job.assignedToName, job.jobDisplayId, job.contractorName, job.projectStreet, job.city, job.state, job.zip].join(" ").toLowerCase()
                return { ...dashboardState.invites[key], longName: searchString } as Job
            })
            .sort((a, b) => {
                // 11/4/2020, 3:53:57 PM
                const dateA = new Date(a.lastMoveDate)
                const dateB = new Date(b.lastMoveDate)
                return dateB.getTime() - dateA.getTime()

            })
        return items
    }
)

export const boxOptionsSelector = createSelector(
    selectDashboardState,
    (dashboardState: DashboardState, { projectId, showAll }: { projectId: number, showAll: boolean }) => {
        const match = dashboardState.boxOptions.find(option => option.isFull == projectId)
        // Used only when selecting an option fom the job item dropdown
        if (showAll)
            return dashboardState.boxOptions.filter(option => option.isFull == projectId || option.isFull == 0)

        return dashboardState.boxOptions.filter(option => match
            ? option.isFull == projectId
            : option.isFull == 0)
    }
)

export const statusOptionsSelector = createSelector(
    selectDashboardState,
    (dashboardState: DashboardState, { columnId }: { columnId: string }) => {
        const matchingCol = dashboardState.columns[columnId]
        const options = matchingCol && matchingCol.statusOptions
            ? matchingCol.statusOptions
            : []
        return options
    }
)

export const tileColorSelector = createSelector(
    selectDashboardState,
    (dashboardState: DashboardState, { job }: { job: Job }) => {
        if (job.color) return job.color
        if (job.isAlerted) return '#fdfd96'
        const matchingCol = dashboardState.columns[job.currentDashboardColumn]
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