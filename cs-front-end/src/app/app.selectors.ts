import { createFeatureSelector, createSelector } from '@ngrx/store'
import { ChartConfig } from 'src/models/chartConfig'
import { RawTimeShortcut } from 'src/models/rawTimeShortcut'
import { ReportConfig } from 'src/models/reportConfig'

export const selectAppState = createFeatureSelector<{ 
    loading: boolean 
    chartConfigs: ChartConfig[],
    reportConfigs: ReportConfig[],
    timeShortcuts: RawTimeShortcut[]
}>("app")

export const loadingSelector = createSelector(
    selectAppState,
    appState => appState.loading
)