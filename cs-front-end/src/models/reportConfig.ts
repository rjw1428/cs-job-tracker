export class ReportConfig {
    constructor(
        public id: string,
        public name: string,
        public storedProcedure: string,
        public order: number,
        public excludedTimes: string[] = [],
        public defaultTime: string,
        public footer?: string
    ) { }
}