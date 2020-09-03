import { DashboardState } from './dashboard';
import { Report } from '../reports/reports.component';
import { Chart } from '../charts/charts.component';
import { TimeShortcut } from '../filter/filter.component';
export interface AppState {
    sidebarWidth: number
    defaultSidebarWidth: number
    expandedSidebarWidth: number
    loading: boolean
    reports: Report[]
    charts: Chart[]
    timeShortcuts: TimeShortcut[],
    statusOptions: {
        [columnId: string]: {
            id: number,
            status: string
        }[]
    }
}
