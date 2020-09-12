import { createAction, props } from '@ngrx/store';
import { Estimator } from 'src/models/estimator';
import { ChartConfig } from 'src/models/chartConfig';
import { TimeShortcut } from 'src/models/timeShortcut';
import { RawTimeShortcut } from 'src/models/rawTimeShortcut';
import { ReportConfig } from 'src/models/reportConfig';


export const initReports = createAction(
    "[Reports Component] Fetch Chart Info"
)

export const setInitialReportId = createAction(
    "[Reports Component] Store Initial Report ID",
    props<{ reportId: string }>()
)

export const storeReportConfigs = createAction(
    "[Backend Service (Reports Init)] Store Report Configs",
    props<{ reportConfigs: ReportConfig[] }>()
)

export const storeTimeShortcuts = createAction(
    "[Backend Service (Reports Init)] Store Time Shortcuts",
    props<{ timeShortcuts: RawTimeShortcut[] }>()
)

export const setSelectedReportById = createAction(
    "[Reports Effect] Set Initial Report Id"
)

export const setSelectedReportByIndex = createAction(
    "[Reports Component] Set Selected Report By Index",
    props<{ index: number }>()
)

export const fetchReportData = createAction(
    "[Reports Effect] Fetch Report Data"
)

export const addDataToConfig = createAction(
    "[Backend Service (Data Fetch)] Append Data",
    props<{ config: ReportConfig, data: any[] }>()
)



export const setSelectedTime = createAction(
    "[Reports Component] Set timerange",
    props<{ start: number, end: number }>()
)

export const setDefaultChartTime = createAction(
    "[Reports Component] Set default timerange"
)