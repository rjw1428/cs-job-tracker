import { createReducer, on } from '@ngrx/store'
import { ChartConfig } from 'src/models/chartConfig'
import { RawTimeShortcut } from 'src/models/rawTimeShortcut'
import { ReportConfig } from 'src/models/reportConfig'
import { AppActions } from './app.action-types'

export const initialLoadingState: { loading: boolean, chartConfigs: ChartConfig[], reportConfigs: ReportConfig[], timeShortcuts: RawTimeShortcut[] } = {
    loading: false,
    chartConfigs: [],
    reportConfigs: [],
    timeShortcuts: []
}

export const loadingReducer = createReducer(
    initialLoadingState,
    on(AppActions.startLoading, (state) => {
        return { ...state, loading: true }
    }),
    on(AppActions.stopLoading, (state) => {
        return { ...state, loading: false }
    }),
    on(AppActions.storeChartConfigs, (state, actions) => {
        return { ...state, chartConfigs: actions.chartConfigs }
    }),
    on(AppActions.storeReportConfigs, (state, actions) => {
        return { ...state, reportConfigs: actions.reportConfigs }
    }),
    on(AppActions.storeChartConfigs, (state, actions) => {
        return { ...state, chartConfigs: actions.chartConfigs }
    }),
    on(AppActions.storeTimeShortcuts, (state, actions) => {
        return { ...state, timeShortcuts: actions.rawShortcuts }
    })
)