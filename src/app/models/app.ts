import { DashboardState } from './dashboard';
import { Report } from '../reports/reports.component';
import { Chart } from '../charts/charts.component';
export interface AppState {
    sidebarWidth: number
    defaultSidebarWidth: number
    expandedSidebarWidth: number
    loading: boolean
    reports: Report[]
    charts: Chart[]
}
