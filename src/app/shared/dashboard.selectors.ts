import { createFeatureSelector, createSelector } from '@ngrx/store';
import { DashboardState } from '../models/dashboard';


export const selectDashboardState = createFeatureSelector<DashboardState>("dashboard")

export const requerySelector = createSelector(
    selectDashboardState,
    dashboardState => dashboardState.requery
)