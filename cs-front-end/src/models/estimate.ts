export class Estimate {
    constructor(
        public estimateId: number,
        public mapId: number,
        public type: string,
        public cost: number,
        public dateCreated: string,
        public estimatorId: number,
        public estimator: string,
        public isInHouse: boolean,
        public fee?: number
    ) {}
}