export interface DashboardColumn {
    id: string;
    name: string;
    dataTable: string;
    items: any[];
    defaultStatusId: number;
    statusOptions?: {id: number, status: string} []
    queryParams?: {};
}
