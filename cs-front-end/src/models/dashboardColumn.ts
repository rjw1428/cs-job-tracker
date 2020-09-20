import { Job } from './job';
import { StatusOption } from './statusOption';

export interface DashboardColumn {
    id: string;
    name: string;
    // dataTable: string;
    // items: Job[];
    // itemIdList: { [jobId: number]: number }, // { jobId: Order}
    order: number;
    defaultStatusId: number;
    statusOptions?: StatusOption[]

    sortKey: string,
    sortDirection: 'asc' | 'desc'
    // queryParams?: {};
}
