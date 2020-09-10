import { createAction, props } from '@ngrx/store';
import { Estimator } from 'src/models/estimator';
import { Contractor } from 'src/models/contractor';
import { Project } from 'src/models/project';
import { BidInvite } from 'src/models/bidInvite';
import { BoxOption } from 'src/models/boxOption';
import { DashboardColumn } from 'src/models/dashboardColumn';
import { Job } from 'src/models/job';
import { EstimateType } from 'src/models/estimateType';
import { AttachedFile } from 'src/models/attachedFile';
import { Estimate } from 'src/models/estimate';

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

export const storeViewFilesJob = createAction(
    "[Backend Service (View Files Init)] Store Files for Job",
    props<{ job: Job, jobFiles: AttachedFile[] }>()
)

export const clearFileList = createAction(
    "[Job Item] Cleare Stored Files"
)

export const deleteFileItem = createAction(
    "[View Files Form] Delete file",
    props<{ file: AttachedFile, job: Job }>()
)

export const updateJobItem = createAction(
    "[Job Item] Update Job",
    props<{ job: Job }>()
)

export const highlightJobItem = createAction(
    "[Job Item] Toggle Job Highlight",
    props<{ job: Job }>()
)

export const storeSelectedProposal = createAction(
    "[Job Item] Store Selected Estimates",
    props<{ job: Job, estimates: Estimate[] }>()
)

export const clearSelectedProposal = createAction(
    "[Job Item] Cleare Stored Single Proposal"
)

// export const formStartLoading = createAction(
//     "[Job Board] Start Form Loading"
// )

// export const formStopLoading = createAction(
//     "[Form] Stop Form Loading"
// )
