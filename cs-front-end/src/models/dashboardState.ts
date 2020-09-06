import { DashboardColumn } from './dashboardColumn';

export interface DashboardState {
    columns: DashboardColumn[];
    requery: boolean;
}