import { Job } from './job';

export interface DashboardColumn {
    id: string;
    name: string;
    // dataTable: string;
    items: Job[];
    order: number;
    defaultStatusId: number;
    statusOptions?: { id: number, status: string }[]

    sortKey: string,
    sortDirection: 'asc' | 'desc'
    // queryParams?: {};
}
