import { DashboardState } from './dashboardState';

export interface AppState {
    router: any,
    app: { loading: boolean }
    dashboard: DashboardState
}