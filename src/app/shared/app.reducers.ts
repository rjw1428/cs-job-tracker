import { createReducer, on } from '@ngrx/store'
import { AppState } from '../models/app'
import { AppActions } from './app.action-types'

export const initialDashboardState: AppState = {
    sidebarWidth: 75,
    defaultSidebarWidth: 75,
    expandedSidebarWidth: 200,
    loading: false
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
    })
)