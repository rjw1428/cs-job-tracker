import { DashboardColumn } from './dashboardColumn';
import { Contractor } from './contractor';
import { Project } from './project';
import { Estimator } from './estimator';
import { BoxOption } from './boxOption';
import { Job } from './job';
import { EstimateType } from './estimateType';
import { AttachedFile } from './attachedFile';
import { HistoryEntry } from './historyEntry';
import { Proposal } from './proposal';

export interface DashboardState {
    columns: { [id: string]: DashboardColumn };
    contractors: Contractor[]
    projects: Project[]
    estimators: Estimator[]
    // invites: Job[]
    boxOptions: BoxOption[]
    estimateTypes: EstimateType[]
    selectedJob: Job
    selectedJobFiles: AttachedFile[]
    selectedSingleProposal: Proposal
    selectedJobHistory: HistoryEntry[]
    selectedProposalHistory: Proposal[]
    formLoading: boolean
    fileTypeOptions: string[]
    invites: { [jobId: number]: Job },
    filterValue: string
}