import { createFeatureSelector, createSelector } from '@ngrx/store'

export const selectAppState = createFeatureSelector<{ loading: boolean }>("app")

export const loadingSelector = createSelector(
    selectAppState,
    appState => appState.loading
)