import { DashboardState } from './dashboardState';

export interface AppState {
    router: any,
    app: AppState,
    dashboard: DashboardState
}