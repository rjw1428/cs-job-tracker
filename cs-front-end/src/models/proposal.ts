import { Estimate } from './estimate';

export class Proposal {
    constructor(
        public proposalId: number,
        public estimates: Estimate[],
        public finalCost: number,
        public finalCostNote: string,
        public projectValue: number
    ) { }
}