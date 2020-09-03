import { createReducer, on } from '@ngrx/store'
import { AppState } from '../models/app'
import { AppActions } from './app.action-types'

export const initialDashboardState: AppState = {
    sidebarWidth: 75,
    defaultSidebarWidth: 75,
    expandedSidebarWidth: 200,
    loading: false,
    reports: [],
    charts: [],
    timeShortcuts: [],
    statusOptions: {}
}

export const appReducer = createReducer(
    initialDashboardState,
    // on(AppActions.toggleSideBar, (state, action) => {
    //     return {
    //         ...state,
    //         sidebarWidth: state.defaultSidebarWidth + (action.expand ? state.expandedSidebarWidth : 0)
    //     }

    // })
    on(AppActions.startLoading, (state, action) => {
        return { ...state, loading: true }
    }),
    on(AppActions.stopLoading, (state, action) => {
        return { ...state, loading: false }
    }),
    on(AppActions.setReports, (state, action) => {
        return { ...state, reports: action.reports }
    }),
    on(AppActions.setCharts, (state, action) => {
        return { ...state, charts: action.charts }
    }),
    on(AppActions.setTimeShortcuts, (state, action) => {
        return { ...state, timeShortcuts: action.timeShortcuts }
    }),
    on(AppActions.setStatusOptions, (state, action) => {
        return { ...state, statusOptions: action.options }
    }),
    // on(AppActions.moveDashboardTile, (state, action) => {

    //     return state
    // })
)