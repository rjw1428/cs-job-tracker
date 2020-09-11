import { createAction, props } from '@ngrx/store';
import { Estimator } from 'src/models/estimator';
import { ChartConfig } from 'src/models/chartConfig';
import { TimeShortcut } from 'src/models/timeShortcut';


export const initCharts = createAction(
    "[Charts Component] Fetch Chart Info"
)

export const storeChartConfigs = createAction(
    "[Backend Service (Charts Init)] Store Chart Configs",
    props<{ chartConfigs: ChartConfig[] }>()
)

export const storeTimeShortcuts = createAction(
    "[Backend Service (Charts Init)] Store Time Shortcuts",
    props<{ timeShortcuts: TimeShortcut[] }>()
)

export const setSelectedChartById = createAction(
    "[Charts Effect] Set Initial Chart Id"
)

export const setSelectedChartByIndex = createAction(
    "[Charts Component] Set Selected Chart By Index",
    props<{ index: number }>()
)

export const fetchChartData = createAction(
    "[Charts Effect] Fetch Chart Data"
)

export const addDataToConfig = createAction(
    "[Backend Service (Data Fetch)] Append Data",
    props<{ config: ChartConfig, data: any[] }>()
)

export const setInitialChartId = createAction(
    "[Charts Component] Store Initial Chart ID",
    props<{ chartId: string }>()
)