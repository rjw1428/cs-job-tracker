import { createAction, props } from '@ngrx/store';
import { Chart } from '../charts/charts.component';
import { Report } from '../reports/reports.component';

export const toggleSideBar = createAction(
    "[Sidebar Component] Sidebar size changed",
    props<{ expand: boolean }>()
)

export const startLoading = createAction(
    "[Any Component] Start loading"
)

export const stopLoading = createAction(
    "[Any Component] Stop loading"
)

export const initApp = createAction(
    "[App Component] Fetch Reports & Charts"
)

export const setReports = createAction(
    "[App Effect] Store reports",
    props<{ reports: Report[] }>()
)

export const setCharts = createAction(
    "[App Effect] Store charts",
    props<{ charts: Chart[] }>()
)