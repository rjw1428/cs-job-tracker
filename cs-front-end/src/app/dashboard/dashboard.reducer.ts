import { createReducer, on } from '@ngrx/store'
import { DashboardActions } from './dashboard.action-types'
import { DashboardState } from 'src/models/dashboardState'

export const initialDashboardState: DashboardState = {
    columns: [],
    requery: false
}


export const dashboardReducer = createReducer(
    initialDashboardState,
    on(DashboardActions.requery, (state, action) => {
        return {
            ...state,
            requery: true
        }
    }),
    on(DashboardActions.requeryComplete, (state) => {
        return {
            ...state,
            requery: false
        }
    })
)