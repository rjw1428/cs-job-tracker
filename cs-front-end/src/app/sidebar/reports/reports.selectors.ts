import { createFeatureSelector, createSelector } from '@ngrx/store'
import { RawTimeShortcut } from 'src/models/rawTimeShortcut'
import { convertRawShortcut } from 'src/app/shared/utility'
import { ReportState } from 'src/models/reportState'

export const initialReportState = createFeatureSelector<ReportState>("reports")

export const reportConfigSelector = createSelector(
    initialReportState,
    reportState => reportState.reportConfigs
)

export const activeIndexSelector = createSelector(
    initialReportState,
    reportState => reportState.activeTab
)

export const selectedReportConfigSelector = createSelector(
    initialReportState,
    reportState => reportState.reportConfigs[reportState.activeTab]
)

export const reportDataForFetchSelector = createSelector(
    initialReportState,
    reportState => ({ ...reportState.selectedTime, config: reportState.reportConfigs[reportState.activeTab] })
)

export const reportSpecificTimeShortcutSelector = createSelector(
    initialReportState,
    reportState => reportState.reportSpecificTimeShortcuts
        .map((shortcut: RawTimeShortcut) => convertRawShortcut(shortcut))
)

export const selectedReportSelector = createSelector(
    initialReportState,
    reportState => {
        return reportState.reportConfigs.length
            ? reportState.reportConfigs[reportState.activeTab]
            : null
    }
)