import { createAction, props } from '@ngrx/store';
import { Estimator } from 'src/models/estimator';
import { Contractor } from 'src/models/contractor';
import { Project } from 'src/models/project';
import { BidInvite } from 'src/models/bidInvite';
import { BoxOption } from 'src/models/boxOption';
import { DashboardColumn } from 'src/models/dashboardColumn';
import { Job } from 'src/models/job';
import { EstimateType } from 'src/models/estimate-type';

export const initDashboard = createAction(
    "[Dashboard Component] Fetch Job Info"
)

export const storeEstimators = createAction(
    "[Backend Service (Dashboard Init)] Store Estimators",
    props<{ estimators: Estimator[] }>()
)

export const storeEstimateTypes = createAction(
    '[Backend Service (Estimate Form Init)] Store Estimate Types',
    props<{ estimateTypes: EstimateType[] }>()
)

export const storeContractors = createAction(
    "[Backend Service (Bid Form Init)] Store Contractors",
    props<{ contractors: Contractor[] }>()
)

export const storeProjects = createAction(
    "[Backend Service (Bid Form Init)] Store Projects",
    props<{ projects: Project[] }>()
)

export const updateColumnInvites = createAction(
    "[Backend Service (Dashboard Init)] Update Column Bid Invites",
    props<{ items: Job[], columnId: string }>()
)
export const storeBoxOptions = createAction(
    "[Backend Service (Dashboard Init)] Store Box Options",
    props<{ boxOptions: BoxOption[] }>()
)
export const storeDashboardColumns = createAction(
    "[Backend Service (Dashboard Init)] Store Column Configs",
    props<{ columns: DashboardColumn[] }>()
)

export const deleteJobItem = createAction(
    "[Job Item] Delete Self",
    props<{ job: Job }>()
)

export const toggleNoBidJobItem = createAction(
    "[Job Item] Toggle No Bid Self",
    props<{ job: Job }>()
)

export const jobMoved = createAction(
    "[Job Board] Job Moved",
    props<{
        sourceColIndex: string,
        sourceOrderIndex: number,
        targetColIndex: string,
        targetOrderIndex: number,
        selectedJob: Job
    }>())


export const onColumnSort = createAction(
    "[Job Column] Column Sorted",
    props<{ columnId: string, sortKey: string, direction: 'asc' | 'desc' }>()
)
