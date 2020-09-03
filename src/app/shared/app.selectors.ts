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

export const timeShorcutSelector = createSelector(
    selectAppState,
    state => state.timeShortcuts.map((shortcut: any) => {
        let start = null
        let end = null
        const startFunc = shortcut.start
        if (typeof startFunc == 'string') {
            const terms = startFunc.split("-")
            start = terms.length > 1
                ? (n: Date) => new Date(n.setDate(n.getDate() - +terms[1]))
                : (n: Date) => new Date(n.setDate(n.getDate()))
        }
        else {
            const [year, month, day] = startFunc
            start = () => new Date(year, month, day)
        }
        const endFunc = shortcut.end
        if (typeof endFunc == 'string') {
            const terms = endFunc.split("-")
            end = terms.length > 1
                ? (n: Date) => new Date(n.setDate(n.getDate() - +terms[1]))
                : (n: Date) => new Date(n.setDate(n.getDate()))
        }
        else {
            const [year, month, day] = endFunc
            end = () => new Date(year, month, day)
        }
        return { ...shortcut, start, end }
    })
)