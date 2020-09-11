export class HistoryEntry {
    constructor(
        public jobId: number,
        public date: string,
        public statusId: number,
        public status: string,
        public boxId: string,
        public note: string,
        public proposalId: number,
        public diff: number
    ) { }
}