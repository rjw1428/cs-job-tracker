import { createReducer, on } from '@ngrx/store'
import { DashboardActions } from './dashboard.action-types'
import { DashboardState } from '../models/dashboard'
import { columnIds } from '../models/dashboard-column'

export const initialDashboardState: DashboardState = {
    requery: true,
    columns: [{
        id: columnIds.INVITATION,
        name: "Invitation",
        dataTable: "projects_active",
        items: [],
        defaultStatusId: 11,
        queryParams: { statusId: 11 }
    },
    {
        id: columnIds.ESTIMATING,
        name: "Estimating",
        dataTable: "projects_active",
        items: [],
        defaultStatusId: 3,
        queryParams: { statusId: [2, 3, 4, 5] }
    },
    {
        id: columnIds.PROPOSAL,
        name: "Proposal Sent",
        dataTable: "projects_active",
        items: [],
        defaultStatusId: 6,
        queryParams: { statusId: [6, 7, 8] }
    },
    {
        id: columnIds.HOLD,
        name: "On Hold",
        dataTable: "projects_active",
        items: [],
        defaultStatusId: 10,
        queryParams: { statusId: [9, 10] }
    },
    {
        id: columnIds.NOTAWARDED,
        name: "Not Awarded",
        dataTable: "projects_active",
        items: [],
        defaultStatusId: 14,
        queryParams: { statusId: [1,13,14,15] }
    },
    {
        id: columnIds.AWARDED,
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