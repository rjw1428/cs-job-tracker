export class Job {
    constructor(
        public jobId: number,
        public jobDisplayId: string,
        public dateCreated: string,
        public contractorId: number,
        public contractorName: string,
        public contactName: string,
        public contactNumber: string,
        public contactEmail: string,
        public projectId: number,
        public projectName: string,
        public projectStreet: string,
        public city: string,
        public state: string,
        public zip: string,
        public dateAdded: string,
        public dateDue: string,
        public isActive: boolean,
        public currentDashboardColumn: string,
        public isNoBid: boolean,
        public noBidDate: string,
        public estimateCount: number,
        public statusId: number,
        public status: string,
        public fileCount: number,
        public transactionId: number,
        public assignedTo: number,
        public assignedToName: string,
        public box: number,
        public notes: string,
        public reportOnlyNotes: string,
        public historyOnlyNotes: string,
        public isAlerted: boolean,
        public startTime: string,
        public endTime: string,
        public proposalId: number,
        public projectValue: number,
        public dateSent: string,
        public isExpanded: boolean
    ) {}
}