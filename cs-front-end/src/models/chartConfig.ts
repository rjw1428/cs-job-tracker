export class ChartConfig {
    constructor(
        public id: string,
        public chartType: string,
        public name: string,
        public order: number,
        public storedProcedure: string,
        public defaultTime: string,
        public excludedTimes: string[] = [],
        public seriesName?: string,
        public xAxisLabel?: string,
        public yAxisLabel?: string,
        public dataSource?: any[],
        public dataSource1?: any[],
        public dataSource2?: any[]
    ) { }
}