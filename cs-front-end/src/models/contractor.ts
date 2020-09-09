export class Contractor {
    constructor(
        public contractorId: number,
        public contractorDateCreated: string,
        public contractorName: string,
        public contactName: string,
        public contactEmail?: string,
        public contactNumber?: string,
    ) { }
}