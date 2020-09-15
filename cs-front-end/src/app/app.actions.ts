import { createAction, props } from '@ngrx/store'
import { ChartConfig } from 'src/models/chartConfig'
import { RawTimeShortcut } from 'src/models/rawTimeShortcut'
import { ReportConfig } from 'src/models/reportConfig'

export const startLoading = createAction(
    "[Any Component] Start loading"
)

export const stopLoading = createAction(
    "[Any Component] Stop loading"
)

export const initApp = createAction(
    "[App Component] Fetch Reports & Charts"
)

export const storeChartConfigs = createAction(
    "[App Effect] Store Charts",
    props<{ chartConfigs: ChartConfig[] }>()
)

export const storeReportConfigs = createAction(
    "[App Effect] Store Reports",
    props<{ reportConfigs: ReportConfig[] }>()
)

export const storeTimeShortcuts = createAction(
    "[App Effect] Store Time Shortcuts",
    props<{ rawShortcuts: RawTimeShortcut[] }>()
)