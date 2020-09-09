import { createFeatureSelector, createSelector } from '@ngrx/store'
import { DashboardState } from 'src/models/dashboardState'
import { AppState } from 'src/models/appState'

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
    dashboardState => dashboardState.columns
)

export const itemsSelector = createSelector(
    selectDashboardState,
    (dashboardState: DashboardState, { columnId }: { columnId: string }) => {
        const matchingCol = dashboardState.columns.find(column => column.id == columnId)
        const items = matchingCol && matchingCol.items
            ? matchingCol.items
                .filter(item => item.currentDashboardColumn == columnId)
                .map(item =>({...item, longName: `${item['contractorName']} ${item['projectName']}`}))
            : []
        return items
    }
)