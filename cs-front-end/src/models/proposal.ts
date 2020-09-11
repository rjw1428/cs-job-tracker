import { Estimate } from './estimate';

export class Proposal {
    constructor(
        public id: number,
        public estimates: Estimate[],
        public finalCost: number,
        public finalCostNote: string,
        public projectValue: number, 
        public outsourceCost: number,
        public dateSent: string
    ) { }
}