export class BidInvite {
    constructor(
        public dateCreated: string,
        public contractorId: number,
        public projectId: number,
        public dateAdded: string,
        public dateDue?: string,
    ) { }
}
