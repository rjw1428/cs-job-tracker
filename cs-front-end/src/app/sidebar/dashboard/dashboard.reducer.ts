import { createReducer, on } from '@ngrx/store'
import { DashboardActions } from './dashboard.action-types'
import { DashboardState } from 'src/models/dashboardState'
import { moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop'
import { DashboardColumn } from 'src/models/dashboardColumn'
import { sortFn } from 'src/app/shared/utility'
import { initialLoadingState } from 'src/app/app.reduce'

export const initialDashboardState: DashboardState = {
    columns: [],
    projects: [],
    contractors: [],
    estimators: [],
    boxOptions: [],
    estimateTypes: [],
    selectedJob: null,
    selectedJobFiles: [],
    selectedSingleProposal: [],
    selectedJobHistory: [],
    selectedProposalHistory: [],
    formLoading: false,
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
            const items = [...col.items].sort((a, b) => sortFn(a, b, sortKey, sortDirection))
            return {
                ...col,
                sortKey,
                sortDirection,
                items
            }
        })
        return { ...state, columns: sortedCols }
    }),
    on(DashboardActions.deleteJobItem, (state, action) => {
        const updatedColumns = state.columns.map(column => {
            return column.id != action.job.currentDashboardColumn
                ? column
                : { ...column, items: column.items.filter(invite => invite.jobId !== action.job.jobId) }
        })
        return {
            ...state,
            columns: updatedColumns
        }
    }),
    on(DashboardActions.toggleNoBidJobItem, (state, action) => {
        const updatedColumns = state.columns.map(column => {
            return column.id != action.job.currentDashboardColumn
                ? column
                : {
                    ...column,
                    items: column.items.map(job => {
                        if (job.jobId == action.job.jobId) {
                            return { ...job, isNoBid: action.job.isNoBid }
                        }
                        return job
                    })
                }
        })
        return {
            ...state,
            columns: updatedColumns
        }
    }),
    on(DashboardActions.onColumnSort, (state, action) => {
        return {
            ...state,
            columns: state.columns.map(col => {
                if (col.id != action.columnId) return col
                const items = [...col.items].sort((a, b) => sortFn(a, b, action.sortKey, action.direction))
                return {
                    ...col,
                    sortKey: action.sortKey,
                    sortDirection: action.direction,
                    items
                }
            })
        }
    }),
    on(DashboardActions.jobMoved, (state, action) => {
        const sourceColumn = state.columns.find(col => col.id == action.sourceColIndex)
        const targetColumn = state.columns.find(col => col.id == action.targetColIndex)
        let updatedSource = [...sourceColumn.items]
        let updatedTarget = [...targetColumn.items]

        // If Move within the same column
        if (action.sourceColIndex == action.targetColIndex) {
            moveItemInArray(updatedSource, action.sourceOrderIndex, action.targetOrderIndex);
            return {
                ...state,
                columns: state.columns.map(col => {
                    return col.id == action.sourceColIndex
                        ? { ...sourceColumn, items: updatedSource, sortKey: 'manual' }
                        : col
                })
            }
        }
        // Move within different column
        transferArrayItem(
            updatedSource,
            updatedTarget,
            action.sourceOrderIndex,
            action.targetOrderIndex
        );
        return {
            ...state,
            columns: state.columns.map(col => {
                if (col.id == action.sourceColIndex)
                    return { ...sourceColumn, items: updatedSource }
                if (col.id == action.targetColIndex)
                    return { ...targetColumn, items: updatedTarget, sortKey: 'manual' }
                return col
            })
        }
    }),
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
    on(DashboardActions.updateJobItem, (state, action) => {
        const updatedColumns = state.columns.map(column => {
            return column.id != action.job.currentDashboardColumn
                ? column
                : {
                    ...column,
                    items: column.items.map(job => {
                        return (job.jobId == action.job.jobId) ? action.job : job
                    })
                }
        })
        return {
            ...state,
            columns: updatedColumns
        }
    }),
    on(DashboardActions.highlightJobItem, (state, action) => {
        console.log(action.job.isAlerted)
        const updatedColumns = state.columns.map(column => {
            return column.id != action.job.currentDashboardColumn
                ? column
                : {
                    ...column,
                    items: column.items.map(job => job.jobId == action.job.jobId ? action.job : job)
                }
        })
        return {
            ...state,
            columns: updatedColumns
        }
    }),
    on(DashboardActions.storeSelectedProposal, (state, action) => {
        return {
            ...state,
            selectedJob: action.job,
            selectedSingleProposal: action.estimates
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
    })
    // on(DashboardActions.formStartLoading, (state) =>{
    //     return {...state, formLoading: true}
    // }),
    // on(DashboardActions.formStopLoading, (state) =>{
    //     return {...state, formLoading: false}
    // })
)