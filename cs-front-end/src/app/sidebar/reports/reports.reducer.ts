import { createReducer, on } from '@ngrx/store'
import { ReportActions } from './reports.action-types'

import { ReportState } from 'src/models/reportState';
import { MatTableDataSource } from '@angular/material/table';

export const initialReportState: ReportState = {
    reportConfigs: [],
    selectedTime: { start: null, end: null },
    timeShortcuts: [],
    initialTimeRange: null,
    reportSpecificTimeShortcuts: [],
    activeTab: 0,
    initialConfigId: null
}


export const reportReducer = createReducer(
    initialReportState,
    on(ReportActions.initReports, (state) => state),
    on(ReportActions.storeReportConfigs, (state, action) => {
        return { ...state, reportConfigs: action.reportConfigs }
    }),
    on(ReportActions.storeTimeShortcuts, (state, action) => {
        return { ...state, timeShortcuts: action.timeShortcuts }
    }),
    on(ReportActions.setInitialReportId, (state, action) => {
        return { ...state, initialConfigId: action.reportId }
    }),
    on(ReportActions.setSelectedReportById, (state) => {
        // ONLY RUNS I THERE IS AN ID SET IN URL
        const matchingIndex = state.reportConfigs.findIndex(report => report.id == state.initialConfigId)
        const activeTab = matchingIndex == -1 ? 0 : matchingIndex
        return {
            ...state,
            activeTab,
            initialConfigId: null
        }
    }),
    on(ReportActions.setSelectedReportByIndex, (state, action) => {
        return {
            ...state,
            activeTab: action.index,
            initialTimeRange: state.reportConfigs[action.index].defaultTime
                ? state.reportConfigs[action.index].defaultTime
                : 'last_year'
        }
    }),
    on(ReportActions.addDataToConfig, (state, action) => {
        const displayedColumns = action.data.length ? Object.keys(action.data[0]) : action.config.displayedColumns
        const updatedConfigList = state.reportConfigs.map(config => {
            return config.id == action.config.id
                ? {
                    ...action.config,
                    datasource: new MatTableDataSource(action.data),
                    displayedColumns: displayedColumns
                }
                : config
        })
        const currentConfig = state.reportConfigs[state.activeTab]
        const exclusionList = currentConfig.excludedTimes
            ? currentConfig.excludedTimes
            : []
        return {
            ...state,
            reportConfigs: updatedConfigList,
            reportSpecificTimeShortcuts: state.timeShortcuts.filter(shortcut => !exclusionList.includes(shortcut.id))
        }
    }),
    on(ReportActions.setSelectedTime, (state, action) => {
        return {
            ...state,
            selectedTime: { start: action.start, end: action.end }
        }
    })
)