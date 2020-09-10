export class Estimate {
    constructor(
        public mapId: number,
        public jobId: number,
        public estimateId: number,
        public type: string,
        public cost: number,
        public estimateDateCreated: string,
        public estimatorId: number,
        public estimatorName: string,
        public isInHouse: boolean,
        public fee: number
    ) {}
}