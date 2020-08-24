import { createReducer, on } from '@ngrx/store'
import { DashboardActions } from './dashboard.action-types'
import { DashboardState } from '../models/dashboard'
import { columnIds } from '../models/dashboard-column'

export const initialDashboardState: DashboardState = {
    requery: true,
    columns: [{
        id: columnIds.INVITATION,
        name: "Invitation",
        dataTable: "column_invitation",
        items: [],
        defaultStatusId: 11
    },
    {
        id: columnIds.ESTIMATING,
        name: "Estimating",
        dataTable: "column_estimating",
        items: [],
        defaultStatusId: 3
    },
    {
        id: columnIds.PROPOSAL,
        name: "Proposal Sent",
        dataTable: "column_proposal",
        items: [],
        defaultStatusId: 6,
    },
    {
        id: columnIds.HOLD,
        name: "On Hold",
        dataTable: "column_hold",
        items: [],
        defaultStatusId: 10
    },
    {
        id: columnIds.NOTAWARDED,
        name: "Not Awarded",
        dataTable: "column_not_awarded",
        items: [],
        defaultStatusId: 14,
    },
    {
        id: columnIds.AWARDED,
        name: "Awarded",
        dataTable: "column_awarded",
        items: [],
        defaultStatusId: 12,
    }]
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