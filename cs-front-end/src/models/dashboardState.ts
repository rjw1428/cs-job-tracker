import { DashboardColumn } from './dashboardColumn';
import { Contractor } from './contractor';
import { Project } from './project';
import { Estimator } from './estimator';
import { BidInvite } from './bidInvite';
import { BoxOption } from './boxOption';
import { Job } from './job';
import { EstimateType } from './estimate-type';

export interface DashboardState {
    columns: DashboardColumn[];
    requery: boolean;
    contractors: Contractor[]
    projects: Project[]
    estimators: Estimator[]
    // invites: Job[]
    boxOptions: BoxOption[]
    estimateTypes: EstimateType[]
}