import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AppState } from '../models/app';


export const selectAppState = createFeatureSelector<AppState>("app")

export const loadingSelector = createSelector(
    selectAppState,
    appState => appState.loading
)

export const currentSidebarWidth = createSelector(
    selectAppState,
    state => state.sidebarWidth - state.defaultSidebarWidth
)


export const defaultSidebarWidth = createSelector(
    selectAppState,
    state => state.defaultSidebarWidth
)

export const sidebarWidth = createSelector(
    selectAppState,
    state => state.sidebarWidth
)

export const chartSelector = createSelector(
    selectAppState,
    state => state.charts
)

export const reportSelector = createSelector(
    selectAppState,
    state => state.reports
)