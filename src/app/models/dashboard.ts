import { DashboardColumn } from './dashboard-column';

export interface DashboardState {
    columns: DashboardColumn[];
    requery: boolean;
}
