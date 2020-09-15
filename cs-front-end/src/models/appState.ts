import { ChartConfig } from './chartConfig';
import { DashboardState } from './dashboardState';
import { RawTimeShortcut } from './rawTimeShortcut';
import { ReportConfig } from './reportConfig';
import { TimeShortcut } from './timeShortcut';

export interface AppState {
    router: any,
    app: { 
        loading: boolean,
        chartConfigs: ChartConfig[],
        reportConfigs: ReportConfig[],
        timeShortcuts: RawTimeShortcut[]
    }
    dashboard: DashboardState
}