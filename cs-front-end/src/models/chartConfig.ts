export class ChartConfig {
    constructor(
        public id: string,
        public type: string,
        public name: string,
        public order: number,
        public storedProcedure: string,
        public defaultTime: string,
        public excludedTimes: string[] = [],
        public seriesName?: string
    ) { }
}
