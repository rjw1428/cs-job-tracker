import { createReducer, on } from '@ngrx/store'
import { DashboardActions } from './dashboard.action-types'
import { DashboardState } from 'src/models/dashboardState'
import { moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop'
import { DashboardColumn } from 'src/models/dashboardColumn'
import { sortFn } from 'src/app/shared/utility'
import { initialLoadingState } from 'src/app/app.reduce'
import { Job } from 'src/models/job'

export const initialDashboardState: DashboardState = {
    columns: [],
    projects: [],
    contractors: [],
    estimators: [],
    boxOptions: [],
    estimateTypes: [],
    selectedJob: null,
    selectedJobFiles: [],
    selectedSingleProposal: null,
    selectedJobHistory: [],
    selectedProposalHistory: [],
    formLoading: false,
    fileTypeOptions: [],
    invites: null,
    filterValue: ""
}


export const dashboardReducer = createReducer(
    initialDashboardState,
    on(DashboardActions.initDashboard, (state) => {
        return state
    }),
    on(DashboardActions.storeContractors, (state, action) => {
        return { ...state, contractors: action.contractors }
    }),
    on(DashboardActions.storeEstimators, (state, action) => {
        return { ...state, estimators: action.estimators }
    }),
    on(DashboardActions.storeEstimateTypes, (state, action) => {
        return { ...state, estimateTypes: action.estimateTypes }
    }),
    on(DashboardActions.storeInvites, (state, action) => {
        return { ...state, invites: action.invites }
    }),
    on(DashboardActions.storeProjects, (state, action) => {
        return { ...state, projects: action.projects }
    }),
    on(DashboardActions.updateColumnInvites, (state, action) => {
        const updateColumn = action.columnId
        return {
            ...state,
            columns: state.columns.map(column => {
                return column.id == updateColumn
                    ? { ...column, items: action.items }
                    : column
            })
        }
    }),
    on(DashboardActions.storeBoxOptions, (state, action) => {
        return { ...state, boxOptions: action.boxOptions }
    }),
    on(DashboardActions.storeDashboardColumns, (state, action) => {
        const sortedCols = action.columns.map(col => {
            const initialSort = localStorage[col.id]
                ? JSON.parse(localStorage[col.id])
                : { key: null, direction: null }

            const sortKey: string = col.sortKey
                ? col.sortKey
                : initialSort.key
                    ? initialSort.key
                    : 'projectName'

            const sortDirection: 'asc' | 'desc' = col.sortDirection
                ? col.sortDirection
                : initialSort.direction
                    ? initialSort.direction
                    : 'asc'
            return {
                ...col,
                sortKey,
                sortDirection
            }
        })
        return { ...state, columns: sortedCols }
    }),
    on(DashboardActions.removeJob, (state, action) => {
        const invites = Object.keys(state.invites)
            .filter(key => +key != action.jobId)
            .map(key => ({ [key]: state.invites[key] }))
            .reduce((acc, cur) => ({ ...acc, ...cur }), {})
        return {
            ...state,
            invites
        }
    }),
    // on(DashboardActions.onColumnSort, (state, action) => {
    //     return {
    //         ...state,
    //         columns: state.columns.map(col => {
    //             if (col.id != action.columnId) return col
    //             const items = [...col.items].sort((a, b) => sortFn(a, b, action.sortKey, action.direction))
    //             return {
    //                 ...col,
    //                 sortKey: action.sortKey,
    //                 sortDirection: action.direction,
    //                 items
    //             }
    //         })
    //     }
    // }),
    on(DashboardActions.storeViewFilesJob, (state, action) => {
        return {
            ...state,
            selectedJob: action.job,
            selectedJobFiles: action.jobFiles
        }
    }),
    on(DashboardActions.clearFileList, (state) => {
        return { ...state, selectedJobFiles: initialDashboardState.selectedJobFiles }
    }),
    on(DashboardActions.deleteFileItem, (state, action) => {
        return {
            ...state,
            selectedJobFiles: state.selectedJobFiles
                .filter(file => file.fileId !== action.file.fileId)
        }
    }),
    on(DashboardActions.updateJob, (state, action) => {
        const oldJob = state.invites[action.job.jobId]
        const newJob = {
            [action.job.jobId]: {
                ...action.job,
                isExpanded: oldJob ? oldJob.isExpanded : false
            }
        }
        return {
            ...state,
            invites: { ...state.invites, ...newJob }
        }
    }),
    on(DashboardActions.applyFilter, (state, action) => {
        return {
            ...state,
            filterValue: action.value
        }
    }),
    on(DashboardActions.storeSelectedProposal, (state, action) => {
        return {
            ...state,
            selectedJob: action.job,
            selectedSingleProposal: action.proposal
        }
    }),
    on(DashboardActions.clearSelectedProposal, (state) => {
        return {
            ...state,
            selectedSingleProposal: initialDashboardState.selectedSingleProposal
        }
    }),
    on(DashboardActions.clearSelectedJobHistory, (state) => {
        return {
            ...state,
            selectedJobHistory: initialDashboardState.selectedJobHistory
        }
    }),
    on(DashboardActions.storeSelectedHistory, (state, action) => {
        return {
            ...state,
            selectedJob: action.job,
            selectedJobHistory: action.transactions
        }
    }),
    on(DashboardActions.storeProposalHistory, (state, action) => {
        return {
            ...state,
            selectedJob: action.job,
            selectedProposalHistory: action.proposals
        }
    }),
    on(DashboardActions.clearSelectedProposalHistory, (state) => {
        return {
            ...state,
            selectedProposalHistory: initialDashboardState.selectedProposalHistory
        }
    }),
    on(DashboardActions.storeFileTypeOptions, (state, action) => {
        return {
            ...state,
            fileTypeOptions: action.fileTypeOptions
        }
    }),
    on(DashboardActions.expandItem, (state, action) => {
        const job = state.invites[action.id]
        const updatedJob = { [action.id]: { ...job, isExpanded: !job.isExpanded } }
        return {
            ...state,
            invites: { ...state.invites, ...updatedJob }
        }
    })
)