import { createReducer, on } from '@ngrx/store'
import { DashboardActions } from './dashboard.action-types'
import { DashboardState } from '../models/dashboard'

export const initialDashboardState: DashboardState = {
    requery: true,
    columns: [{
        name: "Invitation",
        dataTable: "projects_active",
        items: [],
        defaultStatusId: 11,
        queryParams: { statusId: 11 }
    },
    {
        name: "Estimating",
        dataTable: "projects_active",
        items: [],
        defaultStatusId: 3,
        queryParams: { statusId: [2, 3, 4, 5] }
    },
    {
        name: "Proposal Sent",
        dataTable: "projects_active",
        items: [],
        defaultStatusId: 6,
        queryParams: { statusId: [6, 7, 8] }
    },
    {
        name: "On Hold",
        dataTable: "projects_active",
        items: [],
        defaultStatusId: 10,
        queryParams: { statusId: [9, 10] }
    },
    {
        name: "No Bid",
        dataTable: "projects_active",
        items: [],
        defaultStatusId: 1,
        queryParams: { statusId: 1 }
    },
    {
        name: "Awarded",
        dataTable: "projects_active",
        items: [],
        defaultStatusId: 12,
        queryParams: { statusId: 12 }
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