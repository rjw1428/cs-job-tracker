import { createFeatureSelector, createSelector } from '@ngrx/store'
import { DashboardState } from 'src/models/dashboardState'
import { AppState } from 'src/models/appState'
import { Job } from 'src/models/job'
import { Proposal } from 'src/models/proposal'
import { ChartState } from 'src/models/chartState'
import { RawTimeShortcut } from 'src/models/rawTimeShortcut'
import { convertRawShortcut } from 'src/app/shared/utility'

export const initialChartState = createFeatureSelector<ChartState>("charts")

export const chartConfigSelector = createSelector(
    initialChartState,
    chartState => chartState.chartConfigs
)

export const activeIndexSelector = createSelector(
    initialChartState,
    chartState => chartState.activeTab
)

export const selectedChartConfigSelector = createSelector(
    initialChartState,
    chartState => chartState.chartConfigs[chartState.activeTab]
)

export const chartDataForFetchSelector = createSelector(
    initialChartState,
    chartState => ({ ...chartState.selectedTime, config: chartState.chartConfigs[chartState.activeTab] })
)

export const chartSpecificTimeShortcutSelector = createSelector(
    initialChartState,
    chartState => chartState.chartSpecificTimeShortcuts
    .map((shortcut: RawTimeShortcut) => convertRawShortcut(shortcut))
)