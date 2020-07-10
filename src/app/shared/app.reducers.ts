import { createReducer, on } from '@ngrx/store'
import { AppState } from '../models/app'
import { AppActions } from './app.action-types'
import { routerReducer } from '@ngrx/router-store'

export const initialDashboardState: AppState = {
    sidebarWidth: 75,
    defaultSidebarWidth: 75,
    expandedSidebarWidth: 200
}

export const appReducer = createReducer(
    initialDashboardState,
    on(AppActions.toggleSideBar, (state, action) => {
        return {
            ...state,
            sidebarWidth: state.defaultSidebarWidth + (action.expand ? state.expandedSidebarWidth : 0)
        }

    })
)