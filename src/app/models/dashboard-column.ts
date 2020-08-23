export interface DashboardColumn {
    id: string;
    name: string;
    dataTable: string;
    items: any[];
    defaultStatusId: number;
    statusOptions?: {id: number, status: string} []
    queryParams: {};
}

export enum columnIds{
    INVITATION = "invitation",
    ESTIMATING = "estimating",
    PROPOSAL = "proposal",
    HOLD = "hold",
    NOTAWARDED = "notAwarded",
    AWARDED = "awarded"
}