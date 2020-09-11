import { DashboardState } from './dashboardState';
import { TimeShortcut } from './timeShortcut';

export interface AppState {
    router: any,
    app: { loading: boolean }
    dashboard: DashboardState
}